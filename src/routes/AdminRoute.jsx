
import { useAuth } from "@/context/AuthContext";
import { useAdminStatus } from "@/hooks/admin/useAdminStatus";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, adminLoading } = useAdminStatus();

  // Esperamos a que termine de cargar la Auth Y la verificación de Admin
  if (authLoading || adminLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#050505]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  // Si no hay usuario o no es admin, rebota al Home
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;