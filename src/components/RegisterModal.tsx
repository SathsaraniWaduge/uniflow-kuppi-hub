import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { query, insert } from "@/mocks/data";
import type { KuppiRegistration } from "@/mocks/data";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
      const existing = query<KuppiRegistration>("kuppi_registrations", (r) => r.notice_id === notice.id && r.student_id === (profile?.id || ""));
      if (existing.length > 0) {
        toast.error("You have already registered for this session.");
        setLoading(false);
        return;
      }

      insert<KuppiRegistration>("kuppi_registrations", {
        notice_id: notice.id,
        student_id: profile?.id || null,
        student_name: name.trim(),
        student_email: email.trim(),
        registered_at: new Date().toISOString(),
      });

      setSuccess(true);
      toast.success("Registered successfully!");
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
      }, 2000);
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

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center py-10 gap-4">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-success" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold font-display">You're In! 🎉</p>
                <p className="text-sm text-muted-foreground mt-1">Registration confirmed for this session.</p>
              </div>
            </motion.div>
          ) : (
            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                <p className="font-medium text-sm">{notice.title}</p>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20">{notice.modules?.module_code}</Badge>
                  <Badge variant="outline" className="text-muted-foreground">{notice.modules?.module_name}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required className="h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required className="h-11" />
              </div>

              <Button type="submit" className="w-full h-11 bg-gradient-accent text-accent-foreground font-semibold shadow-md hover:shadow-lg transition-shadow" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? "Registering..." : "Confirm Registration"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
