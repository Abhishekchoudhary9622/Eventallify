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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

interface RegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    id: string;
    title: string;
    date: string | Date;
    venue: string;
    category: string;
    maxParticipants?: number | null;
    registrationCount?: number;
    customQuestions?: Array<{
      id: string;
      label: string;
      type: "text" | "select" | "checkbox";
      required?: boolean;
      options?: string[];
    }>;
  };
  onSuccess: (registration: any) => void;
}

export function RegistrationDialog({
  open,
  onOpenChange,
  event,
  onSuccess,
}: RegistrationDialogProps) {
  const { data: session } = authClient.useSession();
  const [department, setDepartment] = useState("");
  const [collegeYear, setCollegeYear] = useState("2nd Year");
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [registeredResult, setRegisteredResult] = useState<any | null>(null);

  const eventDate = new Date(event.date);
  const max = event.maxParticipants || 0;
  const count = event.registrationCount || 0;
  const isFull = max > 0 && count >= max;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please sign in to register");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department,
          collegeYear,
          customAnswers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        setSubmitting(false);
        return;
      }

      setRegisteredResult(data.registration);
      toast.success(data.message || "Registration completed successfully!");
      onSuccess(data.registration);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRegisteredResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-card border-border/80">
        {registeredResult ? (
          // Success State View
          <div className="p-6 text-center space-y-6">
            <div className="mx-auto size-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="size-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {registeredResult.status === "waitlisted"
                  ? "Added to Waitlist"
                  : "You're Registered!"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {registeredResult.status === "waitlisted"
                  ? `You are #${registeredResult.waitlistPosition} in queue. You'll be notified if a spot opens up.`
                  : `Your spot for ${event.title} has been confirmed.`}
              </p>
            </div>

            {/* Registration ID Badge */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Registration ID</span>
                <Badge variant="outline" className="font-mono text-xs font-semibold px-2">
                  {registeredResult.id}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Attendee</span>
                <span className="font-medium text-foreground">{session?.user?.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={registeredResult.status === "confirmed" ? "default" : "secondary"}
                  className="capitalize text-[11px]"
                >
                  {registeredResult.status}
                </Badge>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-2">
              <Button asChild className="w-full h-11 font-medium shadow-md">
                <Link href={`/pass/${registeredResult.id}`} onClick={handleClose}>
                  <Ticket className="size-4 mr-2" />
                  View Digital Pass & QR Ticket
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-10">
                <Link href="/my-events" onClick={handleClose}>
                  Go to My Events
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          // Registration Form View
          <form onSubmit={handleSubmit}>
            <div className="p-6 border-b border-border/60 space-y-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs capitalize">
                  {event.category}
                </Badge>
                {isFull && (
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                    Waitlist Queue
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-xl font-bold leading-snug">
                {isFull ? `Join Waitlist for ${event.title}` : `Register for ${event.title}`}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3 text-primary" />
                  {format(eventDate, "MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3 text-primary" />
                  {format(eventDate, "h:mm a")}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3 text-primary" />
                  {event.venue}
                </span>
              </DialogDescription>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-1.5">
                <Label htmlFor="studentName" className="text-xs font-semibold">
                  Full Name
                </Label>
                <Input
                  id="studentName"
                  value={session?.user?.name || ""}
                  disabled
                  className="bg-muted/40 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="studentEmail" className="text-xs font-semibold">
                  College Email
                </Label>
                <Input
                  id="studentEmail"
                  value={session?.user?.email || ""}
                  disabled
                  className="bg-muted/40 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="department" className="text-xs font-semibold">
                    Department / Branch *
                  </Label>
                  <Input
                    id="department"
                    placeholder="e.g. CSE, ECE, Mechanical"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="year" className="text-xs font-semibold">
                    Year of Study *
                  </Label>
                  <select
                    id="year"
                    value={collegeYear}
                    onChange={(e) => setCollegeYear(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="1st Year" className="bg-card">1st Year</option>
                    <option value="2nd Year" className="bg-card">2nd Year</option>
                    <option value="3rd Year" className="bg-card">3rd Year</option>
                    <option value="4th Year" className="bg-card">4th Year</option>
                    <option value="Postgraduate" className="bg-card">Postgraduate</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Custom Questions if any */}
              {event.customQuestions && event.customQuestions.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border/40">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Event Questions
                  </span>
                  {event.customQuestions.map((q) => (
                    <div key={q.id} className="space-y-1.5">
                      <Label htmlFor={q.id} className="text-xs font-semibold">
                        {q.label} {q.required && "*"}
                      </Label>
                      {q.type === "select" && q.options ? (
                        <select
                          id={q.id}
                          required={q.required}
                          value={customAnswers[q.id] || ""}
                          onChange={(e) =>
                            setCustomAnswers((prev) => ({
                              ...prev,
                              [q.id]: e.target.value,
                            }))
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                        >
                          <option value="">Select option...</option>
                          {q.options.map((opt) => (
                            <option key={opt} value={opt} className="bg-card">
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          id={q.id}
                          required={q.required}
                          value={customAnswers[q.id] || ""}
                          onChange={(e) =>
                            setCustomAnswers((prev) => ({
                              ...prev,
                              [q.id]: e.target.value,
                            }))
                          }
                          placeholder="Your answer"
                          className="text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-muted/20 border-t border-border/60 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="h-10 px-5 font-semibold bg-gradient-to-r from-primary to-primary/90"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : isFull ? (
                  "Join Waitlist"
                ) : (
                  "Confirm Registration"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
