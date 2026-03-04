import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Paperclip, CheckCircle2, Users, Send } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface EmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: {
    id: string;
    notice_id: string;
    session_date: string;
    session_time: string;
    platform: string;
    meeting_link: string;
    covered_parts: string | null;
    kuppi_notices?: {
      title: string;
      modules?: { module_code: string; module_name: string } | null;
    } | null;
  };
}

interface Registration {
  id: string;
  student_name: string;
  student_email: string;
}

export default function EmailModal({ open, onOpenChange, session }: EmailModalProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [studyMaterialUrl, setStudyMaterialUrl] = useState("");

  const moduleCode = session.kuppi_notices?.modules?.module_code || "N/A";
  const moduleName = session.kuppi_notices?.modules?.module_name || "N/A";

  useEffect(() => {
    if (!open) return;
    const fetchRegistrations = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("kuppi_registrations")
        .select("id, student_name, student_email")
        .eq("notice_id", session.notice_id);
      setRegistrations(data || []);
      setLoading(false);
    };
    fetchRegistrations();
    setSent(false);
    setSendProgress(0);
    setStudyMaterialUrl("");
  }, [open, session.notice_id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mockUrl = `https://mockstorage.com/kuppi/${session.id}-${Date.now()}-${file.name}`;
      setStudyMaterialUrl(mockUrl);
      toast.info("Study material uploaded (simulated)");
    }
  };

  const subject = `Details for ${moduleCode} Kuppi Session on ${new Date(session.session_date).toLocaleDateString()}`;

  const emailBody = `
Module: ${moduleName} (${moduleCode})
Date: ${new Date(session.session_date).toLocaleDateString()}
Time: ${session.session_time}
Platform: ${session.platform}
Meeting Link: ${session.meeting_link}
Covered Parts: ${session.covered_parts || "TBA"}
Study Material: ${studyMaterialUrl || "Not provided"}
  `.trim();

  const handleSend = () => {
    setSending(true);
    setSendProgress(0);
    const emails = registrations.map((r) => r.student_email);

    console.log("=== BULK EMAIL SIMULATION ===");
    console.log("Sending email to:", emails);
    console.log("Subject:", subject);
    console.log("Body:", emailBody);
    console.log("=== END ===");

    // Animated progress bar
    const interval = setInterval(() => {
      setSendProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 8;
      });
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setSendProgress(100);
      setSending(false);
      setSent(true);
      toast.success(`Emails sent to ${emails.length} student(s) (simulated)`);
    }, 1400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" /> Email Registrants
          </DialogTitle>
          <DialogDescription>
            Send session details to all registered students.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-10 gap-4"
            >
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-success" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold font-display">Emails Sent! ✉️</p>
                <p className="text-sm text-muted-foreground mt-1">{registrations.length} recipient(s) notified</p>
              </div>
            </motion.div>
          ) : loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Recipients */}
              <div>
                <Label className="flex items-center gap-1 mb-2">
                  <Users className="w-4 h-4 text-primary" /> Recipients ({registrations.length})
                </Label>
                {registrations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No registrations found for this notice.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {registrations.map((r) => (
                      <Badge key={r.id} className="bg-primary/10 text-primary border-primary/20 text-xs">
                        {r.student_name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Email Preview */}
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">Subject</p>
                  <p className="text-sm font-medium">{subject}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">Body</p>
                  <pre className="text-xs whitespace-pre-wrap font-body text-muted-foreground leading-relaxed">
                    {emailBody}
                  </pre>
                </div>
              </div>

              {/* Study Material */}
              <div className="space-y-2">
                <Label htmlFor="study-material" className="flex items-center gap-1">
                  <Paperclip className="w-4 h-4 text-muted-foreground" /> Attach Study Material
                </Label>
                <Input id="study-material" type="file" onChange={handleFileChange} />
                {studyMaterialUrl && (
                  <Badge variant="outline" className="text-xs break-all">
                    📎 {studyMaterialUrl.split("/").pop()}
                  </Badge>
                )}
              </div>

              {sending && (
                <div className="space-y-1">
                  <Progress value={sendProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">Sending emails...</p>
                </div>
              )}

              <Button
                className="w-full h-11 bg-gradient-primary font-semibold shadow-md hover:shadow-lg transition-shadow"
                onClick={handleSend}
                disabled={sending || registrations.length === 0}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? "Sending..." : `Send to ${registrations.length} Student(s)`}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
