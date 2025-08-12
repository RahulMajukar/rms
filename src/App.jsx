import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoginForm from './components/LoginForm';
import OperatorDashboard from './components/dashboards/OperatorDashboard';
import AVPDashboard from './components/dashboards/AVPDashboard';
import MasterDashboard from './components/dashboards/MasterDashboard';
import InspectionFormList from './components/InspectionFormList';
import PrintingInspectionForm from './components/forms/printing-inspection-form/PrintingInspectionForm';
import LineClearanceForm from './components/forms/line_clearance_form/LineClearanceForm';
import { AuthProvider, useAuth } from './components/context/AuthContext';
import { CalendarProvider } from './components/context/CalendarContext';
import QADashboard from './components/dashboards/QADashboard';
import Chatbot from './components/Chatbot';
import CoatingInspectionForm from './components/forms/fair-coating/CoatingInspectionForm';
import QualityInspectionForm from './components/forms/qulality _inspection_form/QualityInspectionForm';
import ProtectedRoute from './components/ProtectedRoute';
import CalendarLayout from './components/calendar/CalendarLayout';
import CalendarView from './components/calendar/CalendarView';
import './App.css'
import logo from './assets/Qsutra_RMS_White_Logo_Small.png';

// Import role utilities
import { 
  getDashboardPath, 
  getRoleDisplayName, 
  isOperator, 
  isQA, 
  isAVP, 
  isMaster,
  isManager,
  isAdmin 
} from './components/utils/roleUtils';

const logoUrl = "http://localhost:8080/api/logo";

