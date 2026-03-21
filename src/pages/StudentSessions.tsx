import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { query, getById } from "@/mocks/data";
import type { KuppiRegistration, KuppiSession, KuppiNotice, Module } from "@/mocks/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, Video, Radio, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface SessionItem {
  id: string;
  session_date: string;
  session_time: string;
  platform: string;
  meeting_link: string;
  meeting_room_url: string | null;
  meeting_room_name: string | null;
  covered_parts: string | null;
  kuppi_notices: {
    title: string;
    modules: { module_code: string; module_name: string } | null;
  } | null;
}

export default function StudentSessions() {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile) return;
    const regs = query<KuppiRegistration>("kuppi_registrations", (r) => r.student_id === profile.id);
    const noticeIds = regs.map((r) => r.notice_id);
    if (noticeIds.length === 0) { setLoading(false); return; }

    const raw = query<KuppiSession>("kuppi_sessions", (s) => noticeIds.includes(s.notice_id))
      .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());

    const items: SessionItem[] = raw.map((s) => {
      const notice = getById<KuppiNotice>("kuppi_notices", s.notice_id);
      const mod = notice ? getById<Module>("modules", notice.module_id) : null;
      return {
        id: s.id,
        session_date: s.session_date,
        session_time: s.session_time,
        platform: s.platform,
        meeting_link: s.meeting_link,
        meeting_room_url: s.meeting_room_url,
        meeting_room_name: s.meeting_room_name,
        covered_parts: s.covered_parts,
        kuppi_notices: notice ? {
          title: notice.title,
          modules: mod ? { module_code: mod.module_code, module_name: mod.module_name } : null,
        } : null,
      };
    });

    setSessions(items);
    setLoading(false);
  }, [profile]);

  const isJoinable = (date: string, time: string) => {
    const now = new Date();
    const sessionStart = new Date(`${date}T${time}`);
    const diff = (sessionStart.getTime() - now.getTime()) / (1000 * 60);
    return diff <= 15 && diff >= -120;
  };

  const isPast = (date: string) => new Date(date) < new Date();

  if (loading) {
    return (
      <div className="space-y-6">
        <div><div className="h-8 w-48 skeleton-shimmer rounded-lg" /><div className="h-4 w-72 skeleton-shimmer rounded mt-2" /></div>
        <div className="grid gap-4">{[1, 2, 3].map((i) => <div key={i} className="h-36 skeleton-shimmer rounded-lg" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">Live Sessions</h1>
        <p className="text-muted-foreground mt-1">Join live kuppi sessions you've registered for</p>
      </div>

      {sessions.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="pt-8 pb-8 text-center">
            <Radio className="empty-state-icon" />
            <p className="text-muted-foreground font-medium">No sessions available.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Register for kuppi notices to see upcoming sessions here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session, i) => {
            const joinable = isJoinable(session.session_date, session.session_time);
            const past = isPast(session.session_date);
            const hasRoom = !!session.meeting_room_url;

            return (
              <motion.div key={session.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }}>
                <Card className="glass-card-hover">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <CardTitle className="font-display text-lg">{session.kuppi_notices?.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge className="bg-primary/10 text-primary border-primary/20">{session.kuppi_notices?.modules?.module_code}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(session.session_date).toLocaleDateString()}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {session.session_time}</span>
                          <Badge variant="outline">{session.platform}</Badge>
                        </div>
                      </div>
                      <div>
                        {joinable && hasRoom ? (
                          <Badge className="bg-success/15 text-success border-success/20 animate-pulse">● Live Now</Badge>
                        ) : past ? (
                          <Badge variant="outline" className="text-muted-foreground">Ended</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">Upcoming</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {session.covered_parts && <p className="text-sm text-muted-foreground mb-3">Topics: {session.covered_parts}</p>}
                    <div className="flex items-center gap-2 flex-wrap">
                      {hasRoom && joinable ? (
                        <Button size="sm" className="bg-gradient-accent text-accent-foreground font-semibold shadow-md hover:shadow-lg transition-shadow" onClick={() => navigate(`/meeting?room=${session.meeting_room_name}&host=false`)}>
                          <Video className="w-3.5 h-3.5 mr-1" /> Join Live Session
                        </Button>
                      ) : hasRoom && !past ? (
                        <Button size="sm" variant="outline" disabled><Clock className="w-3.5 h-3.5 mr-1" /> Available 15 min before start</Button>
                      ) : null}
                      {session.meeting_link && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={session.meeting_link} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3 mr-1" /> External Link</a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
