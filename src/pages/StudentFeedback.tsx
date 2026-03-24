import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { query, getById, getModuleById } from "@/mocks/data";
import type { KuppiFeedback, KuppiSession, KuppiNotice, StudentModule, KuppiRecording } from "@/mocks/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import FeedbackModal from "@/components/FeedbackModal";

interface FeedbackItem {
  id: string;
  comment: string | null;
  rating: number;
  created_at: string;
  sessionTitle: string;
  sessionDate: string;
}

interface SessionForFeedback {
  id: string;
  title: string;
  moduleCode: string;
  sessionDate: string;
}

export default function StudentFeedback() {
  const { profile } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [sessionsWithoutFeedback, setSessionsWithoutFeedback] = useState<SessionForFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<{ id: string; title: string }>({ id: "", title: "" });

  const loadData = () => {
    if (!profile) return;

    // Get feedback already given
    const raw = query<KuppiFeedback>("kuppi_feedback", (f) => f.student_id === profile.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const feedbackSessionIds = new Set(raw.map((f) => f.session_id));

    const items: FeedbackItem[] = raw.map((fb) => {
      const session = getById<KuppiSession>("kuppi_sessions", fb.session_id);
      const notice = session ? getById<KuppiNotice>("kuppi_notices", session.notice_id) : null;
      return {
        id: fb.id, comment: fb.comment, rating: fb.rating, created_at: fb.created_at,
        sessionTitle: notice?.title || "Session",
        sessionDate: session?.session_date || "",
      };
    });
    setFeedback(items);

    // Find sessions with recordings that student hasn't given feedback for
    const mods = query<StudentModule>("student_modules", (m) => m.student_id === profile.id);
    const moduleIds = mods.map((m) => m.module_id);
    const notices = query<KuppiNotice>("kuppi_notices", (n) => moduleIds.includes(n.module_id));
    const noticeIds = notices.map((n) => n.id);
    const sessions = query<KuppiSession>("kuppi_sessions", (s) => noticeIds.includes(s.notice_id));

    const pending: SessionForFeedback[] = sessions
      .filter((s) => {
        if (feedbackSessionIds.has(s.id)) return false;
        // Only show sessions that have recordings
        const hasRec = query<KuppiRecording>("kuppi_recordings", (r) => r.session_id === s.id).length > 0;
        return hasRec;
      })
      .map((s) => {
        const notice = getById<KuppiNotice>("kuppi_notices", s.notice_id);
        const mod = notice ? getModuleById(notice.module_id) : null;
        return {
          id: s.id,
          title: notice?.title || "Session",
          moduleCode: mod?.module_code || "",
          sessionDate: s.session_date,
        };
      });

    setSessionsWithoutFeedback(pending);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [profile]);

  const openFeedback = (sessionId: string, title: string) => {
    setSelectedSession({ id: sessionId, title });
    setFeedbackOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div><div className="h-8 w-48 skeleton-shimmer rounded-lg" /><div className="h-4 w-72 skeleton-shimmer rounded mt-2" /></div>
        <div className="grid gap-4">{[1, 2].map((i) => <div key={i} className="h-28 skeleton-shimmer rounded-lg" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">My Feedback</h1>
        <p className="text-muted-foreground mt-1">Rate kuppi sessions and help organizers improve</p>
      </div>

      {/* Sessions awaiting feedback */}
      {sessionsWithoutFeedback.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="text-lg font-semibold font-display mb-3 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-accent" /> Sessions Awaiting Your Feedback
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {sessionsWithoutFeedback.map((s) => (
              <Card key={s.id} className="glass-card-hover border-accent/20">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm">{s.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{s.moduleCode}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(s.sessionDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button size="sm" className="bg-gradient-accent text-accent-foreground font-semibold shrink-0" onClick={() => openFeedback(s.id, s.title)}>
                      <Star className="w-3.5 h-3.5 mr-1" /> Rate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Past feedback */}
      <div>
        <h2 className="text-lg font-semibold font-display mb-3">Your Past Feedback</h2>
        {feedback.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="pt-8 pb-8 text-center">
              <MessageSquare className="empty-state-icon" />
              <p className="text-muted-foreground font-medium">You haven't submitted any feedback yet.</p>
              <p className="text-sm text-muted-foreground/60 mt-1">After watching a kuppi recording, share your thoughts!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {feedback.map((fb, i) => (
              <motion.div key={fb.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.35 }}>
                <Card className="glass-card-hover">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-display text-base">{fb.sessionTitle}</CardTitle>
                      <span className="text-xs text-muted-foreground">{new Date(fb.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-4 h-4 transition-colors ${s <= fb.rating ? "fill-warning text-warning" : "text-muted-foreground/20"}`} />
                      ))}
                      <span className="text-xs text-muted-foreground ml-2">{fb.rating}/5</span>
                    </div>
                    {fb.comment && <p className="text-sm text-muted-foreground leading-relaxed">{fb.comment}</p>}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <FeedbackModal
        open={feedbackOpen}
        onOpenChange={(o) => {
          setFeedbackOpen(o);
          if (!o) loadData();
        }}
        sessionId={selectedSession.id}
        sessionTitle={selectedSession.title}
      />
    </div>
  );
}
