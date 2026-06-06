import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RoleRoute({ allowedRoles, children }) {
  const { authenticatedUser, authLoading, currentUser } = useAuth();

  if (authLoading) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const adminTestingRole =
    currentUser?.role === 'admin' || authenticatedUser?.role === 'admin';

  if (!allowedRoles.includes(currentUser.role) && !adminTestingRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
