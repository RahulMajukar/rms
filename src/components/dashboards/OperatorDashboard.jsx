import React from 'react';
import { DashboardLayout } from '../SharedComponents';
import FormDashboard from './FormDashboard';

const OperatorDashboard = ({ user, onLogout }) => {
  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      title="Shift Engineer Dashboard"
      subtitle="Prepare Forms & Submit for Review "
    >
      <FormDashboard user={user} onLogout={onLogout} />
    </DashboardLayout>
  );
};

export default OperatorDashboard;
