import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, ExternalLink, Star, Video } from "lucide-react";
import { toast } from "sonner";

export default function ManageSessions() {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadSession, setUploadSession] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({ title: "", fileUrl: "" });
  const [feedbacks, setFeedbacks] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!profile) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("kuppi_sessions")
        .select("*, kuppi_notices(title, modules(module_code, module_name)), kuppi_recordings(id, title, file_url)")
        .eq("organizer_id", profile.id)
        .order("session_date", { ascending: false });
      setSessions(data || []);
      setLoading(false);
    };
    fetch();
  }, [profile]);

  const uploadRecording = async () => {
    if (!uploadSession) return;
    const { error } = await supabase.from("kuppi_recordings").insert({
      session_id: uploadSession,
      title: uploadForm.title,
      file_url: uploadForm.fileUrl,
    });
    if (error) toast.error("Upload failed");
    else {
      toast.success("Recording added!");
      setUploadSession(null);
      setUploadForm({ title: "", fileUrl: "" });
    }
  };

  const viewFeedback = async (sessionId: string) => {
    const { data } = await supabase.from("kuppi_feedback").select("*, profiles(name)").eq("session_id", sessionId);
    setFeedbacks(prev => ({ ...prev, [sessionId]: data || [] }));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">Sessions</h1>
        <p className="text-muted-foreground mt-1">Manage scheduled sessions and recordings</p>
      </div>

      {sessions.length === 0 ? (
        <Card className="glass-card"><CardContent className="pt-6 text-center text-muted-foreground">No sessions scheduled yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card key={session.id} className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="font-display text-base">{session.kuppi_notices?.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary">{session.kuppi_notices?.modules?.module_code}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(session.session_date).toLocaleDateString()} at {session.session_time}
                      </span>
                      <Badge variant="outline">{session.platform}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => viewFeedback(session.id)}>
                      <Star className="w-3 h-3 mr-1" /> Feedback
                    </Button>
                    <Dialog open={uploadSession === session.id} onOpenChange={(o) => !o && setUploadSession(null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-primary" onClick={() => setUploadSession(session.id)}>
                          <Video className="w-3 h-3 mr-1" /> Add Recording
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle className="font-display">Upload Recording</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                          <div><Label>Title</Label><Input value={uploadForm.title} onChange={(e) => setUploadForm(p => ({ ...p, title: e.target.value }))} /></div>
                          <div><Label>Video URL</Label><Input value={uploadForm.fileUrl} onChange={(e) => setUploadForm(p => ({ ...p, fileUrl: e.target.value }))} placeholder="https://drive.google.com/..." /></div>
                          <Button className="w-full bg-gradient-primary" onClick={uploadRecording}>Save Recording</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {session.meeting_link && (
                  <a href={session.meeting_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1 hover:underline">
                    <ExternalLink className="w-3 h-3" /> Meeting Link
                  </a>
                )}
                {session.covered_parts && <p className="text-sm text-muted-foreground">Covered: {session.covered_parts}</p>}
                
                {session.kuppi_recordings?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Recordings:</p>
                    {session.kuppi_recordings.map((rec: any) => (
                      <a key={rec.id} href={rec.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1 hover:underline">
                        <Video className="w-3 h-3" /> {rec.title}
                      </a>
                    ))}
                  </div>
                )}

                {feedbacks[session.id] && (
                  <div>
                    <p className="text-sm font-medium mb-1">Feedback ({feedbacks[session.id].length})</p>
                    {feedbacks[session.id].map((fb: any) => (
                      <div key={fb.id} className="text-sm border-l-2 border-primary/20 pl-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{fb.profiles?.name}</span>
                          <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= fb.rating ? "fill-warning text-warning" : "text-muted"}`} />)}</div>
                        </div>
                        {fb.comment && <p className="text-muted-foreground">{fb.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
