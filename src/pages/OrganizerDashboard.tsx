import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { count } from "@/mocks/data";
import type { KuppiNotice, KuppiSession } from "@/mocks/data";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Video, Users, Calendar, ArrowRight, PlusCircle, BookOpen, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function OrganizerDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ notices: 0, sessions: 0, registrations: 0, recordings: 0 });

  useEffect(() => {
    if (!profile) return;
    const n = count("kuppi_notices", (x: KuppiNotice) => x.created_by === profile.id);
    const s = count("kuppi_sessions", (x: KuppiSession) => x.organizer_id === profile.id);
    const rec = count("kuppi_recordings");
    setStats({ notices: n, sessions: s, registrations: 0, recordings: rec });
  }, [profile]);

  const cards = [
    { label: "Notices Posted", value: stats.notices, icon: Bell, color: "bg-primary/10 text-primary" },
    { label: "Sessions", value: stats.sessions, icon: Calendar, color: "bg-secondary/15 text-secondary" },
    { label: "Recordings", value: stats.recordings, icon: Video, color: "bg-success/10 text-success" },
    { label: "Registrations", value: stats.registrations, icon: Users, color: "bg-warning/10 text-warning" },
  ];

  const quickActions = [
    { label: "Create Notice", description: "Post a new kuppi session notice", icon: PlusCircle, to: "/create-notice" },
    { label: "Manage Sessions", description: "Schedule sessions & email registrants", icon: Settings, to: "/manage-sessions" },
    { label: "Upload Recordings", description: "Share recorded sessions", icon: Video, to: "/manage-sessions" },
    { label: "Manage Modules", description: "Add and configure course modules", icon: BookOpen, to: "/manage-modules" },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold font-display">Organizer Dashboard 🎓</h1>
        <p className="text-muted-foreground mt-1">Manage your kuppi sessions</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }}>
            <Card className="glass-card-hover">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-3xl font-bold font-display mt-1">{card.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>
        <h2 className="text-lg font-semibold font-display mb-3">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {quickActions.map((qa) => (
            <Link key={qa.to + qa.label} to={qa.to}>
              <Card className="glass-card-hover cursor-pointer group h-full">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                      <qa.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{qa.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{qa.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
