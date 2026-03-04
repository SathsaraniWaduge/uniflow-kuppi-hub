import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Video, BookOpen, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ notices: 0, recordings: 0, modules: 0, feedback: 0 });

  useEffect(() => {
    if (!profile) return;
    const fetchStats = async () => {
      const { data: mods } = await supabase.from("student_modules").select("module_id").eq("student_id", profile.id);
      const moduleIds = mods?.map(m => m.module_id) || [];
      
      let noticeCount = 0;
      if (moduleIds.length > 0) {
        const { count } = await supabase.from("kuppi_notices").select("*", { count: "exact", head: true }).in("module_id", moduleIds);
        noticeCount = count || 0;
      }

      const { count: feedbackCount } = await supabase.from("kuppi_feedback").select("*", { count: "exact", head: true }).eq("student_id", profile.id);

      setStats({ notices: noticeCount, recordings: 0, modules: moduleIds.length, feedback: feedbackCount || 0 });
    };
    fetchStats();
  }, [profile]);

  const cards = [
    { label: "My Modules", value: stats.modules, icon: BookOpen, color: "bg-primary/10 text-primary", link: "/notices" },
    { label: "Kuppi Notices", value: stats.notices, icon: Bell, color: "bg-secondary/15 text-secondary", link: "/notices" },
    { label: "Recordings", value: stats.recordings, icon: Video, color: "bg-success/10 text-success", link: "/recordings" },
    { label: "Feedback Given", value: stats.feedback, icon: Star, color: "bg-warning/10 text-warning", link: "/my-feedback" },
  ];

  const quickLinks = [
    { label: "Browse Notices", description: "See upcoming kuppi sessions for your modules", icon: Bell, to: "/notices" },
    { label: "Watch Recordings", description: "Catch up on past sessions you missed", icon: Video, to: "/recordings" },
    { label: "Leave Feedback", description: "Help organizers improve their sessions", icon: Star, to: "/my-feedback" },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold font-display">
          Welcome back, {profile?.name?.split(" ")[0] || "Student"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's your kuppi session overview</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Link to={card.link}>
              <Card className="glass-card-hover cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{card.label}</p>
                      <p className="text-3xl font-bold font-display mt-1">{card.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color} transition-transform group-hover:scale-110`}>
                      <card.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        <h2 className="text-lg font-semibold font-display mb-3">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickLinks.map((ql) => (
            <Link key={ql.to} to={ql.to}>
              <Card className="glass-card-hover cursor-pointer group h-full">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                      <ql.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{ql.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ql.description}</p>
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
