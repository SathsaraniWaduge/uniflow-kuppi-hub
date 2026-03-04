import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface NoticeWithModule {
  id: string;
  title: string;
  description: string | null;
  google_form_url: string | null;
  created_at: string;
  modules: { module_code: string; module_name: string; year: number; semester: number } | null;
}

export default function StudentNotices() {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<NoticeWithModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetch = async () => {
      const { data: mods } = await supabase.from("student_modules").select("module_id").eq("student_id", profile.id);
      const moduleIds = mods?.map(m => m.module_id) || [];
      if (moduleIds.length === 0) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("kuppi_notices")
        .select("id, title, description, google_form_url, created_at, modules(module_code, module_name, year, semester)")
        .in("module_id", moduleIds)
        .order("created_at", { ascending: false });

      if (error) toast.error("Failed to load notices");
      setNotices((data as any) || []);
      setLoading(false);
    };
    fetch();
  }, [profile]);

  const handleRegister = async (notice: NoticeWithModule) => {
    if (notice.google_form_url) {
      window.open(notice.google_form_url, "_blank");
    } else if (profile) {
      const { error } = await supabase.from("kuppi_registrations").insert({
        notice_id: notice.id,
        student_id: profile.id,
        student_name: profile.name,
        student_email: "",
      });
      if (error) toast.error("Already registered or error");
      else toast.success("Registered successfully!");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">Kuppi Notices</h1>
        <p className="text-muted-foreground mt-1">Sessions available for your enrolled modules</p>
      </div>

      {notices.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No notices available for your enrolled modules yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notices.map((notice) => (
            <Card key={notice.id} className="glass-card hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-display text-lg">{notice.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{notice.modules?.module_code}</Badge>
                      <Badge variant="outline">{notice.modules?.module_name}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(notice.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {notice.description && <p className="text-sm text-muted-foreground mb-4">{notice.description}</p>}
                <Button size="sm" onClick={() => handleRegister(notice)} className="bg-gradient-primary">
                  {notice.google_form_url ? (
                    <>Register via Form <ExternalLink className="w-3 h-3 ml-1" /></>
                  ) : "Register"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
