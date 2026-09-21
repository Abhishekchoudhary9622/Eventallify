"use client";

import { useEffect, useState, useCallback, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Share2,
  CalendarPlus,
  Ticket,
  Star,
  Award,
  HelpCircle,
  ListChecks,
  Gift,
  Mic,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { authClient } from "@/lib/auth-client";
import { getEventImageUrl } from "@/lib/event-images";
import { RegistrationDialog } from "@/components/events/registration-dialog";
import { DigitalPassModal } from "@/components/events/digital-pass-modal";
import { FeedbackDialog } from "@/components/events/feedback-dialog";

interface EventDetail {
  id: string;
  title: string;
  shortDescription?: string;
  description: string;
  date: string;
  endDate?: string | null;
  venue: string;
  locationDetails?: string;
  category: string;
  imageUrl?: string | null;
  registrationDeadline: string;
  maxParticipants?: number | null;
  organizerName?: string;
  organizerContact?: string;
  status: string;
  schedule?: Array<{ time: string; activity: string; speaker?: string }>;
  rules?: string[];
  prizes?: Array<{ position: string; reward: string; description?: string }>;
  speakers?: Array<{ name: string; role: string; organization?: string; avatar?: string; bio?: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  allowWaitlist?: boolean;
  customQuestions?: Array<{ id: string; label: string; type: "text" | "select" | "checkbox"; required?: boolean; options?: string[] }>;
  registrationCount: number;
  waitlistCount?: number;
  averageRating?: number;
  feedbackCount?: number;
  feedback?: Array<{ id: string; rating: number; comment?: string; userName?: string; createdAt: string }>;
  isBookmarked?: boolean;
  userRegistration?: {
    id: string;
    status: string;
    waitlistPosition?: number;
    checkedIn: boolean;
    checkedInAt?: string | null;
    registeredAt: string;
  } | null;
}

function EventDetailContent({ eventId }: { eventId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoRegister = searchParams.get("register") === "1";

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "rules" | "prizes" | "speakers" | "faqs" | "reviews">("overview");

  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as any)?.role === "admin";

  const fetchEvent = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
        setBookmarked(data.isBookmarked || false);
        if (autoRegister && !data.userRegistration) {
          setRegisterOpen(true);
        }
      } else {
        toast.error("Event not found");
      }
    } catch {
      toast.error("Could not load event");
    } finally {
      setLoading(false);
    }
  }, [eventId, autoRegister]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleBookmarkToggle = async () => {
    if (!session) {
      toast.info("Please sign in to bookmark events");
      return;
    }
    const newStatus = !bookmarked;
    setBookmarked(newStatus);
    try {
      const res = await fetch(`/api/events/${eventId}/bookmark`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
        toast.success(data.message);
      }
    } catch {
      setBookmarked(!newStatus);
      toast.error("Failed to update bookmark");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title || "Campus Event",
          text: `Check out ${event?.title} on Eventallify!`,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Event link copied to clipboard!");
    }
  };

  const handleAddToCalendar = () => {
    if (!event) return;
    const start = new Date(event.date);
    const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

    const formatCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${formatCalDate(start)}/${formatCalDate(end)}&details=${encodeURIComponent(
      event.description
    )}&location=${encodeURIComponent(event.venue)}`;

    window.open(googleUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8 animate-pulse">
        <div className="h-8 w-32 rounded-lg bg-muted" />
        <div className="h-96 rounded-3xl bg-muted" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 w-2/3 rounded-lg bg-muted" />
            <div className="h-24 rounded-lg bg-muted" />
          </div>
          <div className="h-64 rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="size-12 text-destructive mx-auto" />
        <h2 className="text-2xl font-bold">Event Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The event you are looking for does not exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/events">Browse All Events</Link>
        </Button>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const deadline = new Date(event.registrationDeadline);
  const isPast = eventDate < new Date();
  const isDeadlinePassed = deadline < new Date();
  const max = event.maxParticipants || 0;
  const count = event.registrationCount || 0;
  const isFull = max > 0 && count >= max;
  const userReg = event.userRegistration;
  const isRegistered = userReg && userReg.status === "confirmed";
  const isWaitlisted = userReg && userReg.status === "waitlisted";
  const bannerUrl = getEventImageUrl(event.imageUrl, event.category);

  return (
    <div className="min-h-screen pb-20">
      {/* Top Breadcrumb & Controls */}
      <div className="border-b border-border/40 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to Events
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBookmarkToggle}
              className={`h-8 gap-1.5 text-xs ${bookmarked ? "text-primary border-primary/40 bg-primary/10" : ""}`}
            >
              {bookmarked ? <BookmarkCheck className="size-3.5 fill-current" /> : <Bookmark className="size-3.5" />}
              {bookmarked ? "Saved" : "Save"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="h-8 gap-1.5 text-xs">
              <Share2 className="size-3.5" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleAddToCalendar} className="h-8 gap-1.5 text-xs">
              <CalendarPlus className="size-3.5" />
              Calendar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* Banner Hero Showcase */}
        <div className="relative rounded-3xl overflow-hidden aspect-[21/9] min-h-[260px] sm:min-h-[380px] bg-muted shadow-2xl border border-border/60">
          <img
            src={bannerUrl}
            alt={event.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <Badge className="capitalize font-semibold text-xs px-3 py-1 bg-background/80 backdrop-blur-md text-foreground border border-border">
              {event.category}
            </Badge>
            {event.status === "completed" ? (
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 backdrop-blur-md text-xs">
                Completed
              </Badge>
            ) : isPast ? (
              <Badge variant="destructive" className="text-xs backdrop-blur-md">
                Past Event
              </Badge>
            ) : isFull ? (
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 backdrop-blur-md text-xs">
                Waitlist Open
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 backdrop-blur-md text-xs">
                Registration Open
              </Badge>
            )}
          </div>

          {/* Hero Content Overlay */}
          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {event.title}
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 max-w-2xl line-clamp-2">
              {event.shortDescription || event.description.slice(0, 150)}
            </p>
          </div>
        </div>

        {/* Main Grid: Content Tabs + Sidebar CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Cols: Navigation Tabs & Tab Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Custom Tab Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border/60 scrollbar-none">
              {[
                { key: "overview", label: "Overview", icon: Calendar },
                { key: "schedule", label: "Schedule", icon: Clock, count: event.schedule?.length },
                { key: "rules", label: "Rules", icon: ListChecks, count: event.rules?.length },
                { key: "prizes", label: "Prizes", icon: Gift, count: event.prizes?.length },
                { key: "speakers", label: "Speakers", icon: Mic, count: event.speakers?.length },
                { key: "faqs", label: "FAQs", icon: HelpCircle, count: event.faqs?.length },
                { key: "reviews", label: "Reviews", icon: Star, count: event.feedbackCount },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      active
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
                  <h3 className="text-lg font-bold">About the Event</h3>
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {event.description}
                  </div>
                </div>

                {/* Organizer Info Box */}
                <div className="rounded-2xl border border-border/60 bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Organized By
                    </span>
                    <h4 className="font-bold text-base text-foreground">
                      {event.organizerName || "Campus Event Committee"}
                    </h4>
                    {event.organizerContact && (
                      <p className="text-xs text-muted-foreground">{event.organizerContact}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="w-fit text-xs px-3 py-1 font-mono">
                    Official College Event
                  </Badge>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Schedule */}
            {activeTab === "schedule" && (
              <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Clock className="size-5 text-primary" /> Event Agenda & Schedule
                </h3>

                {event.schedule && event.schedule.length > 0 ? (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                    {event.schedule.map((item, idx) => (
                      <div key={idx} className="relative space-y-1">
                        <div className="absolute -left-[27px] top-1 size-3 rounded-full bg-primary ring-4 ring-card" />
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary">{item.time}</span>
                          {item.speaker && (
                            <Badge variant="outline" className="text-[10px]">
                              {item.speaker}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm text-foreground">{item.activity}</h4>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No agenda items published yet.</p>
                )}
              </div>
            )}

            {/* TAB CONTENT: Rules */}
            {activeTab === "rules" && (
              <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ListChecks className="size-5 text-primary" /> Rules & Guidelines
                </h3>
                {event.rules && event.rules.length > 0 ? (
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {event.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Standard college conduct rules apply. Please bring your college ID.
                  </p>
                )}
              </div>
            )}

            {/* TAB CONTENT: Prizes */}
            {activeTab === "prizes" && (
              <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Gift className="size-5 text-primary" /> Prizes & Recognition
                </h3>
                {event.prizes && event.prizes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {event.prizes.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 space-y-1"
                      >
                        <span className="font-bold text-xs uppercase tracking-wider text-amber-400">
                          {p.position}
                        </span>
                        <div className="text-lg font-extrabold text-foreground">{p.reward}</div>
                        {p.description && (
                          <p className="text-xs text-muted-foreground">{p.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Certificates of Participation will be awarded to all verified attendees.
                  </p>
                )}
              </div>
            )}

            {/* TAB CONTENT: Speakers */}
            {activeTab === "speakers" && (
              <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Mic className="size-5 text-primary" /> Featured Speakers & Judges
                </h3>
                {event.speakers && event.speakers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {event.speakers.map((sp, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-border/60 bg-muted/20 flex gap-3 items-center"
                      >
                        <div className="size-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                          {sp.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="font-bold text-sm text-foreground truncate">{sp.name}</h4>
                          <p className="text-xs text-primary font-medium truncate">{sp.role}</p>
                          {sp.organization && (
                            <p className="text-[11px] text-muted-foreground truncate">
                              {sp.organization}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Speakers list will be announced soon.</p>
                )}
              </div>
            )}

            {/* TAB CONTENT: FAQs */}
            {activeTab === "faqs" && (
              <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <HelpCircle className="size-5 text-primary" /> Frequently Asked Questions
                </h3>
                {event.faqs && event.faqs.length > 0 ? (
                  <div className="space-y-4 divide-y divide-border/40">
                    {event.faqs.map((faq, idx) => (
                      <div key={idx} className="pt-3 first:pt-0 space-y-1">
                        <h4 className="font-semibold text-sm text-foreground">{faq.question}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No FAQs added for this event.</p>
                )}
              </div>
            )}

            {/* TAB CONTENT: Reviews */}
            {activeTab === "reviews" && (
              <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Attendee Feedback & Ratings</h3>
                    <p className="text-xs text-muted-foreground">
                      Average {event.averageRating || 5.0} / 5.0 ({event.feedbackCount || 0} reviews)
                    </p>
                  </div>
                  {isRegistered && (
                    <Button size="sm" onClick={() => setFeedbackOpen(true)} className="text-xs">
                      <Star className="size-3.5 mr-1" />
                      Rate Event
                    </Button>
                  )}
                </div>

                {event.feedback && event.feedback.length > 0 ? (
                  <div className="space-y-3">
                    {event.feedback.map((f) => (
                      <div key={f.id} className="p-4 rounded-xl border border-border/40 bg-muted/20 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">{f.userName || "Student"}</span>
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {Array.from({ length: f.rating }).map((_, i) => (
                              <Star key={i} className="size-3 fill-current" />
                            ))}
                          </div>
                        </div>
                        {f.comment && <p className="text-xs text-muted-foreground">{f.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No reviews yet. Be the first to review after attending!</p>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Registration & Event Info Card */}
          <div className="lg:col-span-1 space-y-6 sticky top-24">
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xl space-y-6">
              {/* Date, Time, Venue Box */}
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                    <Calendar className="size-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Date</div>
                    <div className="text-xs text-muted-foreground">
                      {format(eventDate, "EEEE, MMMM d, yyyy")}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Time</div>
                    <div className="text-xs text-muted-foreground">
                      {format(eventDate, "h:mm a")}
                      {event.endDate && ` - ${format(new Date(event.endDate), "h:mm a")}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Venue</div>
                    <div className="text-xs text-muted-foreground">{event.venue}</div>
                  </div>
                </div>

                {max > 0 && (
                  <div className="pt-2 border-t border-border/40 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-semibold">{count} / {max} Registered</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isFull ? "bg-amber-400" : "bg-primary"}`}
                        style={{ width: `${Math.min(100, Math.round((count / max) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic CTAs */}
              <div className="pt-2 border-t border-border/60 space-y-3">
                {isRegistered ? (
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span>You are registered! Pass ID: <strong>{userReg?.id}</strong></span>
                    </div>
                    <Button
                      onClick={() => setPassOpen(true)}
                      className="w-full h-11 font-semibold shadow-lg shadow-primary/20"
                    >
                      <Ticket className="size-4 mr-2" />
                      View Digital QR Pass
                    </Button>
                  </div>
                ) : isWaitlisted ? (
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
                      <Clock className="size-4 shrink-0" />
                      <span>Waitlist Position: <strong>#{userReg?.waitlistPosition || 1}</strong></span>
                    </div>
                    <Button asChild variant="outline" className="w-full h-11">
                      <Link href="/my-events">Manage in My Events</Link>
                    </Button>
                  </div>
                ) : isPast ? (
                  <Button disabled className="w-full h-11">
                    Event Completed
                  </Button>
                ) : isDeadlinePassed ? (
                  <Button disabled variant="outline" className="w-full h-11 text-destructive border-destructive/30">
                    Registration Closed
                  </Button>
                ) : (
                  <Button
                    onClick={() => setRegisterOpen(true)}
                    className="w-full h-11 font-bold text-sm bg-gradient-to-r from-primary via-primary/90 to-primary shadow-lg shadow-primary/25"
                  >
                    {isFull ? "Join Waitlist" : "Register Now"}
                  </Button>
                )}

                {/* Organizer Shortcut if admin or creator */}
                {(isAdmin || event.createdBy === session?.user?.id) && (
                  <Button asChild variant="ghost" size="sm" className="w-full text-xs text-primary">
                    <Link href={`/organizer/events/${event.id}/attendance`}>
                      <ShieldCheck className="size-3.5 mr-1.5" />
                      Organizer Attendance Scanner
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <RegistrationDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        event={{
          id: event.id,
          title: event.title,
          date: event.date,
          venue: event.venue,
          category: event.category,
          maxParticipants: event.maxParticipants,
          registrationCount: event.registrationCount,
          customQuestions: event.customQuestions,
        }}
        onSuccess={() => fetchEvent()}
      />

      {/* Digital Pass Modal */}
      {userReg && (
        <DigitalPassModal
          open={passOpen}
          onOpenChange={setPassOpen}
          pass={{
            id: userReg.id,
            status: userReg.status,
            checkedIn: userReg.checkedIn,
            studentName: session?.user?.name || "Student",
            studentEmail: session?.user?.email,
            eventTitle: event.title,
            eventDate: event.date,
            eventEndDate: event.endDate,
            eventVenue: event.venue,
            eventCategory: event.category,
            organizerName: event.organizerName,
          }}
        />
      )}

      {/* Feedback Dialog */}
      <FeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        eventId={event.id}
        eventTitle={event.title}
        onSuccess={() => fetchEvent()}
      />
    </div>
  );
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground">Loading event...</div>}>
      <EventDetailContent eventId={id} />
    </Suspense>
  );
}
