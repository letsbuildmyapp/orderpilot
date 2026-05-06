import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { Loading } from "./Loading";

export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, profile, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <Loading />;
  if (!user) {
    return <Navigate to={`/signin?next=${encodeURIComponent(loc.pathname)}`} replace />;
  }
  if (adminOnly && !profile?.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
