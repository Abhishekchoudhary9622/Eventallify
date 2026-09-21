"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  Users,
  Eye,
  Loader2,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEventImage } from "@/lib/event-images";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function AdminApprovalsPage() {
  const { data: session } = authClient.useSession();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  // Review modal
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "changes_requested" | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/approvals");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch {
      toast.error("Failed to load approval queue");
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async () => {
    if (!selectedEvent || !actionType) return;
    if ((actionType === "changes_requested" || actionType === "reject") && !feedbackNotes.trim()) {
      toast.error("Please provide feedback notes or reason");
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent._id,
          action: actionType,
          feedback: feedbackNotes.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          actionType === "approve"
            ? "Event approved and published to campus feed!"
            : actionType === "changes_requested"
            ? "Change request sent to club organizers."
            : "Event submission rejected."
        );
        setSelectedEvent(null);
        setActionType(null);
        setFeedbackNotes("");
        fetchEvents();
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch {
      toast.error("Error submitting decision");
    } finally {
      setSubmittingAction(false);
    }
  };

  const pendingEvents = events.filter(
    (e) => e.adminApproval?.status === "pending" || e.status === "pending_approval"
  );
  const approvedEvents = events.filter(
    (e) => e.adminApproval?.status === "approved" || e.status === "approved"
  );
  const changesEvents = events.filter(
    (e) => e.adminApproval?.status === "changes_requested" || e.adminApproval?.status === "rejected"
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="border-b bg-card/40 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-primary mb-1 font-medium">
                <ShieldCheck className="size-4" /> Faculty & Dean Approvals
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Event Approval Queue</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Review club event proposals, verify venue allocations, and approve public publishing.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 mt-6 max-w-2xl">
            <div className="rounded-xl border bg-card/60 p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Awaiting Review</div>
              <div className="text-2xl font-bold text-amber-400">{pendingEvents.length}</div>
            </div>

            <div className="rounded-xl border bg-card/60 p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Approved & Published</div>
              <div className="text-2xl font-bold text-emerald-400">{approvedEvents.length}</div>
            </div>

            <div className="rounded-xl border bg-card/60 p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Changes Requested</div>
              <div className="text-2xl font-bold text-destructive">{changesEvents.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Approval Body */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid grid-cols-3 max-w-md">
            <TabsTrigger value="pending">Pending ({pendingEvents.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedEvents.length})</TabsTrigger>
            <TabsTrigger value="changes">Changes/Rejected ({changesEvents.length})</TabsTrigger>
          </TabsList>

          {/* Pending List */}
          <TabsContent value="pending" className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="size-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Loading approval queue...</p>
              </div>
            ) : pendingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-16 text-center bg-card/30">
                <CheckCircle2 className="size-12 text-emerald-400/50 mb-3" />
                <h3 className="text-lg font-semibold">Queue is all clear!</h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  There are currently no event proposals awaiting administrative review.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingEvents.map((event) => (
                  <ApprovalCard
                    key={event._id}
                    event={event}
                    onReview={() => setSelectedEvent(event)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Approved List */}
          <TabsContent value="approved" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {approvedEvents.map((event) => (
                <ApprovalCard key={event._id} event={event} isReadOnly={true} />
              ))}
            </div>
          </TabsContent>

          {/* Changes / Rejected List */}
          <TabsContent value="changes" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {changesEvents.map((event) => (
                <ApprovalCard key={event._id} event={event} isReadOnly={true} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Review & Decision Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedEvent.category}</Badge>
                <span className="text-xs text-muted-foreground">Proposed by {selectedEvent.organizer?.name}</span>
              </div>
              <DialogTitle className="text-2xl font-bold mt-1">{selectedEvent.title}</DialogTitle>
              <DialogDescription className="text-xs">
                Review details carefully before approving for campus-wide visibility.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-xl border">
                <div>
                  <span className="text-muted-foreground">Venue:</span>{" "}
                  <span className="font-semibold text-foreground">{selectedEvent.venue}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Capacity:</span>{" "}
                  <span className="font-semibold text-foreground">{selectedEvent.maxParticipants || selectedEvent.capacity || "Unlimited"} seats</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>{" "}
                  <span className="font-semibold text-foreground">
                    {format(new Date(selectedEvent.date || selectedEvent.startDate), "MMM d, yyyy • h:mm a")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Host:</span>{" "}
                  <span className="font-semibold text-foreground">
                    {selectedEvent.organizerName || selectedEvent.organizer?.department || selectedEvent.organizer?.name || "General"}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Description</h4>
                <p className="text-xs text-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border">
                  {selectedEvent.description}
                </p>
              </div>

              {selectedEvent.rules && selectedEvent.rules.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Rules & Guidelines</h4>
                  <ul className="text-xs space-y-1 list-disc list-inside text-muted-foreground">
                    {selectedEvent.rules.map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Decision Selector */}
              <div className="pt-4 border-t space-y-3">
                <label className="text-xs font-semibold">Faculty / Admin Action</label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    type="button"
                    variant={actionType === "approve" ? "default" : "outline"}
                    className={`gap-1.5 text-xs ${actionType === "approve" ? "bg-emerald-600 hover:bg-emerald-500" : ""}`}
                    onClick={() => setActionType("approve")}
                  >
                    <CheckCircle2 className="size-4 text-emerald-400" /> Approve
                  </Button>

                  <Button
                    type="button"
                    variant={actionType === "changes_requested" ? "default" : "outline"}
                    className={`gap-1.5 text-xs ${actionType === "changes_requested" ? "bg-amber-600 hover:bg-amber-500" : ""}`}
                    onClick={() => setActionType("changes_requested")}
                  >
                    <AlertTriangle className="size-4 text-amber-400" /> Request Changes
                  </Button>

                  <Button
                    type="button"
                    variant={actionType === "reject" ? "default" : "outline"}
                    className={`gap-1.5 text-xs ${actionType === "reject" ? "bg-destructive hover:bg-destructive/90" : ""}`}
                    onClick={() => setActionType("reject")}
                  >
                    <XCircle className="size-4 text-red-400" /> Reject
                  </Button>
                </div>

                {(actionType === "changes_requested" || actionType === "reject") && (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Feedback / Required Modifications for Organizer *
                    </label>
                    <textarea
                      value={feedbackNotes}
                      onChange={(e) => setFeedbackNotes(e.target.value)}
                      rows={3}
                      placeholder="Specify why changes are needed (e.g. Venue Anna Auditorium is occupied on this date, please choose MG Auditorium)..."
                      className="w-full px-3 py-2 text-xs rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setSelectedEvent(null)} disabled={submittingAction}>
                Close
              </Button>
              <Button
                onClick={handleDecision}
                disabled={submittingAction || !actionType}
                className="gap-2"
              >
                {submittingAction && <Loader2 className="size-4 animate-spin" />}
                Confirm Decision
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ApprovalCard({
  event,
  onReview,
  isReadOnly = false,
}: {
  event: any;
  onReview?: () => void;
  isReadOnly?: boolean;
}) {
  const imageSrc = getEventImage(event.category, event.image);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl border bg-card p-4 gap-4 hover:border-primary/40 transition-all">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative size-20 rounded-xl overflow-hidden bg-muted shrink-0">
          <Image src={imageSrc} alt={event.title} fill className="object-cover" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {event.category}
            </Badge>
            <span className="text-xs text-muted-foreground">Club: {event.organizerName || event.organizer?.name || "Campus Club"}</span>
          </div>

          <h3 className="font-bold text-base line-clamp-1">{event.title}</h3>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3 text-primary" /> {format(new Date(event.date || event.startDate), "MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3 text-primary" /> {event.venue}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3 text-primary" /> {event.maxParticipants || event.capacity || "Open"} seats
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        {onReview && (
          <Button size="sm" onClick={onReview} className="gap-1.5 shadow-sm">
            <Eye className="size-3.5" /> Review Proposal
          </Button>
        )}
        <Button asChild size="sm" variant="outline">
          <Link href={`/events/${event._id}`} target="_blank">
            Preview
          </Link>
        </Button>
      </div>
    </div>
  );
}
