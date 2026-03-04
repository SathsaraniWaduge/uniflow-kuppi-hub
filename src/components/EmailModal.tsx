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
import { Loader2, Mail, Paperclip, CheckCircle2, Users } from "lucide-react";
import { toast } from "sonner";

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
    const emails = registrations.map((r) => r.student_email);

    // Simulate sending – log to console
    console.log("=== BULK EMAIL SIMULATION ===");
    console.log("Sending email to:", emails);
    console.log("Subject:", subject);
    console.log("Body:", emailBody);
    console.log("=== END ===");

    setTimeout(() => {
      setSending(false);
      setSent(true);
      toast.success(`Emails sent to ${emails.length} student(s) (simulated)`);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Mail className="w-5 h-5" /> Email Registrants
          </DialogTitle>
          <DialogDescription>
            Send session details to all registered students for this kuppi session.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <CheckCircle2 className="w-16 h-16 text-success animate-in zoom-in" />
            <p className="text-lg font-semibold font-display">Emails Sent!</p>
            <p className="text-sm text-muted-foreground">{registrations.length} recipient(s)</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recipients */}
            <div>
              <Label className="flex items-center gap-1 mb-2">
                <Users className="w-4 h-4" /> Recipients ({registrations.length})
              </Label>
              {registrations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No registrations found for this notice.</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {registrations.map((r) => (
                    <Badge key={r.id} variant="secondary" className="text-xs">
                      {r.student_name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Email Preview */}
            <div>
              <Label className="mb-1">Subject</Label>
              <p className="text-sm font-medium border rounded-md px-3 py-2 bg-muted/50">{subject}</p>
            </div>

            <div>
              <Label className="mb-1">Email Body Preview</Label>
              <pre className="text-xs border rounded-md px-3 py-3 bg-muted/50 whitespace-pre-wrap font-body">
                {emailBody}
              </pre>
            </div>

            <Separator />

            {/* Study Material */}
            <div className="space-y-2">
              <Label htmlFor="study-material" className="flex items-center gap-1">
                <Paperclip className="w-4 h-4" /> Attach Study Material (optional)
              </Label>
              <Input id="study-material" type="file" onChange={handleFileChange} />
              {studyMaterialUrl && (
                <p className="text-xs text-muted-foreground break-all">Mock URL: {studyMaterialUrl}</p>
              )}
            </div>

            <Button
              className="w-full bg-gradient-primary"
              onClick={handleSend}
              disabled={sending || registrations.length === 0}
            >
              {sending && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Emails ({registrations.length})
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
