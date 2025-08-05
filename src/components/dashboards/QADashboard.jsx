import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inspectionFormAPI } from '../services/api';
import { DashboardLayout, StatusBadge, formatDate } from '../SharedComponents';
import FormDashboard from './FormDashboard';

const QADashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [pendingForms, setPendingForms] = useState([]);
  const [recentForms, setRecentForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // useEffect(() => {
  //   const fetchFormData = async () => {
  //     try {
  //       setLoading(true);
        
  //       // Fetch submitted forms awaiting QA review
  //       const pendingResponse = await inspectionFormAPI.getFormsByStatus('SUBMITTED');
  //       setPendingForms(pendingResponse);
        
  //       // Fetch recently approved/rejected forms
  //       const recentResponse = await inspectionFormAPI.getAllForms();
  //       const recent = recentResponse.filter(form => 
  //         (form.status === 'APPROVED' || form.status === 'REJECTED') && form.reviewedAt
  //       );
        
  //       // Sort by review date
  //       const sortedRecent = recent.sort((a, b) => 
  //         new Date(b.reviewedAt) - new Date(a.reviewedAt)
  //       );
        
  //       setRecentForms(sortedRecent.slice(0, 5));
  //       setError(null);
  //     } catch (error) {
  //       console.error("Error fetching form data:", error);
  //       setError("Failed to load dashboard data. Please try again later.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
    
  //   fetchFormData();
  // }, []);

  return (
    <DashboardLayout 
      user={user} 
      onLogout={onLogout} 
      title="Quality Manager Dashboard"
      subtitle="Review Forms & Submit for Approval"
    >
      <FormDashboard user={user} onLogout={onLogout} />
    </DashboardLayout>
  );
};

export default QADashboard;