import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { query, insert, getById } from "@/mocks/data";
import type { KuppiSession, KuppiNotice, KuppiRecording } from "@/mocks/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Video, FileVideo } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateRecording() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Array<KuppiSession & { noticeTitle: string }>>([]);
  const [sessionId, setSessionId] = useState("");
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const allSessions = query<KuppiSession>("kuppi_sessions", (s) => s.organizer_id === profile.id);
    const withTitles = allSessions.map((s) => {
      const notice = getById<KuppiNotice>("kuppi_notices", s.notice_id);
      return { ...s, noticeTitle: notice?.title || "Untitled" };
    });
    setSessions(withTitles);
  }, [profile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const mockUrl = `https://mockstorage.com/kuppi/${Date.now()}-${file.name}`;
      setFileUrl(mockUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !title) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const url = fileUrl || `https://example.com/recordings/${Date.now()}.mp4`;
      insert<KuppiRecording>("kuppi_recordings", {
        session_id: sessionId,
        title,
        file_url: url,
        uploaded_at: new Date().toISOString(),
      });
      toast.success("Recording uploaded successfully!");
      navigate("/manage-recordings");
    } catch {
      toast.error("Failed to upload recording");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-display">Upload Recording</h1>
        <p className="text-muted-foreground mt-1">Add a new kuppi session recording</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" /> New Recording
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="rec-title">Recording Title *</Label>
                <Input
                  id="rec-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. DSA Kuppi - Trees & Graphs"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Session *</Label>
                <Select value={sessionId} onValueChange={setSessionId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.noticeTitle} – {s.session_date} ({s.platform})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Recording File</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="video/*,.mp4,.mkv,.avi,.mov"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {fileName ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileVideo className="w-8 h-8 text-primary" />
                      <div className="text-left">
                        <p className="text-sm font-medium">{fileName}</p>
                        <p className="text-xs text-muted-foreground">Ready to upload (simulated)</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Video className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">Click or drag to upload a video file</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">MP4, MKV, AVI, MOV</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-url">Or paste a recording URL</Label>
                <Input
                  id="file-url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or https://youtube.com/..."
                  type="url"
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
                {loading ? "Uploading..." : "Upload Recording"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
