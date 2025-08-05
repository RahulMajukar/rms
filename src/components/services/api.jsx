// api.js - Centralized API service module
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create an axios instance with default configurations
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication API
export const authAPI = {
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/users/login', null, {
        params: { username, password },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Inspection Forms API
export const inspectionFormAPI = {
  getAllForms: async () => {
    try {
      const response = await apiClient.get('/inspection-forms');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getFormById: async (id) => {
    try {
      const response = await apiClient.get(`/inspection-forms/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getFormsByStatus: async (status) => {
    try {
      const response = await apiClient.get(`/inspection-forms/status/${status}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getFormsBySubmitter: async (submitter) => {
    try {
      const response = await apiClient.get(`/inspection-forms/submitter/${submitter}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createForm: async (formData) => {
    try {
      const response = await apiClient.post('/inspection-forms', formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateForm: async (id, formData) => {
    try {
      const response = await apiClient.put(`/inspection-forms/${id}`, formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  submitForm: async (id, submittedBy) => {
    try {
      const response = await apiClient.post(`/inspection-forms/${id}/submit`, null, {
        params: { submittedBy },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  approveForm: async (id, reviewedBy, comments = '') => {
    try {
      const response = await apiClient.post(`/inspection-forms/${id}/approve`, null, {
        params: { reviewedBy, comments },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  rejectForm: async (id, reviewedBy, comments) => {
    try {
      const response = await apiClient.post(`/inspection-forms/${id}/reject`, null, {
        params: { reviewedBy, comments },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  downloadPdf: async (id, username) => {
    try {
      const response = await apiClient.get(`/inspection-forms/${id}/pdf/${username}`, {
        responseType: 'blob',
        headers: { 'Accept': 'application/pdf' },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `inspection_form_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  },

  sendEmailWithPdf: async (id, emailData) => {
    try {
      const response = await apiClient.post(`/inspection-forms/${id}/email-pdf`, emailData);
      return response.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },
};

// Printing Inspection Forms API
// Printing Inspection API
export const printingInspectionAPI = {
  getAllReports: async () => {
    try {
      const response = await apiClient.get('/printing-inspection');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getReportById: async (id) => {
    try {
      const response = await apiClient.get(`/printing-inspection/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getReportsByStatus: async (status) => {
    try {
      const response = await apiClient.get(`/printing-inspection/status`, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createReport: async (reportData) => {
    try {
      const response = await apiClient.post('/printing-inspection', reportData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateReport: async (id, reportData) => {
    try {
      const response = await apiClient.put(`/printing-inspection/${id}`, reportData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  submitReport: async (id, userName) => {
    try {
      const response = await apiClient.put(`/printing-inspection/submit/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  approveReport: async (id, userName, comments = '') => {
    try {
      const response = await apiClient.put(`/printing-inspection/approve/${id}`, null, {
        params: { comments }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  rejectReport: async (id, userName, comments) => {
    try {
      const response = await apiClient.put(`/printing-inspection/reject/${id}`, null, {
        params: { comments }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteReport: async (id) => {
    try {
      await apiClient.delete(`/printing-inspection/${id}`);
      return true;
    } catch (error) {
      throw error;
    }
  },

  downloadPdf: async (id, userName) => {
    try {
      const response = await apiClient.get(`/printing-inspection/pdf/${id}`, {
        responseType: 'blob',
        headers: { 'Accept': 'application/pdf' }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `inspection-report-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  },

  getReportSummary: async () => {
    try {
      const response = await apiClient.get('/printing-inspection/summary');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Line Clearance Forms API
export const lineClearanceAPI = {
  getAllForms: async () => {
    try {
      const response = await apiClient.get('/line-clearance');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getFormById: async (id) => {
    try {
      const response = await apiClient.get(`/line-clearance/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getFormsByStatus: async (status) => {
    try {
      const response = await apiClient.get(`/line-clearance/status/${status}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getFormsBySubmitter: async (submitter) => {
    try {
      const response = await apiClient.get(`/line-clearance/submitter/${submitter}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createForm: async (formData) => {
    try {
      const response = await apiClient.post('/line-clearance', formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateForm: async (id, formData) => {
    try {
      const response = await apiClient.put(`/line-clearance/${id}`, formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  submitForm: async (id, submittedBy) => {
    try {
      const response = await apiClient.post(`/line-clearance/${id}/submit`, null, {
        params: { submittedBy },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  approveForm: async (id, reviewedBy, comments = '') => {
    try {
      const response = await apiClient.post(`/line-clearance/${id}/approve`, null, {
        params: { reviewedBy, comments },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  rejectForm: async (id, reviewedBy, comments) => {
    try {
      const response = await apiClient.post(`/line-clearance/${id}/reject`, null, {
        params: { reviewedBy, comments },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  downloadPdf: async (id, username) => {
    try {
      const response = await apiClient.get(`/line-clearance/${id}/pdf/${username}`, {
        responseType: 'blob',
        headers: { 'Accept': 'application/pdf' },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `line_clearance_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  },

  sendEmailWithPdf: async (id, emailData) => {
    try {
      const response = await apiClient.post(`/line-clearance/${id}/email-pdf`, emailData);
      return response.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },
};

// User Management API
export const userAPI = {
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUsersByRole: async (role) => {
    try {
      const response = await apiClient.get(`/users/role/${role}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Export grouped API modules
export default {
  auth: authAPI,
  inspectionForms: inspectionFormAPI,
  printingForms: printingInspectionAPI,
  lineClearance: lineClearanceAPI,
  users: userAPI,
};