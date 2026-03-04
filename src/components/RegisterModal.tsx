import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notice: {
    id: string;
    title: string;
    modules?: { module_code: string; module_name: string } | null;
  };
}

export default function RegisterModal({ open, onOpenChange, notice }: RegisterModalProps) {
  const { profile, user } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      // Check for duplicate registration
      const { data: existing } = await supabase
        .from("kuppi_registrations")
        .select("id")
        .eq("notice_id", notice.id)
        .eq("student_id", profile?.id || "")
        .maybeSingle();

      if (existing) {
        toast.error("You have already registered for this session.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("kuppi_registrations").insert({
        notice_id: notice.id,
        student_id: profile?.id || null,
        student_name: name.trim(),
        student_email: email.trim(),
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Registered successfully!");
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
      }, 1500);
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Register for Kuppi Session</DialogTitle>
          <DialogDescription>Fill in your details to register for this session.</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <CheckCircle2 className="w-16 h-16 text-success animate-in zoom-in" />
            <p className="text-lg font-semibold font-display">Registration Confirmed!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Notice</Label>
              <p className="font-medium">{notice.title}</p>
            </div>

            <div className="flex gap-2">
              <Badge variant="secondary">{notice.modules?.module_code}</Badge>
              <Badge variant="outline">{notice.modules?.module_name}</Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-name">Full Name</Label>
              <Input
                id="reg-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Registration
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
