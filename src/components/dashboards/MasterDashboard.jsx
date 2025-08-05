import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inspectionFormAPI } from '../services/api';
import FormDashboard from './FormDashboard';
import AdminSidebar from './admin/AdminSidebar';
import UserManagement from './admin/user/UserManagement';
import RoleManagement from './admin/RoleManagement';
import FormsAnalytics from './admin/FormsAnalytics';
import AboutUs from './admin/AboutUs';
import LogoManagement from './admin/LogoManagement';
import ListManagement from './admin/ListManagement';
import { FaBars } from 'react-icons/fa';
import { Avatar, Typography, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import qlogo from '../../assets/Qsutra_RMS_White_Logo_Small.png'; // Qsutra logo
const logoUrl = "http://localhost:8080/api/logo";

const MasterDashboard = ({ user, onLogout }) => {
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
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const submittedForms = await inspectionFormAPI.getFormsByStatus('SUBMITTED');
      const allForms = await inspectionFormAPI.getAllForms();

      const sortedForms = [...allForms].sort((a, b) => {
        const dateA = a.reviewedAt || a.submittedAt || new Date(0);
        const dateB = b.reviewedAt || b.submittedAt || new Date(0);
        return new Date(dateB) - new Date(dateA);
      });

      setPendingForms(submittedForms);
      setRecentActivity(sortedForms.slice(0, 5));
      calculateMetrics(allForms);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (forms) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const approvedToday = forms.filter(form => {
        if (!form.reviewedAt || form.status !== 'APPROVED') return false;
        const reviewDate = new Date(form.reviewedAt);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate.getTime() === today.getTime();
      }).length;

      const approvedForms = forms.filter(form =>
        form.status === 'APPROVED' && form.submittedAt && form.reviewedAt
      );

      let totalApprovalTime = 0;
      approvedForms.forEach(form => {
        const submittedTime = new Date(form.submittedAt).getTime();
        const reviewedTime = new Date(form.reviewedAt).getTime();
        totalApprovalTime += (reviewedTime - submittedTime) / (1000 * 60 * 60);
      });

      const avgTime = approvedForms.length > 0
        ? (totalApprovalTime / approvedForms.length).toFixed(1)
        : 0;

      const qualityIssues = forms.filter(form => form.status === 'REJECTED').length;

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
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <FormDashboard user={user} onLogout={onLogout} />;
      case 'logo-mgmt':
        return <LogoManagement />;
      case 'user-management':
        return <UserManagement />;
      case 'list-mgmt':
        return <ListManagement />;
      case 'role-management':
        return <RoleManagement />;
      case 'about-us':
        return <AboutUs />;
        case 'forms-analytics':
      return <FormsAnalytics />;
      default:
        return <FormDashboard user={user} onLogout={onLogout} />;
    }
  };

  // Utilities - FIXED: Use consistent property names
  const userDisplayName = (user?.name || user?.username || 'User')
    .replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Miss|Shri|Smt)\s+/i, ''); // Remove prefixes like App.js

  const profilePhotoUrl = user?.photoUrl || '';
  const userInitials = userDisplayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const getRoleDisplayName = (role) => {
    const upperRole = role?.toUpperCase();
    const roles = {
      SHIFT_INCHARGE: 'Shift Incharge',
      QUALITY_ENGINEER: 'Quality Engineer',
      QUALITY_HOD: 'Quality HOD',
      MASTER: 'Administrator',
      OPERATOR: 'Shift Incharge',
      QA: 'Quality Manager',
      AVP: 'Quality HOD',
      ADMIN: 'Admin',
      MANAGER: 'Manager'
    };
    return roles[upperRole] || (role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : 'User');
  };

  const handleProfilePhotoError = (e) => {
    e.target.onerror = null;
    e.target.src = '';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-background z-50 text-white shadow-md">
        <div className="max-w-full mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarVisible(!sidebarVisible)}
              className="mr-4 text-white hover:text-gray-200 focus:outline-none"
              title="Toggle Sidebar"
            >
              <FaBars size={20} />
            </button>

            {/* Qsutra Logo */}
            <img
              src={qlogo}
              alt="Qsutra logo"
              className="w-23 h-8 mr-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white justify-center pt-1 pb-1 px-4 rounded">
              <img
                src={logoUrl}
                alt="AGI Greenpac Logo"
                className="h-12 max-w-[160px] object-contain"
              />
            </div>

            {/* Avatar - FIXED: Use consistent photo URL logic */}
            {profilePhotoUrl ? (
              <Avatar
                alt={userDisplayName}
                src={profilePhotoUrl}
                onError={handleProfilePhotoError}
                sx={{
                  width: 40,
                  height: 40,
                  border: '2px solid white'
                }}
              />
            ) : user?.id ? (
              <Avatar
                alt={userDisplayName}
                src={`http://localhost:8080/api/users/${user.id}/profile-photo`}
                onError={handleProfilePhotoError}
                sx={{
                  width: 40,
                  height: 40,
                  border: '2px solid white'
                }}
              />
            ) : (
              <Avatar
                alt={userDisplayName}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                  color: 'white',
                  border: '2px solid white',
                  fontWeight: 'bold'
                }}
              >
                {userInitials}
              </Avatar>
            )}

            <div className="flex flex-col mr-4 text-white">
              <Typography variant="body2" className="font-medium text-white">
                {userDisplayName}
              </Typography>
              <Typography variant="caption" className="text-white opacity-90">
                {getRoleDisplayName(user?.role)}
              </Typography>
            </div>

            <Button
              onClick={onLogout}
              variant="contained"
              color="error"
              size="small"
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className="flex flex-1">
        {sidebarVisible && (
          <div className="w-64 bg-white shadow-md border-r">
            <AdminSidebar
              user={user}
              onLogout={onLogout}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>
        )}

        <div className="flex-grow bg-gray-50">
          <DashboardLayout
            title="Master Dashboard"
            subtitle="Manage system users and their permissions

"
          >
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="text-gray-500 ml-4">Loading dashboard data...</p>
                </div>
              ) : (
                renderContent()
              )}
            </div>
          </DashboardLayout>
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;

// Dashboard Layout
export const DashboardLayout = ({ title, subtitle, children }) => {
  return (
    <div className="items-center justify-center px-2 py-6 min-h-full text-center">
      <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
      <p className="text-gray-600 mt-2">{subtitle}</p>
      <div className="mt-6 w-full">
        {children}
      </div>
    </div>
  );
};