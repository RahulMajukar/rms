import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Filter, Check, X, FileText, Clock, AlertTriangle, Download, Printer } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { inspectionFormAPI } from './services/api';
import { lineClearanceAPI } from './forms/line_clearance_form/lineClearanceAPI';
import { coatingInspectionAPI } from './forms/fair-coating/coatingInspectionAPI';
import { printingInspectionAPI } from './services/api';
import { QualityInspectionAPI } from './forms/qulality _inspection_form/QualityInspectionAPI';

// Import role utilities
import { 
  isOperator, 
  isQA, 
  isAVP, 
  isMaster,
  isManager,
  isAdmin,
  getDashboardPath 
} from './utils/roleUtils';

const InspectionFormList = () => {
  const { formType } = useParams(); // Get the form type from URL params
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const { user } = useAuth();
  const navigate = useNavigate();

  // Determine actual form type - if not in URL params, use default
  const activeFormType = formType || 'coating';

  // Format the title based on form type
  const getFormTitle = () => {
    switch (activeFormType) {
      case 'coating':
        return 'FIRST ARTICLE INSPECTION REPORT - COATING';
      case 'printing':
        return 'FIRST ARTICLE INSPECTION REPORT - PRINTING';
      case 'clearance':
        return 'Line Clearance Report';
      case 'quality':
        return 'Incoming Quality Inspection Report';
      case 'maintenance':
        return 'Maintenance Request Forms';
      case 'inventory':
        return 'Inventory Report Forms';
      case 'safety':
        return 'Safety Incident Forms';
      case 'training':
        return 'Employee Training Forms';
      default:
        return 'Inspection Forms';
    }
  };

  useEffect(() => {
    fetchForms();
  }, [user, activeFormType]);

  // Define fetchForms inside the component but outside of useEffect
  const fetchForms = async () => {
    try {
      setLoading(true);
      setError(null);

      let data = [];
      let api;

      // Determine which API to use based on form type
      if (activeFormType === 'coating') {
        api = coatingInspectionAPI;
      } else if (activeFormType === 'printing') {
        api = printingInspectionAPI;
      } else if (activeFormType === 'clearance') {
        api = lineClearanceAPI;
      } else if (activeFormType === 'quality') {
        api = QualityInspectionAPI;
      } else {
        // For new form types, you'll need to add corresponding APIs
        // For now, show a placeholder message
        throw new Error(`API for ${activeFormType} forms is not yet implemented`);
      }

      // Filter based on user role using updated role utilities
      if (isOperator(user.role)) {
        // Shift Engineers see their own submissions
        data = await api.getAllReports();
      } else if (isQA(user.role) || isAVP(user.role)) {
        // Quality Managers and HODs see submitted forms that need approval
        data = await api.getAllReports();
      } else if (isMaster(user.role) || isManager(user.role) || isAdmin(user.role)) {
        // Masters, Managers, and Admins see all forms
        data = await api.getAllReports();
      } else {
        // Default case for other roles
        data = await api.getAllReports();
      }

      setForms(data);
      setFilteredForms(data);
      // Reset status filter when form type changes
      setStatusFilter('');
    } catch (err) {
      console.error('Error fetching forms:', err);
      setError(`Failed to load ${activeFormType} forms: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Apply all filters
  useEffect(() => {
    let filtered = [...forms];

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(form =>
        form.status && form.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply date filter if provided
    if (dateRange.from || dateRange.to) {
      const dateField = getDateField();

      if (dateRange.from) {
        filtered = filtered.filter(form =>
          new Date(form[dateField]) >= new Date(dateRange.from)
        );
      }

      if (dateRange.to) {
        filtered = filtered.filter(form =>
          new Date(form[dateField]) <= new Date(dateRange.to)
        );
      }
    }

    setFilteredForms(filtered);
  }, [forms, statusFilter, dateRange, activeFormType]);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setDateRange({ from: '', to: '' });
  };

  // Get form URL based on form type and ID
  const getFormUrl = (formId) => {
    return `/forms/${activeFormType}/${formId}`;
  };

  const handleCreateForm = () => {
    // Create form based on the selected type
    navigate(`/forms/${activeFormType}/new`);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DRAFT':
        return <FileText className="h-4 w-4" />;
      case 'SUBMITTED':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
        return <Check className="h-4 w-4" />;
      case 'REJECTED':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get form-specific field name based on form type
  const getDateField = () => {
    if (activeFormType === 'clearance') {
      return 'reportDate';
    } else if (activeFormType === 'quality') {
      return 'iqcDate';
    } else {
      return 'inspectionDate';
    }
  };

  // Helper to get the appropriate line type data for clearance forms
  const getLineTypeValue = (form) => {
    if (activeFormType === 'clearance') {
      return form.line || form.productionArea || 'N/A';
    } else if (activeFormType === 'coating') {
      return form.lineNo || 'N/A';
    } else if (activeFormType === 'quality') {
      return form.productReceivedFrom || 'N/A';
    }
    return form.lineType || 'N/A';
  };

  // Helper to get the appropriate variant data for clearance forms
  const getVariantValue = (form) => {
    if (activeFormType === 'clearance') {
      return form.newVariantName || form.newVariantDescription || 'N/A';
    } else if (activeFormType === 'coating') {
      return form.variant || 'N/A';
    } else if (activeFormType === 'quality') {
      return form.batchNumber || 'N/A';
    }
    return form.variant || 'N/A';
  };

  // Helper to get the appropriate product data for clearance forms
  const getProductValue = (form) => {
    if (activeFormType === 'clearance') {
      return form.productName || 'N/A';
    } else if (activeFormType === 'coating') {
      return form.product || 'N/A';
    } else if (activeFormType === 'quality') {
      return form.productVariantName || 'N/A';
    }
    return form.product || 'N/A';
  };

  // Generate document number in format AGI-IMS-LCF-Mon-Date
  const generateDocumentNumber = (dateStr) => {
    if (!dateStr) return 'AGI-IMS-N/A';

    // Get the form type prefix
    let prefix = 'AGI-IMS';
    if (activeFormType === 'coating') prefix += '-CTF';
    else if (activeFormType === 'printing') prefix += '-PTF';
    else if (activeFormType === 'clearance') prefix += '-LCF';
    else if (activeFormType === 'quality') prefix += '-IQC';
    else if (activeFormType === 'maintenance') prefix += '-MNT';
    else if (activeFormType === 'inventory') prefix += '-INV';
    else if (activeFormType === 'safety') prefix += '-SAF';
    else if (activeFormType === 'training') prefix += '-TRN';
    else prefix += `-${activeFormType.substring(0, 3).toUpperCase()}`;

    const date = new Date(dateStr);
    const month = date.toLocaleString('default', { month: 'short' }); // e.g., Apr
    const day = String(date.getDate()).padStart(2, '0'); // e.g., 21
    return `${prefix}-${month}-${day}`;
  };

  // Check if user can create forms - Updated to include new roles
  const canCreateForms = () => {
    return isOperator(user.role) || 
           isQA(user.role) || 
           isAVP(user.role) || 
           isMaster(user.role) || 
           isManager(user.role) || 
           isAdmin(user.role);
  };

  // Check if user can review forms
  const canReviewForms = () => {
    return isQA(user.role) || 
           isAVP(user.role) || 
           isMaster(user.role) || 
           isManager(user.role) || 
           isAdmin(user.role);
  };

  return (
    <div className="bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center">
              <Link
                to={getDashboardPath(user)}
                className="mr-4 p-1 rounded-full hover:bg-gray-100"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{getFormTitle()}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  View, filter, and manage {activeFormType} forms
                </p>
              </div>
            </div>

            {canCreateForms() && (
              <button
                onClick={handleCreateForm}
                className="mt-4 sm:mt-0 bg-background hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors"
              >
                Create New {
                  activeFormType === 'coating' ? 'Coating' :
                    activeFormType === 'printing' ? 'Printing' :
                      activeFormType === 'clearance' ? 'Line Clearance' :
                        activeFormType === 'quality' ? 'Quality Inspection' :
                          activeFormType === 'maintenance' ? 'Maintenance' :
                            activeFormType === 'inventory' ? 'Inventory' :
                              activeFormType === 'safety' ? 'Safety' :
                                activeFormType === 'training' ? 'Training' :
                                  activeFormType.charAt(0).toUpperCase() + activeFormType.slice(1)
                } Form
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-500 hover:text-gray-700 flex items-center text-sm font-medium"
            >
              <Filter className="h-4 w-4 mr-1" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {showFilters && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status filter */}
                <div>
                  <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                {/* Date range filter */}
                <div>
                  <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    id="dateFrom"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    id="dateTo"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="p-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {filteredForms.length} of {forms.length} forms
            </div>

            <div className="flex space-x-2">
              {/* Right: Create New Form button */}
              {canCreateForms() && (
                <button
                  onClick={handleCreateForm}
                  className="bg-background hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors"
                >
                  + Create New {
                    activeFormType === 'coating' ? 'Coating' :
                      activeFormType === 'printing' ? 'Printing' :
                        activeFormType === 'clearance' ? 'Line Clearance' :
                          activeFormType === 'quality' ? 'Quality Inspection' :
                            activeFormType === 'maintenance' ? 'Maintenance' :
                              activeFormType === 'inventory' ? 'Inventory' :
                                activeFormType === 'safety' ? 'Safety' :
                                  activeFormType === 'training' ? 'Training' :
                                    activeFormType.charAt(0).toUpperCase() + activeFormType.slice(1)
                  } Form
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Form Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
            <p className="mt-4 text-gray-500">Loading forms...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-800 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : forms.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="rounded-full bg-gray-100 p-3 inline-block mb-4">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No {activeFormType} forms found</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first form</p>
            {canCreateForms() && (
              <button
                onClick={handleCreateForm}
                className="inline-flex items-center px-4 py-2 bg-background text-white rounded-md text-sm font-medium shadow-sm hover:bg-blue-700"
              >
                Create your first {
                  activeFormType === 'coating' ? 'Coating' :
                    activeFormType === 'printing' ? 'Printing' :
                      activeFormType === 'clearance' ? 'Line Clearance' :
                        activeFormType === 'quality' ? 'Quality Inspection' :
                          activeFormType === 'maintenance' ? 'Maintenance' :
                            activeFormType === 'inventory' ? 'Inventory' :
                              activeFormType === 'safety' ? 'Safety' :
                                activeFormType === 'training' ? 'Training' :
                                  activeFormType
                } form
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white overflow-hidden rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document No.
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    {activeFormType !== 'clearance' && (
                      <>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {activeFormType === 'quality' ? 'Batch #' : 'Variant'}
                        </th>
                      </>
                    )}
                    {activeFormType === 'clearance' && (
                      <>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Line Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          New Variant
                        </th>
                      </>
                    )}
                    {activeFormType === 'quality' && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier
                      </th>
                    )}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {canReviewForms() ? 'Submitted By' : 'Reviewed By'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredForms.length === 0 ? (
                    <tr>
                      <td colSpan={(activeFormType === 'clearance' ? 8 : activeFormType === 'quality' ? 7 : 7)} className="px-6 py-4 text-center text-sm text-gray-500">
                        No forms match your filter criteria. <button onClick={clearFilters} className="text-blue-600 hover:text-blue-800">Clear filters</button>
                      </td>
                    </tr>
                  ) : (
                    filteredForms.map((form) => (
                      <tr key={form.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {form.documentNo || generateDocumentNumber(form[getDateField()])}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(form[getDateField()])}
                        </td>
                        {activeFormType !== 'clearance' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getProductValue(form)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getVariantValue(form)}
                            </td>
                          </>
                        )}
                        {activeFormType === 'clearance' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getProductValue(form)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getLineTypeValue(form)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getVariantValue(form)}
                            </td>
                          </>
                        )}
                        {activeFormType === 'quality' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getLineTypeValue(form)}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(form.status)}`}>
                            {getStatusIcon(form.status)}
                            <span className="ml-1">{form.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {canReviewForms() ? form.submittedBy : (form.reviewedBy || '-')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={getFormUrl(form.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {canReviewForms() && form.status === 'SUBMITTED' ? 'Review' : 'View'}
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination (static for demo) */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredForms.length}</span> of{' '}
                    <span className="font-medium">{filteredForms.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <a
                      href="#"
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      1
                    </a>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                      2
                    </span>
                    <a
                      href="#"
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      3
                    </a>
                    <a
                      href="#"
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionFormList;