import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";

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
    const fetch = async () => {
      const { data } = await supabase
        .from("kuppi_feedback")
        .select("id, comment, rating, created_at, kuppi_sessions(session_date, kuppi_notices(title))")
        .eq("student_id", profile.id)
        .order("created_at", { ascending: false });
      setFeedback((data as any) || []);
      setLoading(false);
    };
    fetch();
  }, [profile]);

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">My Feedback</h1>
        <p className="text-muted-foreground mt-1">Feedback you've submitted for sessions</p>
      </div>

      {feedback.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>You haven't submitted any feedback yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {feedback.map((fb) => (
            <Card key={fb.id} className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base">{fb.kuppi_sessions?.kuppi_notices?.title || "Session"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= fb.rating ? "fill-warning text-warning" : "text-muted"}`} />
                  ))}
                </div>
                {fb.comment && <p className="text-sm text-muted-foreground">{fb.comment}</p>}
                <p className="text-xs text-muted-foreground mt-2">{new Date(fb.created_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
