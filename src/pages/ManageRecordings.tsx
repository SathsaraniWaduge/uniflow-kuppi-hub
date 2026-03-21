import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAll, query, getById, remove } from "@/mocks/data";
import type { KuppiRecording, KuppiSession, KuppiNotice, Module } from "@/mocks/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ManageRecordings() {
  const { profile } = useAuth();
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecordings = () => {
    if (!profile) return;
    const all = getAll<KuppiRecording>("kuppi_recordings")
      .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());

    const withRelations = all.map((rec) => {
      const session = getById<KuppiSession>("kuppi_sessions", rec.session_id);
      const notice = session ? getById<KuppiNotice>("kuppi_notices", session.notice_id) : null;
      const mod = notice ? getById<Module>("modules", notice.module_id) : null;
      return {
        ...rec,
        kuppi_sessions: session ? {
          session_date: session.session_date,
          organizer_id: session.organizer_id,
          kuppi_notices: notice ? {
            title: notice.title,
            modules: mod ? { module_code: mod.module_code } : null,
          } : null,
        } : null,
      };
    }).filter((r) => r.kuppi_sessions?.organizer_id === profile.id);

    setRecordings(withRelations);
    setLoading(false);
  };

  useEffect(() => { fetchRecordings(); }, [profile]);

  const deleteRecording = (id: string) => {
    remove("kuppi_recordings", id);
    toast.success("Recording deleted");
    fetchRecordings();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">Manage Recordings</h1>
        <p className="text-muted-foreground mt-1">View and manage uploaded recordings</p>
      </div>

      {recordings.length === 0 ? (
        <Card className="glass-card"><CardContent className="pt-6 text-center text-muted-foreground"><Video className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No recordings uploaded yet.</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {recordings.map((rec) => (
            <Card key={rec.id} className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="font-display text-base">{rec.title}</CardTitle>
                  <Button size="sm" variant="ghost" onClick={() => deleteRecording(rec.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
                <Badge variant="secondary">{rec.kuppi_sessions?.kuppi_notices?.modules?.module_code}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{rec.kuppi_sessions?.kuppi_notices?.title}</p>
                <a href={rec.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1 hover:underline">
                  <ExternalLink className="w-3 h-3" /> View Recording
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
