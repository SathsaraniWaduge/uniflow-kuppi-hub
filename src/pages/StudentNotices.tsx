import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ExternalLink, Calendar, BookOpen, UserPlus, Search, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import RegisterModal from "@/components/RegisterModal";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [registeredNotices, setRegisteredNotices] = useState<Set<string>>(new Set());

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

      // Check which notices the student is already registered for
      const { data: regs } = await supabase
        .from("kuppi_registrations")
        .select("notice_id")
        .eq("student_id", profile.id);
      setRegisteredNotices(new Set(regs?.map(r => r.notice_id) || []));

      setLoading(false);
    };
    fetch();
  }, [profile]);

  const [selectedNotice, setSelectedNotice] = useState<NoticeWithModule | null>(null);

  const filteredNotices = notices.filter(n => {
    const q = searchQuery.toLowerCase();
    return !q || n.title.toLowerCase().includes(q) || n.modules?.module_code.toLowerCase().includes(q) || n.modules?.module_name.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 skeleton-shimmer rounded-lg" />
          <div className="h-4 w-72 skeleton-shimmer rounded mt-2" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 skeleton-shimmer rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Kuppi Notices</h1>
          <p className="text-muted-foreground mt-1">Sessions available for your enrolled modules</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notices..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {filteredNotices.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="pt-8 pb-8 text-center">
            <BookOpen className="empty-state-icon" />
            <p className="text-muted-foreground font-medium">
              {searchQuery ? "No notices match your search." : "No notices available for your enrolled modules yet."}
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">Check back later for new kuppi sessions!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredNotices.map((notice, i) => {
            const isRegistered = registeredNotices.has(notice.id);
            return (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
              >
                <Card className="glass-card-hover">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="font-display text-lg">{notice.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">{notice.modules?.module_code}</Badge>
                          <Badge variant="outline" className="text-muted-foreground">{notice.modules?.module_name}</Badge>
                          {notice.modules && (
                            <span className="text-xs text-muted-foreground/60">
                              Year {notice.modules.year} · Sem {notice.modules.semester}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Calendar className="w-3 h-3" />
                        {new Date(notice.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {notice.description && <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{notice.description}</p>}
                    <div className="flex items-center gap-2 flex-wrap">
                      {notice.google_form_url && (
                        <Button size="sm" variant="outline" onClick={() => window.open(notice.google_form_url!, "_blank")} className="text-xs">
                          Google Form <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                      {isRegistered ? (
                        <Badge className="bg-success/10 text-success border-success/20 gap-1 py-1.5 px-3">
                          <CheckCircle2 className="w-3 h-3" /> Registered
                        </Badge>
                      ) : (
                        <Button size="sm" className="bg-gradient-accent text-accent-foreground font-semibold shadow-sm hover:shadow-md transition-shadow" onClick={() => setSelectedNotice(notice)}>
                          <UserPlus className="w-3.5 h-3.5 mr-1" /> Register
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {selectedNotice && (
        <RegisterModal
          open={!!selectedNotice}
          onOpenChange={(o) => {
            if (!o) {
              // Refresh registered status
              if (profile) {
                supabase
                  .from("kuppi_registrations")
                  .select("notice_id")
                  .eq("student_id", profile.id)
                  .then(({ data }) => setRegisteredNotices(new Set(data?.map(r => r.notice_id) || [])));
              }
              setSelectedNotice(null);
            }
          }}
          notice={selectedNotice}
        />
      )}
    </div>
  );
}
