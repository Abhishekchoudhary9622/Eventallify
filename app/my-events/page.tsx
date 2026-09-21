"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Award,
  Star,
  XCircle,
  AlertCircle,
  Ticket,
  ChevronRight,
  ExternalLink,
  Loader2,
  CalendarPlus,
  Search,
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
import { DigitalPassModal } from "@/components/events/digital-pass-modal";
import { FeedbackDialog } from "@/components/events/feedback-dialog";
import { CertificateView } from "@/components/certificates/certificate-view";
import { getEventImage } from "@/lib/event-images";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface MyRegistration {
  _id: string;
  registrationId: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: "confirmed" | "waitlisted" | "attended" | "cancelled";
  waitlistPosition?: number;
  qrPayload: string;
  registeredAt: string;
  checkedInAt?: string;
  event: {
    _id: string;
    title: string;
    description: string;
    category: string;
    startDate: string;
    endDate?: string;
    venue: string;
    organizer: {
      name: string;
      department?: string;
    };
    image?: string;
    status: string;
  };
}

export default function MyEventsPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [passReg, setPassReg] = useState<MyRegistration | null>(null);
  const [feedbackEvent, setFeedbackEvent] = useState<{ id: string; title: string } | null>(null);
  const [certData, setCertData] = useState<any | null>(null);
  const [cancelReg, setCancelReg] = useState<MyRegistration | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, [session]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/registrations");
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
      }
    } catch (err) {
      console.error("Failed to load registrations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!cancelReg) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/registrations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: cancelReg._id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Registration cancelled successfully");
        setCancelReg(null);
        fetchRegistrations();
      } else {
        toast.error(data.error || "Failed to cancel registration");
      }
    } catch (err) {
      toast.error("An error occurred while cancelling registration");
    } finally {
      setCancelling(false);
    }
  };

  const openCertificate = async (eventId: string) => {
    try {
      const res = await fetch("/api/certificates");
      if (res.ok) {
        const data = await res.json();
        const found = (data.certificates || []).find((c: any) => c.eventId === eventId);
        if (found) {
          setCertData(found);
          return;
        }
      }
      toast.info("Certificate is being generated or will be issued shortly after event conclusion.");
    } catch {
      toast.error("Failed to fetch certificate");
    }
  };

  const downloadCalendarEvent = (event: MyRegistration["event"]) => {
    const start = new Date(event.startDate).toISOString().replace(/-|:|\.\d+/g, "");
    const end = event.endDate
      ? new Date(event.endDate).toISOString().replace(/-|:|\.\d+/g, "")
      : new Date(new Date(event.startDate).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, "");

    const icsData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Eventallify//Campus Events//EN",
      "BEGIN:VEVENT",
      `UID:${event._id}@eventallify.edu`,
      `DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d+/g, "")}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.slice(0, 200)}...`,
      `LOCATION:${event.venue}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${event.title.replace(/\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Calendar invite downloaded");
  };

  const filtered = registrations.filter((r) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.event?.title?.toLowerCase().includes(query) ||
      r.event?.venue?.toLowerCase().includes(query) ||
      r.event?.category?.toLowerCase().includes(query)
    );
  });

  const upcomingList = filtered.filter(
    (r) => r.status === "confirmed" && new Date(r.event?.startDate || 0) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
  );
  const waitlistList = filtered.filter((r) => r.status === "waitlisted");
  const pastList = filtered.filter(
    (r) =>
      r.status === "attended" ||
      (r.status === "confirmed" && new Date(r.event?.startDate || 0) < new Date(Date.now() - 24 * 60 * 60 * 1000))
  );
  const cancelledList = filtered.filter((r) => r.status === "cancelled");

  if (!session && !sessionLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <AlertCircle className="mx-auto size-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Sign in to view your events</h1>
        <p className="text-muted-foreground mb-6">You need to be logged in to view your registrations and digital passes.</p>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-primary mb-1 font-medium">
                <Ticket className="size-4" /> Student Event Dashboard
              </div>
              <h1 className="text-3xl font-bold tracking-tight">My Events & Passes</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage your confirmed bookings, access digital QR passes, and view certificates.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/saved-events">Saved Events</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/events">Explore More Events</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search your registered events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-card/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Total registrations: <span className="font-semibold text-foreground">{registrations.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading your campus events...</p>
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid grid-cols-4 max-w-xl">
              <TabsTrigger value="upcoming" className="text-xs sm:text-sm">
                Upcoming ({upcomingList.length})
              </TabsTrigger>
              <TabsTrigger value="waitlisted" className="text-xs sm:text-sm">
                Waitlist ({waitlistList.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="text-xs sm:text-sm">
                Past & Attended ({pastList.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="text-xs sm:text-sm">
                Cancelled ({cancelledList.length})
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Tab */}
            <TabsContent value="upcoming" className="space-y-4">
              {upcomingList.length === 0 ? (
                <EmptyState
                  title="No upcoming events"
                  desc="You haven't registered for any upcoming events yet. Check out the campus calendar to find exciting workshops, hackathons, and talks!"
                  actionText="Browse Campus Events"
                  actionHref="/events"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingList.map((reg) => (
                    <RegistrationCard
                      key={reg._id}
                      reg={reg}
                      onViewPass={() => setPassReg(reg)}
                      onCancel={() => setCancelReg(reg)}
                      onDownloadCalendar={() => downloadCalendarEvent(reg.event)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Waitlist Tab */}
            <TabsContent value="waitlisted" className="space-y-4">
              {waitlistList.length === 0 ? (
                <EmptyState
                  title="No waitlisted events"
                  desc="You are not currently in any event waitlists. If an event reaches full capacity, you can join the queue and get auto-promoted when spots open up."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {waitlistList.map((reg) => (
                    <RegistrationCard
                      key={reg._id}
                      reg={reg}
                      onViewPass={() => setPassReg(reg)}
                      onCancel={() => setCancelReg(reg)}
                      onDownloadCalendar={() => downloadCalendarEvent(reg.event)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Past & Attended Tab */}
            <TabsContent value="past" className="space-y-4">
              {pastList.length === 0 ? (
                <EmptyState
                  title="No past events yet"
                  desc="Events you attended will show up here along with your verifiable certificates and options to review the organizers."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastList.map((reg) => (
                    <RegistrationCard
                      key={reg._id}
                      reg={reg}
                      onViewPass={() => setPassReg(reg)}
                      onViewCert={() => openCertificate(reg.eventId)}
                      onLeaveFeedback={() => setFeedbackEvent({ id: reg.eventId, title: reg.event?.title || "Event" })}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Cancelled Tab */}
            <TabsContent value="cancelled" className="space-y-4">
              {cancelledList.length === 0 ? (
                <EmptyState
                  title="No cancelled registrations"
                  desc="Registrations that you voluntarily withdraw from will appear in this archive."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cancelledList.map((reg) => (
                    <RegistrationCard key={reg._id} reg={reg} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Digital Pass Modal */}
      {passReg && (
        <DigitalPassModal
          isOpen={!!passReg}
          onClose={() => setPassReg(null)}
          registration={passReg}
          event={passReg.event}
        />
      )}

      {/* Feedback Dialog */}
      {feedbackEvent && (
        <FeedbackDialog
          isOpen={!!feedbackEvent}
          onClose={() => setFeedbackEvent(null)}
          eventId={feedbackEvent.id}
          eventTitle={feedbackEvent.title}
          onSubmitted={() => fetchRegistrations()}
        />
      )}

      {/* Certificate Viewer Modal */}
      {certData && (
        <Dialog open={!!certData} onOpenChange={(open) => !open && setCertData(null)}>
          <DialogContent className="max-w-4xl p-6 overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="size-5 text-amber-500" />
                Verified Certificate of Participation
              </DialogTitle>
              <DialogDescription>
                Issued by {certData.organizerName || "Eventallify"} & VIT Chennai
              </DialogDescription>
            </DialogHeader>
            <CertificateView certificate={certData} />
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelReg} onOpenChange={(open) => !open && setCancelReg(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-5" /> Cancel Registration
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw your registration for{" "}
              <strong className="text-foreground">{cancelReg?.event?.title}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm bg-muted/40 p-3 rounded-lg border text-muted-foreground space-y-1">
            <p>• Your spot will be automatically released to the next student on the waitlist.</p>
            <p>• Your digital QR pass will be immediately deactivated.</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setCancelReg(null)} disabled={cancelling}>
              Keep Registration
            </Button>
            <Button variant="destructive" onClick={handleCancelRegistration} disabled={cancelling}>
              {cancelling && <Loader2 className="mr-2 size-4 animate-spin" />}
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RegistrationCard({
  reg,
  onViewPass,
  onCancel,
  onDownloadCalendar,
  onViewCert,
  onLeaveFeedback,
}: {
  reg: MyRegistration;
  onViewPass?: () => void;
  onCancel?: () => void;
  onDownloadCalendar?: () => void;
  onViewCert?: () => void;
  onLeaveFeedback?: () => void;
}) {
  const event = reg.event || {
    title: "Unknown Event",
    description: "",
    category: "General",
    startDate: new Date().toISOString(),
    venue: "TBA",
    organizer: { name: "Organizer" },
  };

  const imageSrc = getEventImage(event.category, event.image);
  const isPast = new Date(event.startDate) < new Date();

  return (
    <div className="group flex flex-col rounded-2xl border bg-card/80 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40">
      {/* Banner */}
      <div className="relative h-44 w-full overflow-hidden bg-muted">
        <Image
          src={imageSrc}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {reg.status === "confirmed" && (
            <Badge className="bg-emerald-500/90 text-white hover:bg-emerald-500 font-semibold shadow-md">
              ✓ Confirmed
            </Badge>
          )}
          {reg.status === "waitlisted" && (
            <Badge className="bg-amber-500/90 text-white hover:bg-amber-500 font-semibold shadow-md">
              ⏳ Waitlist #{reg.waitlistPosition || 1}
            </Badge>
          )}
          {reg.status === "attended" && (
            <Badge className="bg-blue-600 text-white hover:bg-blue-600 font-semibold shadow-md">
              ⭐ Attended
            </Badge>
          )}
          {reg.status === "cancelled" && (
            <Badge variant="destructive" className="font-semibold shadow-md">
              Cancelled
            </Badge>
          )}
        </div>

        {/* Category */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="backdrop-blur-md bg-background/80 text-xs uppercase font-medium">
            {event.category}
          </Badge>
        </div>

        {/* Friendly Reg ID */}
        <div className="absolute bottom-3 left-3 text-xs font-mono px-2 py-0.5 rounded bg-background/80 backdrop-blur-md border text-muted-foreground">
          {reg.registrationId}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <Link href={`/events/${reg.eventId}`}>
            <h3 className="font-bold text-lg leading-snug line-clamp-2 hover:text-primary transition-colors">
              {event.title}
            </h3>
          </Link>

          <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 text-primary shrink-0" />
              <span>{format(new Date(event.startDate), "EEEE, MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-3.5 text-primary shrink-0" />
              <span>{format(new Date(event.startDate), "h:mm a")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 text-primary shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t flex flex-col gap-2">
          {reg.status !== "cancelled" && (
            <div className="flex items-center gap-2">
              {onViewPass && (
                <Button size="sm" className="flex-1 gap-1.5 shadow-sm" onClick={onViewPass}>
                  <QrCode className="size-4" /> Digital Pass
                </Button>
              )}
              {onDownloadCalendar && (
                <Button
                  size="icon"
                  variant="outline"
                  className="size-9 shrink-0"
                  title="Add to Calendar"
                  onClick={onDownloadCalendar}
                >
                  <CalendarPlus className="size-4" />
                </Button>
              )}
            </div>
          )}

          {/* Past Actions: Certificate & Review */}
          {(isPast || reg.status === "attended") && reg.status !== "cancelled" && (
            <div className="flex items-center gap-2">
              {onViewCert && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1.5 text-amber-500 hover:text-amber-400 border-amber-500/30"
                  onClick={onViewCert}
                >
                  <Award className="size-4" /> Certificate
                </Button>
              )}
              {onLeaveFeedback && (
                <Button size="sm" variant="ghost" className="gap-1.5" onClick={onLeaveFeedback}>
                  <Star className="size-4 text-amber-400" /> Rate
                </Button>
              )}
            </div>
          )}

          {/* Cancel Option for confirmed/waitlisted */}
          {(reg.status === "confirmed" || reg.status === "waitlisted") && onCancel && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-start px-2 h-7"
              onClick={onCancel}
            >
              <XCircle className="size-3.5 mr-1" /> Withdraw Registration
            </Button>
          )}

          <Link
            href={`/events/${reg.eventId}`}
            className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground pt-1"
          >
            <span>View full event page</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  desc,
  actionText,
  actionHref,
}: {
  title: string;
  desc: string;
  actionText?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center bg-card/30">
      <Ticket className="size-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-md">{desc}</p>
      {actionText && actionHref && (
        <Button asChild className="mt-6" size="sm">
          <Link href={actionHref}>{actionText}</Link>
        </Button>
      )}
    </div>
  );
}
