import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role, roles }) => {
  const { user } = useSelector((state) => state.auth);

  // Not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Role check
  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  // Multiple roles check (user + roomLeader)
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;