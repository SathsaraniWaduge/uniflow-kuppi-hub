import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { query, getModuleById, getById } from "@/mocks/data";
import type { StudentModule, KuppiNotice, KuppiSession, KuppiRecording } from "@/mocks/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, ExternalLink, Calendar, Play, Star } from "lucide-react";
import { motion } from "framer-motion";
import FeedbackModal from "@/components/FeedbackModal";

interface RecordingItem {
  id: string;
  title: string;
  file_url: string;
  uploaded_at: string;
  sessionId: string;
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
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<{ id: string; title: string }>({ id: "", title: "" });

  useEffect(() => {
    if (!profile) return;
    const mods = query<StudentModule>("student_modules", (m) => m.student_id === profile.id);
    const moduleIds = mods.map((m) => m.module_id);
    if (moduleIds.length === 0) { setLoading(false); return; }

    const notices = query<KuppiNotice>("kuppi_notices", (n) => moduleIds.includes(n.module_id));
    const noticeIds = notices.map((n) => n.id);
    if (noticeIds.length === 0) { setLoading(false); return; }

    const sessions = query<KuppiSession>("kuppi_sessions", (s) => noticeIds.includes(s.notice_id));
    const sessionIds = sessions.map((s) => s.id);
    if (sessionIds.length === 0) { setLoading(false); return; }

    const recs = query<KuppiRecording>("kuppi_recordings", (r) => sessionIds.includes(r.session_id))
      .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());

    const items: RecordingItem[] = recs.map((rec) => {
      const session = getById<KuppiSession>("kuppi_sessions", rec.session_id);
      const notice = session ? getById<KuppiNotice>("kuppi_notices", session.notice_id) : null;
      const mod = notice ? getModuleById(notice.module_id) : null;
      return {
        id: rec.id,
        title: rec.title,
        file_url: rec.file_url,
        uploaded_at: rec.uploaded_at,
        sessionId: rec.session_id,
        kuppi_sessions: session ? {
          session_date: session.session_date,
          covered_parts: session.covered_parts,
          platform: session.platform,
          kuppi_notices: notice ? {
            title: notice.title,
            modules: mod ? { module_code: mod.module_code, module_name: mod.module_name } : null,
          } : null,
        } : null,
      };
    });

    setRecordings(items);
    setLoading(false);
  }, [profile]);

  const openFeedback = (sessionId: string, title: string) => {
    setSelectedSession({ id: sessionId, title });
    setFeedbackOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div><div className="h-8 w-48 skeleton-shimmer rounded-lg" /><div className="h-4 w-72 skeleton-shimmer rounded mt-2" /></div>
        <div className="grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-44 skeleton-shimmer rounded-lg" />)}</div>
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
            <motion.div key={rec.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.35 }}>
              <Card className="glass-card-hover group">
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
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="bg-gradient-primary text-primary-foreground font-medium shadow-sm" asChild>
                      <a href={rec.file_url} target="_blank" rel="noopener noreferrer">
                        <Video className="w-3 h-3 mr-1" /> Watch <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openFeedback(rec.sessionId, rec.kuppi_sessions?.kuppi_notices?.title || rec.title)}
                    >
                      <Star className="w-3 h-3 mr-1" /> Rate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <FeedbackModal
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        sessionId={selectedSession.id}
        sessionTitle={selectedSession.title}
      />
    </div>
  );
}
