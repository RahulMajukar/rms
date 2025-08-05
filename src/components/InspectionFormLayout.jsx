import React from 'react';
import { useNavigate } from 'react-router-dom';

// This is a wrapper component for the EditableInspectionForm
// It adds the header and navigation
const InspectionFormLayout = ({ user, onLogout, children }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow mb-4 shadow fixed top: 0 w-full">
        <div className="max-w-full mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className="font-bold text-2xl">AGI</div>
            <div className="ml-2 text-sm font-bold">GREENPAC</div>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => navigate(user?.role === 'operator' ? '/operator' : '/avp')}
              className="mr-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-1 px-3 rounded"
            >
              Back to Dashboard
            </button>
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
};

export default InspectionFormLayout;