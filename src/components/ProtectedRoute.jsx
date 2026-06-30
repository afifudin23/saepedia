import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Guards private routes. Authorization follows the ACTIVE role, not merely the
// list of roles owned by the user (core business rule).
//
// - not logged in        -> redirect to /login
// - logged in, no active role yet (multi-role) -> redirect to /select-role
// - active role not allowed for this route      -> redirect to own dashboard
export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, activeRole, needsRoleSelection, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page container">
        <div className="empty">Memuat…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (needsRoleSelection) {
    return <Navigate to="/select-role" replace />;
  }

  if (roles && roles.length && !roles.includes(activeRole)) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}
