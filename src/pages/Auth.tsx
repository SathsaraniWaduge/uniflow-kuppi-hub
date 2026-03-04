import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BookOpen, GraduationCap, Users } from "lucide-react";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"student" | "organizer">("student");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signUp(regEmail, regPassword, regName, regRole);
      toast.success("Account created! Check your email to verify.");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left: Branding */}
        <div className="text-primary-foreground space-y-6 animate-slide-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-primary-foreground">UniFlow</h1>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-display leading-tight text-primary-foreground">
            Kuppi Session<br />
            <span className="bg-gradient-accent bg-clip-text text-transparent">Management</span>
          </h2>
          <p className="text-lg opacity-80 text-primary-foreground/80 max-w-md">
            Organize, schedule, and participate in supplementary academic sessions. Built for SLIIT IT Faculty students.
          </p>
          <div className="flex gap-6 pt-4">
            <div className="flex items-center gap-2 text-primary-foreground/70">
              <GraduationCap className="w-5 h-5" />
              <span className="text-sm">Students</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/70">
              <Users className="w-5 h-5" />
              <span className="text-sm">Organizers</span>
            </div>
          </div>
        </div>

        {/* Right: Auth Form */}
        <Card className="glass-card animate-fade-in border-border/30">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Get Started</CardTitle>
            <CardDescription>Sign in or create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" placeholder="you@sliit.lk" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-primary" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <Input id="reg-name" placeholder="John Doe" value={regName} onChange={(e) => setRegName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input id="reg-email" type="email" placeholder="you@sliit.lk" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input id="reg-password" type="password" placeholder="Min 6 characters" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required minLength={6} />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setRegRole("student")}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${regRole === "student" ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-muted-foreground"}`}>
                        <GraduationCap className="w-5 h-5 mx-auto mb-1" />
                        Student
                      </button>
                      <button type="button" onClick={() => setRegRole("organizer")}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${regRole === "organizer" ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-muted-foreground"}`}>
                        <Users className="w-5 h-5 mx-auto mb-1" />
                        Organizer
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-primary" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
