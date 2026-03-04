import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "./DashboardLayout";

interface Props {
  children: React.ReactNode;
  role?: "student" | "organizer";
}

export default function ProtectedRoute({ children, role }: Props) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (role && profile?.role !== role) return <Navigate to="/dashboard" replace />;

  return <DashboardLayout>{children}</DashboardLayout>;
}
