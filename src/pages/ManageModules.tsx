import { useEffect, useState } from "react";
import { getAll, insert, remove } from "@/mocks/data";
import type { Module } from "@/mocks/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, PlusCircle, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function ManageModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [form, setForm] = useState({ moduleCode: "", moduleName: "", year: "1", semester: "1" });
  const [loading, setLoading] = useState(false);

  const fetchModules = () => {
    const all = getAll<Module>("modules").sort((a, b) => a.year - b.year || a.semester - b.semester);
    setModules(all);
  };

  useEffect(() => { fetchModules(); }, []);

  const addModule = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    insert<Module>("modules", {
      module_code: form.moduleCode,
      module_name: form.moduleName,
      year: parseInt(form.year),
      semester: parseInt(form.semester),
      created_at: new Date().toISOString(),
    });
    toast.success("Module added!");
    setForm({ moduleCode: "", moduleName: "", year: "1", semester: "1" });
    fetchModules();
    setLoading(false);
  };

  const deleteModule = (id: string) => {
    remove("modules", id);
    toast.success("Deleted");
    fetchModules();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">Manage Modules</h1>
        <p className="text-muted-foreground mt-1">Add and manage course modules</p>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="font-display flex items-center gap-2"><PlusCircle className="w-5 h-5" /> Add Module</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={addModule} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
            <div><Label>Code</Label><Input value={form.moduleCode} onChange={(e) => setForm((p) => ({ ...p, moduleCode: e.target.value }))} placeholder="IT2030" required /></div>
            <div><Label>Name</Label><Input value={form.moduleName} onChange={(e) => setForm((p) => ({ ...p, moduleName: e.target.value }))} placeholder="Data Structures" required /></div>
            <div><Label>Year</Label><Input type="number" min="1" max="4" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} required /></div>
            <div><Label>Semester</Label><Input type="number" min="1" max="2" value={form.semester} onChange={(e) => setForm((p) => ({ ...p, semester: e.target.value }))} required /></div>
            <Button type="submit" className="bg-gradient-primary" disabled={loading}>Add</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader><CardTitle className="font-display flex items-center gap-2"><BookOpen className="w-5 h-5" /> All Modules</CardTitle></CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No modules yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.module_code}</TableCell>
                    <TableCell>{m.module_name}</TableCell>
                    <TableCell>{m.year}</TableCell>
                    <TableCell>{m.semester}</TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={() => deleteModule(m.id)}><Trash2 className="w-3 h-3" /></Button></TableCell>
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
