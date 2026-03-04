import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BookOpen, GraduationCap, Users, Sparkles, Calendar, Video } from "lucide-react";
import { motion } from "framer-motion";

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

  const features = [
    { icon: Calendar, label: "Schedule Sessions" },
    { icon: Video, label: "Watch Recordings" },
    { icon: Sparkles, label: "Leave Feedback" },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />

      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left: Branding */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-primary-foreground space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight text-primary-foreground">UniFlow</h1>
              <p className="text-xs text-primary-foreground/50 uppercase tracking-widest">Kuppi Manager</p>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-display leading-tight text-primary-foreground">
            Kuppi Sessions,<br />
            <span className="bg-gradient-accent bg-clip-text text-transparent">Made Simple.</span>
          </h2>
          <p className="text-lg text-primary-foreground/70 max-w-md leading-relaxed">
            Organize, schedule, and join supplementary academic sessions. Built for SLIIT IT Faculty students & organizers.
          </p>

          <div className="flex gap-4 pt-2">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.15, duration: 0.4 }}
                className="flex items-center gap-2 bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 rounded-xl px-3 py-2"
              >
                <f.icon className="w-4 h-4 text-secondary" />
                <span className="text-xs text-primary-foreground/80 font-medium">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: Auth Form */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass-card border-border/20 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="font-display text-2xl">Get Started</CardTitle>
              <CardDescription>Sign in or create your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" className="font-medium">Sign In</TabsTrigger>
                  <TabsTrigger value="register" className="font-medium">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input id="login-email" type="email" placeholder="you@sliit.lk" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="h-11" />
                    </div>
                    <Button type="submit" className="w-full h-11 bg-gradient-primary font-semibold shadow-md hover:shadow-lg transition-shadow" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Full Name</Label>
                      <Input id="reg-name" placeholder="John Doe" value={regName} onChange={(e) => setRegName(e.target.value)} required className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input id="reg-email" type="email" placeholder="you@sliit.lk" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input id="reg-password" type="password" placeholder="Min 6 characters" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required minLength={6} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label>I am a...</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setRegRole("student")}
                          className={`p-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${regRole === "student" ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"}`}>
                          <GraduationCap className="w-6 h-6 mx-auto mb-1.5" />
                          Student
                        </button>
                        <button type="button" onClick={() => setRegRole("organizer")}
                          className={`p-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${regRole === "organizer" ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"}`}>
                          <Users className="w-6 h-6 mx-auto mb-1.5" />
                          Organizer
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-11 bg-gradient-primary font-semibold shadow-md hover:shadow-lg transition-shadow" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
