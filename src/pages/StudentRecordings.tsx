import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, ExternalLink, Calendar } from "lucide-react";

interface RecordingItem {
  id: string;
  title: string;
  file_url: string;
  uploaded_at: string;
  kuppi_sessions: {
    session_date: string;
    covered_parts: string | null;
    platform: string;
    kuppi_notices: {
      title: string;
      modules: { module_code: string; module_name: string } | null;
    } | null;
  } | null;
}

export default function StudentRecordings() {
  const { profile } = useAuth();
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetch = async () => {
      const { data: mods } = await supabase.from("student_modules").select("module_id").eq("student_id", profile.id);
      const moduleIds = mods?.map(m => m.module_id) || [];
      if (moduleIds.length === 0) { setLoading(false); return; }

      // Get notices for enrolled modules
      const { data: noticeIds } = await supabase
        .from("kuppi_notices")
        .select("id")
        .in("module_id", moduleIds);
      
      if (!noticeIds?.length) { setLoading(false); return; }

      // Get sessions for those notices
      const { data: sessionIds } = await supabase
        .from("kuppi_sessions")
        .select("id")
        .in("notice_id", noticeIds.map(n => n.id));

      if (!sessionIds?.length) { setLoading(false); return; }

      const { data } = await supabase
        .from("kuppi_recordings")
        .select("id, title, file_url, uploaded_at, kuppi_sessions(session_date, covered_parts, platform, kuppi_notices(title, modules(module_code, module_name)))")
        .in("session_id", sessionIds.map(s => s.id))
        .order("uploaded_at", { ascending: false });

      setRecordings((data as any) || []);
      setLoading(false);
    };
    fetch();
  }, [profile]);

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">Recordings Library</h1>
        <p className="text-muted-foreground mt-1">Watch past kuppi sessions for your modules</p>
      </div>

      {recordings.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No recordings available yet for your modules.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {recordings.map((rec) => (
            <Card key={rec.id} className="glass-card hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base">{rec.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{rec.kuppi_sessions?.kuppi_notices?.modules?.module_code}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(rec.kuppi_sessions?.session_date || "").toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {rec.kuppi_sessions?.covered_parts && (
                  <p className="text-sm text-muted-foreground mb-3">Covered: {rec.kuppi_sessions.covered_parts}</p>
                )}
                <Button size="sm" variant="outline" asChild>
                  <a href={rec.file_url} target="_blank" rel="noopener noreferrer">
                    <Video className="w-3 h-3 mr-1" /> Watch <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
