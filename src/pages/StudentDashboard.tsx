import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Video, BookOpen, Star } from "lucide-react";

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
    { label: "My Modules", value: stats.modules, icon: BookOpen, color: "bg-primary/10 text-primary" },
    { label: "Kuppi Notices", value: stats.notices, icon: Bell, color: "bg-accent/10 text-accent" },
    { label: "Recordings", value: stats.recordings, icon: Video, color: "bg-success/10 text-success" },
    { label: "Feedback Given", value: stats.feedback, icon: Star, color: "bg-warning/10 text-warning" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Welcome back, {profile?.name?.split(" ")[0] || "Student"} 👋</h1>
        <p className="text-muted-foreground mt-1">Here's your kuppi session overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.label} className="glass-card hover:shadow-xl transition-shadow">
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
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display">Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2">
          <p>• Browse <strong>Notices</strong> to see upcoming kuppi sessions for your enrolled modules</p>
          <p>• Register for sessions via Google Forms or internal registration</p>
          <p>• Watch <strong>Recordings</strong> of past sessions you might have missed</p>
          <p>• Leave <strong>Feedback</strong> to help organizers improve</p>
        </CardContent>
      </Card>
    </div>
  );
}
