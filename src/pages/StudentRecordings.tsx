import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, ExternalLink, Calendar, Play } from "lucide-react";
import { motion } from "framer-motion";

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

      const { data: noticeIds } = await supabase.from("kuppi_notices").select("id").in("module_id", moduleIds);
      if (!noticeIds?.length) { setLoading(false); return; }

      const { data: sessionIds } = await supabase.from("kuppi_sessions").select("id").in("notice_id", noticeIds.map(n => n.id));
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div><div className="h-8 w-48 skeleton-shimmer rounded-lg" /><div className="h-4 w-72 skeleton-shimmer rounded mt-2" /></div>
        <div className="grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map(i => <div key={i} className="h-44 skeleton-shimmer rounded-lg" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">Recordings Library</h1>
        <p className="text-muted-foreground mt-1">Watch past kuppi sessions for your modules</p>
      </div>

      {recordings.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="pt-8 pb-8 text-center">
            <Video className="empty-state-icon" />
            <p className="text-muted-foreground font-medium">No recordings available yet for your modules.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Recordings will appear here after sessions are completed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {recordings.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
            >
              <Card className="glass-card-hover group">
                {/* Thumbnail placeholder */}
                <div className="relative bg-muted/50 h-32 rounded-t-lg flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-primary ml-0.5" />
                  </div>
                  <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-[10px]">
                    {rec.kuppi_sessions?.platform}
                  </Badge>
                </div>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="font-display text-base">{rec.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{rec.kuppi_sessions?.kuppi_notices?.modules?.module_code}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(rec.kuppi_sessions?.session_date || "").toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {rec.kuppi_sessions?.covered_parts && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">Covered: {rec.kuppi_sessions.covered_parts}</p>
                  )}
                  <Button size="sm" className="bg-gradient-primary text-primary-foreground font-medium shadow-sm" asChild>
                    <a href={rec.file_url} target="_blank" rel="noopener noreferrer">
                      <Video className="w-3 h-3 mr-1" /> Watch Now <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