// Footer component
const Footer = () => {
  return (
    <footer style={{ background: '#005797' }} className="text-white py-3 text-center w-full mt-auto">
      <div className="container mx-auto">
        <p className="text-xs">
          Intellectual Property of Swajyot Technologies.All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

const InspectionFormLayout = ({ user, onLogout, children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Only show the button if not already on dashboard
  const dashboardPath = getDashboardPath(user);
  const showBackButton = user && location.pathname !== dashboardPath;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="shadow fixed top-0 w-full bg-background z-50">
        <div className="max-w-full mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">

          {/* Left Side - Qsutra Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex justify-center">
              <img
                alt="qustra logo"
                className="w-23 h-8 mr-10"
                src={logo}
              />
            </Link>
            {/* Back to Dashboard Button */}
            {showBackButton && (
              <button
                onClick={() => navigate(dashboardPath)}
                className="ml-4 border border-white text-white text-sm py-1 px-3 rounded hover:bg-white hover:text-blue-600 flex items-center"
              >
                Dashboard
                <ArrowBackIcon fontSize="small" className="ml-1" />
              </button>
            )}
          </div>

          {/* Right Side - AGI Logo + User Info + Calendar + Logout */}
          <div className="flex items-center gap-2">
            {/* AGI Logo */}
            <div className="flex items-center justify-center bg-background bg-white pt-1 pb-1 px-4 rounded ">
             <img
               src={logoUrl}
               alt="AGI Greenpac Logo"
               className="h-12 max-w-[160px] object-contain"
             />
           </div>

            {/* Avatar Icon */}
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              {user?.id ? (
                <img
                  src={`http://localhost:8080/api/users/${user.id}/profile-photo`}
                  alt="User Avatar"
                  className="w-10 h-10 object-cover"
                  onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                />
              ) : (
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>
            <div className="flex flex-col text-white mr-4">
              <p className="text-white font-medium">
                {/* Remove prefix like Mr., Mrs., etc. from user name */}
                {(user?.name || 'Unknown User').replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Miss|Shri|Smt)\s+/i, '')}
              </p>
              <span className="text-xs text-white">
                {getRoleDisplayName(user?.role)}
              </span>
            </div>
            
            {/* Calendar Button */}
            <button
              onClick={() => navigate('/calendar')}
              className="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 rounded mr-2"
            >
              <span className="flex items-center gap-1">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
                Calendar
              </span>
            </button>
            
            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded"
            >
              <span className="flex items-center gap-1">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                </svg>
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-grow">
        {children}
      </div>
      <Footer />
      {user && <Chatbot user={user} />}
    </div>
  );
};

const Layout = ({ children, user }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
      {/* {user && <Chatbot user={user} />} */}
    </div>
  );
};

const AuthRouter = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // console.log('API_URL:', import.meta.env.VITE_API_URL)
    if (loading) return; // Don't do anything while loading

    if (isAuthenticated) {
      // Only redirect if we're at the login page
      if (location.pathname === '/') {
        // Use the centralized getDashboardPath function
        const dashboardPath = getDashboardPath(user);
        if (dashboardPath !== '/') {
          navigate(dashboardPath, { replace: true });
        }
      }
    } else {
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">Loading...</div>
      </Layout>
    );
  }

  return (
    <Routes>
      {/* Authentication Routes */}
      <Route path="/" element={
        <Layout>
          <LoginPage />
        </Layout>
      } />

      {/* Calendar Route - Available to all authenticated users */}
      <Route path="/calendar" element={
        <ProtectedRoute requireAuth={true}>
          <CalendarProvider>
            <CalendarLayout user={user} onLogout={logout}>
              <CalendarView />
            </CalendarLayout>
          </CalendarProvider>
        </ProtectedRoute>
      } />

      {/* Role-based Dashboard Routes - Updated to use role utilities */}
      <Route path="/operator" element={
        isOperator(user?.role) ? (
          <Layout user={user}>
            <OperatorDashboard user={user} onLogout={logout} />
          </Layout>
        ) : <Navigate to="/" replace />
      } />
      
      <Route path="/qa" element={
        isQA(user?.role) ? (
          <Layout user={user}>
            <QADashboard user={user} onLogout={logout} />
          </Layout>
        ) : <Navigate to="/" replace />
      } />
      
      <Route path="/avp" element={
        isAVP(user?.role) ? (
          <Layout user={user}>
            <AVPDashboard user={user} onLogout={logout} />
          </Layout>
        ) : <Navigate to="/" replace />
      } />
      
      <Route path="/master" element={
        isMaster(user?.role) ? (
          <Layout user={user}>
            <MasterDashboard user={user} onLogout={logout} />
          </Layout>
        ) : <Navigate to="/" replace />
      } />

      {/* New routes for additional roles */}
      <Route path="/manager" element={
        isManager(user?.role) ? (
          <Layout user={user}>
            <MasterDashboard user={user} onLogout={logout} />
          </Layout>
        ) : <Navigate to="/" replace />
      } />

      <Route path="/admin" element={
        isAdmin(user?.role) ? (
          <Layout user={user}>
            <MasterDashboard user={user} onLogout={logout} />
          </Layout>
        ) : <Navigate to="/" replace />
      } />

      {/* Form Lists */}
      <Route path="/forms/:formType" element={
        <ProtectedRoute requireAuth={true}>
          <InspectionFormLayout user={user} onLogout={logout}>
            <InspectionFormList />
          </InspectionFormLayout>
        </ProtectedRoute>
      } />

      {/* Coating Inspection Forms */}
      <Route path="/forms/coating/new" element={
        <ProtectedRoute requireAuth={true}>
          <InspectionFormLayout user={user} onLogout={logout}>
            <CoatingInspectionForm isNew={true} />
          </InspectionFormLayout>
        </ProtectedRoute>
      } />
      <Route path="/forms/coating/:id" element={
        <ProtectedRoute requireAuth={true}>
          <InspectionFormLayout user={user} onLogout={logout}>
            <CoatingInspectionForm />
          </InspectionFormLayout>
        </ProtectedRoute>
      } />

      {/* Printing Forms */}
      <Route path="/forms/printing/new" element={
        <ProtectedRoute requireAuth={true}>
          <InspectionFormLayout user={user} onLogout={logout}>
            <PrintingInspectionForm isNew={true} />
          </InspectionFormLayout>
        </ProtectedRoute>
      } />
      <Route path="/forms/printing/:id" element={
        <ProtectedRoute requireAuth={true}>
          <InspectionFormLayout user={user} onLogout={logout}>
            <PrintingInspectionForm />
          </InspectionFormLayout>
        </ProtectedRoute>
      } />

      {/* Line Clearance Forms */}
      <Route path="/forms/clearance/new" element={
        <ProtectedRoute requireAuth={true}>
          <InspectionFormLayout user={user} onLogout={logout}>
            <LineClearanceForm isNew={true} />
          </InspectionFormLayout>
        </ProtectedRoute>
      } />
      <Route path="/forms/clearance/:id" element={
        <ProtectedRoute requireAuth={true}>
          <InspectionFormLayout user={user} onLogout={logout}>
            <LineClearanceForm />
          </InspectionFormLayout>
        </ProtectedRoute>
      } />

      {/* Quality Inspection Forms */}
      <Route path="/forms/quality/new" element={
        <ProtectedRoute requireAuth={true}>
          <InspectionFormLayout user={user} onLogout={logout}>
            <QualityInspectionForm isNew={true} />
          </InspectionFormLayout>
        </ProtectedRoute>
      } />
      <Route path="/forms/quality/:id" element={
        <ProtectedRoute requireAuth={true}>
          <InspectionFormLayout user={user} onLogout={logout}>
            <QualityInspectionForm />
          </InspectionFormLayout>
        </ProtectedRoute>
      } />

      {/* Legacy Routes (keep for backward compatibility) */}
      <Route path="/line-clearance-form" element={
        <ProtectedRoute requireAuth={true}>
          <InspectionFormLayout user={user} onLogout={logout}>
            <LineClearanceForm isNew={true} />
          </InspectionFormLayout>
        </ProtectedRoute>
      } />
      <Route path="/line-clearance-form/:id" element={
        <ProtectedRoute requireAuth={true}>
          <InspectionFormLayout user={user} onLogout={logout}>
            <LineClearanceForm />
          </InspectionFormLayout>
        </ProtectedRoute>
      } />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Login Page
const LoginPage = () => {
  const { login } = useAuth();

  const handleLogin = (userData) => {
    login(userData);
  };

  return <LoginForm onLogin={handleLogin} />;
};

// Main app with auth context provider
const App = () => {
  
  return (
    <AuthProvider>
      <Router>
        <AuthRouter />
      </Router>
    </AuthProvider>
  );
};

export default App;