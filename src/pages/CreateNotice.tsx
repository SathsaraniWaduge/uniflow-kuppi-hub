import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getAll, insert } from "@/mocks/data";
import type { Module, KuppiNotice } from "@/mocks/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import noticeBg from "@/assets/notice-bg.jpg";

export default function CreateNotice() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [title, setTitle] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [description, setDescription] = useState("");
  const [googleFormUrl, setGoogleFormUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setModules(getAll<Module>("modules"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      insert<KuppiNotice>("kuppi_notices", {
        title,
        module_id: moduleId,
        description: description || null,
        google_form_url: googleFormUrl || null,
        created_by: profile.id,
        created_at: new Date().toISOString(),
      });
      toast.success("Notice created!");
      navigate("/manage-notices");
    } catch {
      toast.error("Failed to create notice");
    }
    setLoading(false);
  };

  return (
    <div
      className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center -m-6 md:-m-8 p-6 md:p-8"
      style={{
        backgroundImage: `url(${noticeBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold font-display">Create Notice</h1>
          <p className="text-muted-foreground mt-1">Post a new kuppi session notice</p>
        </div>

        <Card className="glass-card shadow-xl border-primary/10">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-primary" /> New Kuppi Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Data Structures Revision Kuppi" required />
              </div>
              <div className="space-y-2">
                <Label>Module</Label>
                <Select value={moduleId} onValueChange={setModuleId} required>
                  <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
                  <SelectContent>
                    {modules.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.module_code} – {m.module_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will be covered..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-url">Google Form URL (optional)</Label>
                <Input id="form-url" value={googleFormUrl} onChange={(e) => setGoogleFormUrl(e.target.value)} placeholder="https://forms.google.com/..." type="url" />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
                {loading ? "Creating..." : "Create Notice"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
