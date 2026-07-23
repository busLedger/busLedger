import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../components/providers/AuthProvider";

export const ProtectedRoute = ({ children }) => {
  const { authLoading, isAuthenticated } = useAuth();

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
