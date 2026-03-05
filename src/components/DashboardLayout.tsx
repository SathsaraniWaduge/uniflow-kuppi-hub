import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, LayoutDashboard, Bell, Video, MessageSquare, Settings, LogOut, PlusCircle, Users, FileText, Menu, X, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const studentLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/notices", label: "Notices", icon: Bell },
  { to: "/sessions", label: "Live Sessions", icon: Radio },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const links = profile?.role === "organizer" ? organizerLinks : studentLinks;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex bg-gradient-surface">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0 hidden md:flex">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <BookOpen className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <span className="text-lg font-bold font-display tracking-tight">UniFlow</span>
              <p className="text-[10px] text-sidebar-foreground/40 uppercase tracking-widest">Kuppi Manager</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:translate-x-0.5"
                }`}>
                <link.icon className={`w-4 h-4 ${active ? "text-sidebar-primary" : ""}`} />
                {link.label}
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="w-9 h-9 rounded-full bg-gradient-accent flex items-center justify-center text-xs font-bold text-accent-foreground shadow-sm">
              {profile?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="text-sm">
              <p className="font-medium truncate max-w-[140px]">{profile?.name || "User"}</p>
              <p className="text-sidebar-foreground/40 text-xs capitalize">{profile?.role}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar text-sidebar-foreground p-3 flex items-center justify-between shadow-lg">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-accent-foreground" />
          </div>
          <span className="font-bold font-display">UniFlow</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-sidebar-foreground/70">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-14 left-0 right-0 z-40 bg-sidebar/95 backdrop-blur-xl border-b border-sidebar-border p-4 space-y-1 shadow-xl"
          >
            {links.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50"
                  }`}>
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
            <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground w-full">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="p-6 md:p-8 max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
