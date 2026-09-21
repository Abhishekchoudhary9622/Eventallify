"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface FeedbackDialogProps {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  eventId: string;
  eventTitle: string;
  existingRating?: number;
  existingComment?: string;
  onSuccess?: () => void;
  onSubmitted?: () => void;
}

export function FeedbackDialog({
  open,
  isOpen,
  onOpenChange,
  onClose,
  eventId,
  eventTitle,
  existingRating = 5,
  existingComment = "",
  onSuccess,
  onSubmitted,
}: FeedbackDialogProps) {
  const isDialogOpen = open !== undefined ? open : isOpen !== undefined ? isOpen : false;
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange?.(newOpen);
    if (!newOpen && onClose) onClose();
  };
  const handleSuccessCallback = () => {
    onSuccess?.();
    onSubmitted?.();
  };
  const [rating, setRating] = useState(existingRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingComment);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit feedback");
        setSubmitting(false);
        return;
      }

      toast.success("Thank you for rating this event!");
      handleSuccessCallback();
      handleOpenChange(false);
    } catch {
      toast.error("Could not submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-6 bg-card border-border/80">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-bold">Rate & Review Event</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            How was your experience at &ldquo;{eventTitle}&rdquo;? Your feedback helps organizers improve future campus events.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Star Rating Selector */}
          <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-muted/30 border border-border/40">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`size-8 transition-colors ${
                        isFilled
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/40 hover:text-amber-400/60"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-semibold text-foreground/80">
              {rating === 5 && "⭐ Excellent - Highly Recommended"}
              {rating === 4 && "👍 Very Good - Great Session"}
              {rating === 3 && "👌 Good - Average Experience"}
              {rating === 2 && "👎 Fair - Needs Improvement"}
              {rating === 1 && "❌ Poor - Below Expectations"}
            </span>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-1.5">
            <label htmlFor="feedback-comment" className="text-xs font-semibold">
              Comments & Key Takeaways (Optional)
            </label>
            <Textarea
              id="feedback-comment"
              placeholder="What did you like the most? Any suggestions for the speakers or organizers?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} size="sm" className="px-5 font-semibold">
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
