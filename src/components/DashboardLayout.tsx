import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, LayoutDashboard, Bell, Video, MessageSquare, Settings, LogOut, PlusCircle, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const studentLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/notices", label: "Notices", icon: Bell },
  { to: "/recordings", label: "Recordings", icon: Video },
  { to: "/my-feedback", label: "My Feedback", icon: MessageSquare },
];

const organizerLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/create-notice", label: "Create Notice", icon: PlusCircle },
  { to: "/manage-notices", label: "Manage Notices", icon: FileText },
  { to: "/manage-sessions", label: "Sessions", icon: Settings },
  { to: "/manage-recordings", label: "Recordings", icon: Video },
  { to: "/manage-modules", label: "Modules", icon: BookOpen },
  { to: "/manage-students", label: "Students", icon: Users },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const links = profile?.role === "organizer" ? organizerLinks : studentLinks;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0 hidden md:flex">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-accent flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-lg font-bold font-display">UniFlow</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}>
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold">
              {profile?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="text-sm">
              <p className="font-medium truncate max-w-[140px]">{profile?.name || "User"}</p>
              <p className="text-sidebar-foreground/50 text-xs capitalize">{profile?.role}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar text-sidebar-foreground p-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-accent-foreground" />
          </div>
          <span className="font-bold font-display">UniFlow</span>
        </Link>
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-sidebar-foreground/70">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
