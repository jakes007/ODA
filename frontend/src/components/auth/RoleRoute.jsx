import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RoleRoute({ allowedRoles, children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}