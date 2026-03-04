import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Users, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function ManageStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedModule, setSelectedModule] = useState("");

  const fetchData = async () => {
    const [{ data: s }, { data: m }, { data: e }] = await Promise.all([
      supabase.from("profiles").select("id, name, role").eq("role", "student"),
      supabase.from("modules").select("id, module_code, module_name"),
      supabase.from("student_modules").select("*, profiles(name), modules(module_code, module_name)"),
    ]);
    setStudents(s || []);
    setModules(m || []);
    setEnrollments(e || []);
  };

  useEffect(() => { fetchData(); }, []);

  const enroll = async () => {
    if (!selectedStudent || !selectedModule) return;
    const { error } = await supabase.from("student_modules").insert({
      student_id: selectedStudent,
      module_id: selectedModule,
    });
    if (error) toast.error(error.message.includes("duplicate") ? "Already enrolled" : error.message);
    else { toast.success("Enrolled!"); fetchData(); }
  };

  const removeEnrollment = async (id: string) => {
    await supabase.from("student_modules").delete().eq("id", id);
    toast.success("Removed");
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">Manage Students</h1>
        <p className="text-muted-foreground mt-1">Enroll students in modules</p>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="font-display flex items-center gap-2"><UserPlus className="w-5 h-5" /> Enroll Student</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <Label>Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Module</Label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
                <SelectContent>
                  {modules.map((m) => <SelectItem key={m.id} value={m.id}>{m.module_code} – {m.module_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-gradient-primary" onClick={enroll}>Enroll</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader><CardTitle className="font-display flex items-center gap-2"><Users className="w-5 h-5" /> Enrollments</CardTitle></CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No enrollments yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.profiles?.name}</TableCell>
                    <TableCell><Badge variant="secondary">{e.modules?.module_code}</Badge> {e.modules?.module_name}</TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={() => removeEnrollment(e.id)}><Trash2 className="w-3 h-3" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
