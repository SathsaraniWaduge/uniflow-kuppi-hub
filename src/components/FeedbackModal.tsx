import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { insert, query } from "@/mocks/data";
import type { KuppiFeedback } from "@/mocks/data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Send } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  sessionTitle: string;
}

export default function FeedbackModal({ open, onOpenChange, sessionId, sessionTitle }: FeedbackModalProps) {
  const { profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const alreadySubmitted = profile
    ? query<KuppiFeedback>("kuppi_feedback", (f) => f.session_id === sessionId && f.student_id === profile.id).length > 0
    : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setLoading(true);
    try {
      insert<KuppiFeedback>("kuppi_feedback", {
        session_id: sessionId,
        student_id: profile.id,
        rating,
        comment: comment || null,
        created_at: new Date().toISOString(),
      });
      toast.success("Thank you for your feedback! 🎉");
      setRating(0);
      setComment("");
      onOpenChange(false);
    } catch {
      toast.error("Failed to submit feedback");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Rate this Kuppi</DialogTitle>
          <DialogDescription>{sessionTitle}</DialogDescription>
        </DialogHeader>

        {alreadySubmitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Star className="w-8 h-8 text-warning fill-warning" />
            </div>
            <p className="font-medium">You've already submitted feedback</p>
            <p className="text-sm text-muted-foreground mt-1">Thanks for sharing your thoughts!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>How would you rate this session?</Label>
              <div className="flex items-center justify-center gap-2 py-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? "fill-warning text-warning"
                          : "text-muted-foreground/20"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  {rating === 1 && "Needs improvement"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very good!"}
                  {rating === 5 && "Excellent! 🌟"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fb-comment">Comments (optional)</Label>
              <Textarea
                id="fb-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this session..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>
            </div>

            <Button type="submit" className="w-full bg-gradient-primary" disabled={loading || rating === 0}>
              <Send className="w-4 h-4 mr-2" />
              {loading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
