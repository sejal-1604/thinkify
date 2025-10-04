import { Navigate } from 'react-router-dom';
import useThinkify from '../hooks/useThinkify';

/**
 * Protected Route Component for Role-Based Access Control
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {Array<string>} props.allowedRoles - Array of roles that can access this route
 * @param {Array<string>} props.requiredPermissions - Array of permissions required to access this route
 * @param {string} props.redirectTo - Path to redirect to if unauthorized (default: '/login')
 * @param {React.ReactNode} props.fallback - Component to show while loading
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requiredPermissions = [],
  redirectTo = '/login',
  fallback = null 
}) => {
  const { user, isAuthenticated, loading } = useThinkify();
  
  // Show loading state while authentication is being checked
  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect based on user role if they don't have access
    const roleRedirects = {
      'student': '/profile',
      'teacher': '/teacher/dashboard',
      'admin': '/dashboard'
    };
    
    const defaultRedirect = roleRedirects[user?.role] || '/unauthorized';
    return <Navigate to={defaultRedirect} replace />;
  }
  
  // Check permission-based access
  if (requiredPermissions.length > 0) {
    // Admin has all permissions
    if (user?.role !== 'admin') {
      const userPermissions = user?.permissions || [];
      const hasAllPermissions = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );
      
      if (!hasAllPermissions) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }
  
  // User is authorized, render children
  return children;
};

/**
 * Convenience components for common role combinations
 */
export const StudentOnlyRoute = ({ children, ...props }) => (
  <ProtectedRoute allowedRoles={['student']} {...props}>
    {children}
  </ProtectedRoute>
);

export const TeacherOnlyRoute = ({ children, ...props }) => (
  <ProtectedRoute allowedRoles={['teacher']} {...props}>
    {children}
  </ProtectedRoute>
);

export const AdminOnlyRoute = ({ children, ...props }) => (
  <ProtectedRoute allowedRoles={['admin']} {...props}>
    {children}
  </ProtectedRoute>
);

export const TeacherOrAdminRoute = ({ children, ...props }) => (
  <ProtectedRoute allowedRoles={['teacher', 'admin']} {...props}>
    {children}
  </ProtectedRoute>
);

export const StudentOrTeacherRoute = ({ children, ...props }) => (
  <ProtectedRoute allowedRoles={['student', 'teacher']} {...props}>
    {children}
  </ProtectedRoute>
);

export const AllRolesRoute = ({ children, ...props }) => (
  <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']} {...props}>
    {children}
  </ProtectedRoute>
);

/**
 * Permission-based route protection
 */
export const PermissionBasedRoute = ({ children, permissions, ...props }) => (
  <ProtectedRoute requiredPermissions={permissions} {...props}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
