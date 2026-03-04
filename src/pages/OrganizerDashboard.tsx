import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Video, Users, Calendar } from "lucide-react";

export default function OrganizerDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ notices: 0, sessions: 0, registrations: 0, recordings: 0 });

  useEffect(() => {
    if (!profile) return;
    const fetchStats = async () => {
      const { count: n } = await supabase.from("kuppi_notices").select("*", { count: "exact", head: true }).eq("created_by", profile.id);
      const { count: s } = await supabase.from("kuppi_sessions").select("*", { count: "exact", head: true }).eq("organizer_id", profile.id);
      const { count: rec } = await supabase.from("kuppi_recordings").select("*", { count: "exact", head: true });
      setStats({ notices: n || 0, sessions: s || 0, registrations: 0, recordings: rec || 0 });
    };
    fetchStats();
  }, [profile]);

  const cards = [
    { label: "Notices Posted", value: stats.notices, icon: Bell, color: "bg-primary/10 text-primary" },
    { label: "Sessions Scheduled", value: stats.sessions, icon: Calendar, color: "bg-accent/10 text-accent" },
    { label: "Total Recordings", value: stats.recordings, icon: Video, color: "bg-success/10 text-success" },
    { label: "Registrations", value: stats.registrations, icon: Users, color: "bg-warning/10 text-warning" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Organizer Dashboard 🎓</h1>
        <p className="text-muted-foreground mt-1">Manage your kuppi sessions</p>
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
          <CardTitle className="font-display">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2">
          <p>• <strong>Create Notice</strong> – Post a new kuppi session notice for a module</p>
          <p>• <strong>Manage Sessions</strong> – Schedule sessions with meeting links</p>
          <p>• <strong>Upload Recordings</strong> – Share recorded sessions with students</p>
          <p>• <strong>Modules</strong> – Add and manage course modules</p>
          <p>• <strong>Students</strong> – Enroll students in modules</p>
        </CardContent>
      </Card>
    </div>
  );
}
