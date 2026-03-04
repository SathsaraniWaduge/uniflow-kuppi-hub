import { useAuth } from "@/hooks/useAuth";
import StudentDashboard from "./StudentDashboard";
import OrganizerDashboard from "./OrganizerDashboard";

export default function Dashboard() {
  const { profile } = useAuth();
  if (profile?.role === "organizer") return <OrganizerDashboard />;
  return <StudentDashboard />;
}
