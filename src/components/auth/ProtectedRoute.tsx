
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { isAdmin, loading: isAdminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      navigate("/login", { 
        state: { from: location, message: "Please sign in to access this page" },
        replace: true 
      });
    } else if (!isAdminLoading && requireAdmin && !isAdmin) {
      // Redirect to home if not admin
      navigate("/", { 
        state: { from: location, message: "You don't have permission to access this page" }, 
        replace: true 
      });
    }
  }, [user, isLoading, isAdmin, isAdminLoading, navigate, location, requireAdmin]);

  if (isLoading || (requireAdmin && isAdminLoading)) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blood"></div>
      </div>
    );
  }

  return children || <Outlet />;
}
