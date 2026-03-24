import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { query, getModuleById, getById } from "@/mocks/data";
import type { StudentModule, KuppiNotice, KuppiSession, KuppiRecording } from "@/mocks/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, ExternalLink, Calendar, Play, Star, GraduationCap, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import FeedbackModal from "@/components/FeedbackModal";
import heroImg from "@/assets/recordings-hero.jpg";

interface RecordingItem {
  id: string;
  title: string;
  file_url: string;
  uploaded_at: string;
  sessionId: string;
  kuppiTitle: string;
  moduleCode: string;
  moduleName: string;
  sessionDate: string;
  coveredParts: string | null;
  platform: string;
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
        kuppiTitle: notice?.title || rec.title,
        moduleCode: mod?.module_code || "",
        moduleName: mod?.module_name || "",
        sessionDate: session?.session_date || "",
        coveredParts: session?.covered_parts || null,
        platform: session?.platform || "",
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
        <div className="h-40 skeleton-shimmer rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-52 skeleton-shimmer rounded-lg" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden h-44 sm:h-48"
      >
        <img src={heroImg} alt="Students watching recordings" width={1280} height={512} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center h-full px-6 sm:px-8">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-6 h-6 text-secondary" />
            <span className="text-secondary font-semibold text-sm uppercase tracking-wide">UniFlow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-primary-foreground">Recordings Library</h1>
          <p className="text-primary-foreground/70 text-sm mt-1 max-w-md">Watch past kuppi sessions and leave feedback to help organizers improve</p>
        </div>
      </motion.div>

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
              <Card className="glass-card-hover group overflow-hidden">
                {/* Thumbnail area */}
                <div className="relative bg-muted/50 h-36 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
                  <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Play className="w-7 h-7 text-primary ml-0.5" />
                  </div>
                  <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-[10px]">{rec.platform}</Badge>
                  <Badge variant="outline" className="absolute top-3 right-3 bg-card/80 backdrop-blur text-[10px]">{rec.moduleCode}</Badge>
                </div>

                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="font-display text-base leading-snug">{rec.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{rec.moduleName}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(rec.sessionDate).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {rec.coveredParts && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      <span className="font-medium text-foreground/70">Covered:</span> {rec.coveredParts}
                    </p>
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
                      onClick={() => openFeedback(rec.sessionId, rec.kuppiTitle)}
                      className="gap-1"
                    >
                      <MessageSquare className="w-3 h-3" /> Feedback
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
