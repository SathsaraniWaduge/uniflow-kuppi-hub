import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { query, getById } from "@/mocks/data";
import type { KuppiFeedback, KuppiSession, KuppiNotice } from "@/mocks/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface FeedbackItem {
  id: string;
  comment: string | null;
  rating: number;
  created_at: string;
  kuppi_sessions: {
    session_date: string;
    kuppi_notices: { title: string } | null;
  } | null;
}

export default function StudentFeedback() {
  const { profile } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const raw = query<KuppiFeedback>("kuppi_feedback", (f) => f.student_id === profile.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const items: FeedbackItem[] = raw.map((fb) => {
      const session = getById<KuppiSession>("kuppi_sessions", fb.session_id);
      const notice = session ? getById<KuppiNotice>("kuppi_notices", session.notice_id) : null;
      return {
        id: fb.id,
        comment: fb.comment,
        rating: fb.rating,
        created_at: fb.created_at,
        kuppi_sessions: session ? {
          session_date: session.session_date,
          kuppi_notices: notice ? { title: notice.title } : null,
        } : null,
      };
    });

    setFeedback(items);
    setLoading(false);
  }, [profile]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div><div className="h-8 w-48 skeleton-shimmer rounded-lg" /><div className="h-4 w-72 skeleton-shimmer rounded mt-2" /></div>
        <div className="grid gap-4">{[1, 2].map((i) => <div key={i} className="h-28 skeleton-shimmer rounded-lg" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">My Feedback</h1>
        <p className="text-muted-foreground mt-1">Feedback you've submitted for sessions</p>
      </div>

      {feedback.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="pt-8 pb-8 text-center">
            <MessageSquare className="empty-state-icon" />
            <p className="text-muted-foreground font-medium">You haven't submitted any feedback yet.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">After attending a kuppi session, share your thoughts to help organizers improve!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {feedback.map((fb, i) => (
            <motion.div key={fb.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.35 }}>
              <Card className="glass-card-hover">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-base">{fb.kuppi_sessions?.kuppi_notices?.title || "Session"}</CardTitle>
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
  );
}
