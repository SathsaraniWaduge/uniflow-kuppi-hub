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
import { Loader2, CheckCircle2, Sparkles, Hash, Mail, Phone, User } from "lucide-react";
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
  const [itNumber, setItNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !itNumber.trim() || !phone.trim()) {
      toast.error("All fields are required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!/^IT\d{7,8}$/i.test(itNumber.trim())) {
      toast.error("IT Number must be like IT21234567");
      return;
    }
    if (!/^0\d{9}$/.test(phone.trim())) {
      toast.error("Phone number must be 10 digits starting with 0");
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
        it_number: itNumber.trim().toUpperCase(),
        phone_number: phone.trim(),
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Register for Kuppi Session</DialogTitle>
          <DialogDescription>Fill in your details to register. All fields are required.</DialogDescription>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name" className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" /> Full Name
                  </Label>
                  <Input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kamal Perera" maxLength={100} required className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-it" className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-muted-foreground" /> IT Number
                  </Label>
                  <Input id="reg-it" value={itNumber} onChange={(e) => setItNumber(e.target.value)} placeholder="e.g. IT21234567" maxLength={12} required className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Student Email
                  </Label>
                  <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. it21234567@my.sliit.lk" maxLength={255} required className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-phone" className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Phone Number
                  </Label>
                  <Input id="reg-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0771234567" maxLength={10} required className="h-11" />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 bg-gradient-accent text-accent-foreground font-semibold shadow-md hover:shadow-lg transition-shadow" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {loading ? "Registering..." : "Confirm Registration"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
