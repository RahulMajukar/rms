import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inspectionFormAPI } from '../services/api';
import { DashboardLayout, formatTimestamp } from '../SharedComponents';
import FormDashboard from './FormDashboard';

const AVPDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [pendingForms, setPendingForms] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [metrics, setMetrics] = useState({
    approvedToday: 0,
    avgApprovalTime: 0,
    qualityIssues: 0,
    complianceRate: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch forms pending approval
        const submittedForms = await inspectionFormAPI.getFormsByStatus('SUBMITTED');
        setPendingForms(submittedForms);

        // Fetch recent form activity
        const allForms = await inspectionFormAPI.getAllForms();

        // Sort forms by most recently updated
        const sortedForms = [...allForms].sort((a, b) => {
          const dateA = a.reviewedAt || a.submittedAt || new Date(0);
          const dateB = b.reviewedAt || b.submittedAt || new Date(0);
          return new Date(dateB) - new Date(dateA);
        });

        setRecentActivity(sortedForms.slice(0, 5)); // Get only the 5 most recent

        // Calculate metrics
        calculateMetrics(allForms);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate dashboard metrics
  const calculateMetrics = (forms) => {
    try {
      // Get today's date at midnight for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Forms approved today
      const approvedToday = forms.filter(form => {
        if (!form.reviewedAt || form.status !== 'APPROVED') return false;
        const reviewDate = new Date(form.reviewedAt);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate.getTime() === today.getTime();
      }).length;

      // Calculate average approval time (in hours)
      const approvedForms = forms.filter(form =>
        form.status === 'APPROVED' && form.submittedAt && form.reviewedAt
      );

      let totalApprovalTime = 0;

      approvedForms.forEach(form => {
        const submittedTime = new Date(form.submittedAt).getTime();
        const reviewedTime = new Date(form.reviewedAt).getTime();
        const diffHours = (reviewedTime - submittedTime) / (1000 * 60 * 60);
        totalApprovalTime += diffHours;
      });

      const avgTime = approvedForms.length > 0
        ? (totalApprovalTime / approvedForms.length).toFixed(1)
        : 0;

      // Count quality issues (rejected forms)
      const qualityIssues = forms.filter(form => form.status === 'REJECTED').length;

      // Calculate compliance rate
      const decidedForms = forms.filter(form =>
        form.status === 'APPROVED' || form.status === 'REJECTED'
      );

      const complianceRate = decidedForms.length > 0
        ? ((decidedForms.length - qualityIssues) / decidedForms.length * 100).toFixed(1)
        : 100;

      setMetrics({
        approvedToday,
        avgApprovalTime: avgTime,
        qualityIssues,
        complianceRate
      });

    } catch (error) {
      console.error('Error calculating metrics:', error);
      // Set default values if calculation fails
      setMetrics({
        approvedToday: 0,
        avgApprovalTime: 0,
        qualityIssues: 0,
        complianceRate: 0
      });
    }
  };

  // Handle navigation to review a form
  const handleReviewForm = (formId) => {
    navigate(`/inspection-form/${formId}`);
  };

  // Handle navigation to all forms
  const handleViewAllForms = () => {
    navigate('/forms');
  };

  // Get activity description
  const getActivityDescription = (form) => {
    if (form.status === 'APPROVED') {
      return `Document No. ${form.documentNo} approved`;
    } else if (form.status === 'REJECTED') {
      return `Document No. ${form.documentNo} rejected`;
    } else if (form.status === 'SUBMITTED') {
      return `Document No. ${form.documentNo} submitted for approval`;
    } else {
      return `Document No. ${form.documentNo} created`;
    }
  };

  // Get the person who performed the action
  const getActivityPerson = (form) => {
    if (form.status === 'APPROVED' || form.status === 'REJECTED') {
      return `By ${form.reviewedBy}`;
    } else if (form.status === 'SUBMITTED') {
      return `By ${form.submittedBy}`;
    } else {
      return `By ${form.productionOperator || 'Unknown'}`;
    }
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      title="Quality HOD Dashboard"
      subtitle="Review & Approve Forms"
    >
      <FormDashboard user={user} onLogout={onLogout} />
    </DashboardLayout>
  );
};

export default AVPDashboard;