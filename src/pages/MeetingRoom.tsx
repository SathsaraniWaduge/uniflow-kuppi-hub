import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Mic, MicOff, VideoOff, Monitor, Phone, Users, MessageSquare, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function MeetingRoom() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const roomName = searchParams.get("room") || "mock-room";
  const isHost = searchParams.get("host") === "true";

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [participants] = useState(isHost ? 1 : 2);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleLeave = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Badge className="bg-accent text-accent-foreground font-mono text-xs">
            {roomName}
          </Badge>
          {recording && (
            <Badge className="bg-destructive text-destructive-foreground animate-pulse gap-1">
              <span className="w-2 h-2 rounded-full bg-destructive-foreground inline-block" />
              REC {formatTime(elapsed)}
            </Badge>
          )}
          {!recording && (
            <span className="text-sm text-white/50 font-mono">{formatTime(elapsed)}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-white/70 border-white/20 gap-1">
            <Users className="w-3 h-3" /> {participants} participant{participants > 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* Main video area */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-4xl"
        >
          {/* Main "video" feed */}
          <div className="relative aspect-video bg-black/40 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center">
            {camOn ? (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10" />
            ) : null}
            
            <div className="relative z-10 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-accent mx-auto flex items-center justify-center mb-4 shadow-xl">
                <span className="text-3xl font-bold text-accent-foreground font-display">
                  {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <p className="text-white font-display text-lg">{profile?.name || "User"}</p>
              <p className="text-white/40 text-sm">{isHost ? "Host" : "Participant"}</p>
              {!camOn && <p className="text-white/30 text-xs mt-2">Camera is off</p>}
            </div>

            {/* Screen share overlay indicator */}
            {screenShare && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-primary/80 backdrop-blur-sm text-primary-foreground px-3 py-1.5 rounded-lg text-sm">
                <Monitor className="w-4 h-4" /> Sharing screen
              </div>
            )}

            {/* Mock message */}
            <div className="absolute bottom-4 left-4 right-4">
              <Card className="bg-black/60 backdrop-blur-md border-white/10">
                <CardContent className="p-3 text-center">
                  <p className="text-white/60 text-sm">
                    🎓 This is a <span className="text-accent font-semibold">mock meeting room</span>. 
                    In production, this will use a real video conferencing service (e.g. Daily.co).
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Self-view pip */}
          <div className="absolute bottom-28 right-10 w-40 h-28 bg-black/50 rounded-xl border border-white/10 hidden md:flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-primary/40 flex items-center justify-center">
              <span className="text-sm font-bold text-white/80">{profile?.name?.charAt(0) || "U"}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-center gap-3 px-4 py-5 bg-black/30 backdrop-blur-md">
        <Button
          size="icon"
          variant={micOn ? "secondary" : "destructive"}
          className="w-12 h-12 rounded-full"
          onClick={() => setMicOn(!micOn)}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>

        <Button
          size="icon"
          variant={camOn ? "secondary" : "destructive"}
          className="w-12 h-12 rounded-full"
          onClick={() => setCamOn(!camOn)}
        >
          {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>

        {isHost && (
          <>
            <Button
              size="icon"
              variant={screenShare ? "default" : "secondary"}
              className="w-12 h-12 rounded-full"
              onClick={() => setScreenShare(!screenShare)}
            >
              <Monitor className="w-5 h-5" />
            </Button>

            <Button
              size="icon"
              variant={recording ? "destructive" : "secondary"}
              className="w-12 h-12 rounded-full"
              onClick={() => setRecording(!recording)}
            >
              <div className={`w-3 h-3 rounded-full ${recording ? "bg-white animate-pulse" : "bg-destructive"}`} />
            </Button>
          </>
        )}

        <Button
          size="icon"
          variant="secondary"
          className="w-12 h-12 rounded-full"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>

        <Button
          size="icon"
          variant="secondary"
          className="w-12 h-12 rounded-full"
        >
          <Settings className="w-5 h-5" />
        </Button>

        <Button
          size="icon"
          className="w-14 h-14 rounded-full bg-destructive hover:bg-destructive/90 ml-4"
          onClick={handleLeave}
        >
          <Phone className="w-5 h-5 rotate-[135deg]" />
        </Button>
      </div>
    </div>
  );
}
