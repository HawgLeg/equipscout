import { Navigate } from "react-router-dom";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user has admin role
  const userRole = (session.user as { role?: string }).role;
  if (userRole !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
