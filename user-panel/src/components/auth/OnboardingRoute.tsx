import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[220px] w-full items-center justify-center" role="status" aria-label="Checking account">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/signup" replace />;
  if (user.onboardingComplete) return <Navigate to="/home" replace />;

  return <>{children}</>;
}
