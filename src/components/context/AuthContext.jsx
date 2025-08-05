import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the authentication context
const AuthContext = createContext(null);

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to normalize role names for backward compatibility
const normalizeRole = (role) => {
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

// Provider component that wraps your app and makes auth object available to any
// child component that calls useAuth().
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // This effect runs only once when the component mounts
  useEffect(() => {
    // Check if user is stored in localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        // Normalize the role for backward compatibility
        if (userData.role) {
          userData.role = normalizeRole(userData.role);
        }
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = (userData) => {
    // Remove prefix (e.g., "Mr. ", "Ms. ", "Mrs. ", etc.) from the name
    const cleanedUserData = {
      ...userData,
      name: userData.name ? userData.name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s+/i, '') : '',
      role: normalizeRole(userData.role) // Normalize role on login
    };
    setUser(cleanedUserData);
    localStorage.setItem('user', JSON.stringify(cleanedUserData));
    return true;
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Compute authentication properties based on the user's normalized role
  const isAuthenticated = !!user;
  
  // Updated role checks to use new role names while maintaining backward compatibility
  const isOperator = user && (
    user.role === 'SHIFT_ENGINEER' || 
    user.role === 'SHIFT_INCHARGE' || 
    user.role === 'shift_engineer' || 
    user.role === 'shift_incharge'
  );
  
  const isQA = user && (
    user.role === 'QUALITY_MANAGER' || 
    user.role === 'QUALITY_ENGINEER' || 
    user.role === 'quality_manager' || 
    user.role === 'quality_engineer'
  );
  
  const isAVP = user && (
    user.role === 'QUALITY_HOD' || 
    user.role === 'quality_hod'
  );
  
  const isMaster = user && (
    user.role === 'MASTER' || 
    user.role === 'master'
  );

  const isManager = user && (
    user.role === 'MANAGER' || 
    user.role === 'manager'
  );

  const isAdmin = user && (
    user.role === 'ADMIN' || 
    user.role === 'admin'
  );

  const isUser = user && (
    user.role === 'USER' || 
    user.role === 'user'
  );

  // AuthContext value - we only create this object once per render
  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isOperator,
    isQA,
    isAVP,
    isMaster,
    isManager,
    isAdmin,
    isUser,
    loading,
    normalizeRole // Export this utility for use in other components
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;