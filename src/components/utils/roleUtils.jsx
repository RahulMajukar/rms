// roleUtils.js - Centralized role management utilities

/**
 * Helper function to normalize role names for backward compatibility
 * @param {string} role - The role to normalize
 * @returns {string} - Normalized role name
 */
export const normalizeRole = (role) => {
  if (!role) return null;
  
  const upperRole = role.toUpperCase();
  
  // Handle both old and new role names
  switch (upperRole) {
    case 'SHIFT_INCHARGE':
    case 'SHIFT_ENGINEER':
      return 'SHIFT_ENGINEER';
    case 'QUALITY_ENGINEER':
    case 'QUALITY_MANAGER':
      return 'QUALITY_MANAGER';
    case 'QUALITY_HOD':
      return 'QUALITY_HOD';
    case 'MASTER':
      return 'MASTER';
    case 'MANAGER':
      return 'MANAGER';
    case 'ADMIN':
      return 'ADMIN';
    case 'USER':
      return 'USER';
    default:
      return upperRole;
  }
};

/**
 * Get display name for role
 * @param {string} role - The role to get display name for
 * @returns {string} - User-friendly role display name
 */
export const getRoleDisplayName = (role) => {
  const normalizedRole = normalizeRole(role);
  
  switch (normalizedRole) {
    case 'SHIFT_ENGINEER':
      return 'Shift Engineer';
    case 'QUALITY_MANAGER':
      return 'Quality Manager';
    case 'QUALITY_HOD':
      return 'Quality HOD';
    case 'MASTER':
      return 'Administrator';
    case 'MANAGER':
      return 'Manager';
    case 'ADMIN':
      return 'Admin';
    case 'USER':
      return 'User';
    // Fallback for old role names
    case 'SHIFT_INCHARGE':
      return 'Shift Engineer';
    case 'QUALITY_ENGINEER':
      return 'Quality Manager';
    default:
      return role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : 'User';
  }
};

/**
 * Role checking utilities with backward compatibility
 */
export const isOperator = (role) => {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'SHIFT_ENGINEER' || role === 'operator';
};

export const isQA = (role) => {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'QUALITY_MANAGER' || role === 'qa';
};

export const isAVP = (role) => {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'QUALITY_HOD' || role === 'avp';
};

export const isMaster = (role) => {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'MASTER' || role === 'master';
};

export const isManager = (role) => {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'MANAGER' || role === 'manager';
};

export const isAdmin = (role) => {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'ADMIN' || role === 'admin';
};

export const isUser = (role) => {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'USER' || role === 'user';
};

/**
 * Get dashboard path based on user role
 * @param {object} user - User object with role property
 * @returns {string} - Dashboard path
 */
export const getDashboardPath = (user) => {
  if (!user) return '/';
  
  if (isOperator(user.role)) return '/operator';
  if (isQA(user.role)) return '/qa';
  if (isAVP(user.role)) return '/avp';
  if (isMaster(user.role)) return '/master';
  if (isManager(user.role)) return '/manager';
  if (isAdmin(user.role)) return '/admin';
  
  return '/';
};

/**
 * All available roles for dropdowns and forms
 */
export const ALL_ROLES = [
  'SHIFT_ENGINEER',
  'QUALITY_MANAGER',
  'QUALITY_HOD',
  'MASTER',
  'MANAGER',
  'ADMIN',
  'USER'
];

/**
 * Role mapping for login form options
 */
export const LOGIN_ROLE_OPTIONS = [
  { value: 'operator', label: 'Shift Engineer', role: 'SHIFT_ENGINEER' },
  { value: 'qa', label: 'Quality Manager', role: 'QUALITY_MANAGER' },
  { value: 'avp', label: 'Quality HOD', role: 'QUALITY_HOD' },
  { value: 'master', label: 'Master', role: 'MASTER' },
  { value: 'manager', label: 'Manager', role: 'MANAGER' },
  { value: 'admin', label: 'Admin', role: 'ADMIN' },
  { value: 'user', label: 'User', role: 'USER' }
];

/**
 * Check if user has permission to access certain features
 * @param {string} userRole - User's role
 * @param {string} requiredRole - Required role level
 * @returns {boolean} - Whether user has permission
 */
export const hasPermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    'USER': 1,
    'SHIFT_ENGINEER': 2,
    'QUALITY_MANAGER': 3,
    'QUALITY_HOD': 4,
    'MANAGER': 5,
    'ADMIN': 6,
    'MASTER': 7
  };
  
  const userLevel = roleHierarchy[normalizeRole(userRole)] || 0;
  const requiredLevel = roleHierarchy[normalizeRole(requiredRole)] || 0;
  
  return userLevel >= requiredLevel;
};

/**
 * Get accessible form types based on user role
 * @param {string} userRole - User's role
 * @returns {Array} - Array of accessible form types
 */
export const getAccessibleFormTypes = (userRole) => {
  const normalizedRole = normalizeRole(userRole);
  
  // All roles have access to these basic forms
  const basicForms = ['quality', 'coating', 'clearance', 'printing'];
  
  switch (normalizedRole) {
    case 'MASTER':
    case 'ADMIN':
      // Masters and Admins have access to all forms
      return [...basicForms, 'maintenance', 'inventory', 'safety', 'training'];
    case 'MANAGER':
    case 'QUALITY_HOD':
      // Managers and HODs have access to most forms
      return [...basicForms, 'maintenance', 'safety'];
    case 'QUALITY_MANAGER':
    case 'SHIFT_ENGINEER':
      // QA and Operators have access to basic operational forms
      return basicForms;
    default:
      return basicForms;
  }
};