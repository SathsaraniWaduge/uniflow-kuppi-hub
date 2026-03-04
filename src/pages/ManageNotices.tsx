import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Users, Trash2, Video as VideoIcon } from "lucide-react";
import { toast } from "sonner";

export default function ManageNotices() {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleNotice, setScheduleNotice] = useState<string | null>(null);
  const [sessionForm, setSessionForm] = useState({ date: "", time: "", platform: "Zoom", meetingLink: "", coveredParts: "" });
  const [registrations, setRegistrations] = useState<Record<string, any[]>>({});

  const fetchNotices = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("kuppi_notices")
      .select("*, modules(module_code, module_name)")
      .eq("created_by", profile.id)
      .order("created_at", { ascending: false });
    setNotices(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchNotices(); }, [profile]);

  const viewRegistrations = async (noticeId: string) => {
    const { data } = await supabase.from("kuppi_registrations").select("*").eq("notice_id", noticeId);
    setRegistrations((prev) => ({ ...prev, [noticeId]: data || [] }));
  };

  const scheduleSession = async () => {
    if (!profile || !scheduleNotice) return;
    const { error } = await supabase.from("kuppi_sessions").insert({
      notice_id: scheduleNotice,
      session_date: sessionForm.date,
      session_time: sessionForm.time,
      platform: sessionForm.platform,
      meeting_link: sessionForm.meetingLink,
      covered_parts: sessionForm.coveredParts || null,
      organizer_id: profile.id,
    });
    if (error) toast.error("Failed to schedule session");
    else {
      toast.success("Session scheduled!");
      setScheduleNotice(null);
      setSessionForm({ date: "", time: "", platform: "Zoom", meetingLink: "", coveredParts: "" });
    }
  };

  const deleteNotice = async (id: string) => {
    const { error } = await supabase.from("kuppi_notices").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Notice deleted");
      fetchNotices();
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">Manage Notices</h1>
        <p className="text-muted-foreground mt-1">View registrations and schedule sessions</p>
      </div>

      {notices.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="pt-6 text-center text-muted-foreground">No notices created yet.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notices.map((notice) => (
            <Card key={notice.id} className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-display text-lg">{notice.title}</CardTitle>
                    <Badge variant="secondary" className="mt-1">{notice.modules?.module_code} – {notice.modules?.module_name}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => viewRegistrations(notice.id)}>
                      <Users className="w-3 h-3 mr-1" /> Registrations
                    </Button>
                    <Dialog open={scheduleNotice === notice.id} onOpenChange={(o) => !o && setScheduleNotice(null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-primary" onClick={() => setScheduleNotice(notice.id)}>
                          <Calendar className="w-3 h-3 mr-1" /> Schedule
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle className="font-display">Schedule Session</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                          <div><Label>Date</Label><Input type="date" value={sessionForm.date} onChange={(e) => setSessionForm(p => ({ ...p, date: e.target.value }))} /></div>
                          <div><Label>Time</Label><Input type="time" value={sessionForm.time} onChange={(e) => setSessionForm(p => ({ ...p, time: e.target.value }))} /></div>
                          <div><Label>Platform</Label><Input value={sessionForm.platform} onChange={(e) => setSessionForm(p => ({ ...p, platform: e.target.value }))} /></div>
                          <div><Label>Meeting Link</Label><Input value={sessionForm.meetingLink} onChange={(e) => setSessionForm(p => ({ ...p, meetingLink: e.target.value }))} /></div>
                          <div><Label>Covered Parts</Label><Input value={sessionForm.coveredParts} onChange={(e) => setSessionForm(p => ({ ...p, coveredParts: e.target.value }))} /></div>
                          <Button className="w-full bg-gradient-primary" onClick={scheduleSession}>Schedule Session</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="destructive" onClick={() => deleteNotice(notice.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              </CardHeader>
              {registrations[notice.id] && (
                <CardContent>
                  <p className="text-sm font-medium mb-2">Registrations ({registrations[notice.id].length})</p>
                  {registrations[notice.id].length === 0 ? (
                    <p className="text-sm text-muted-foreground">No registrations yet.</p>
                  ) : (
                    <div className="space-y-1">
                      {registrations[notice.id].map((reg) => (
                        <div key={reg.id} className="text-sm flex items-center gap-2">
                          <span className="font-medium">{reg.student_name}</span>
                          <span className="text-muted-foreground">{reg.student_email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
