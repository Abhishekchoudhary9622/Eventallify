"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  Sparkles,
  Plus,
  Users,
  Calendar,
  CheckCircle2,
  Award,
  BarChart3,
  QrCode,
  Clock,
  MapPin,
  AlertCircle,
  Loader2,
  ChevronRight,
  MoreVertical,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getEventImage } from "@/lib/event-images";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface OrganizerMetrics {
  totalEvents: number;
  totalRegistrations: number;
  totalCheckedIn: number;
  totalCertificates: number;
}

export default function OrganizerDashboardPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [metrics, setMetrics] = useState<OrganizerMetrics>({
    totalEvents: 0,
    totalRegistrations: 0,
    totalCheckedIn: 0,
    totalCertificates: 0,
  });
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizerData();
  }, [session]);

  const fetchOrganizerData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/organizer/dashboard");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error("Failed to load organizer dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!session && !sessionLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <AlertCircle className="mx-auto size-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Organizer Access Required</h1>
        <p className="text-muted-foreground mb-6">Sign in to manage club events, track attendance, and issue certificates.</p>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "published":
        return <Badge className="bg-emerald-500 text-white font-medium">Published</Badge>;
      case "pending_approval":
        return <Badge className="bg-amber-500 text-white font-medium">Pending Approval</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "rejected":
        return <Badge variant="destructive">Needs Changes</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-muted-foreground">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="border-b bg-card/40 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-primary mb-1 font-medium">
                <Sparkles className="size-4" /> Event Management Portal
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Organizer Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Create campus events, conduct QR attendance scanning, and analyze student engagement.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild size="default" className="shadow-md shadow-primary/20 gap-2">
                <Link href="/organizer/events/create">
                  <Plus className="size-4" /> Host New Event
                </Link>
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="rounded-2xl border bg-card/70 p-5 backdrop-blur-sm shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Events Created</span>
                <Calendar className="size-4 text-primary" />
              </div>
              <div className="text-3xl font-bold">{metrics.totalEvents}</div>
              <p className="text-xs text-muted-foreground mt-1">Across technical & cultural clubs</p>
            </div>

            <div className="rounded-2xl border bg-card/70 p-5 backdrop-blur-sm shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Total Bookings</span>
                <Users className="size-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-emerald-400">{metrics.totalRegistrations}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered participants</p>
            </div>

            <div className="rounded-2xl border bg-card/70 p-5 backdrop-blur-sm shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">QR Check-Ins</span>
                <CheckCircle2 className="size-4 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-400">{metrics.totalCheckedIn}</div>
              <p className="text-xs text-muted-foreground mt-1">Verified on-site attendees</p>
            </div>

            <div className="rounded-2xl border bg-card/70 p-5 backdrop-blur-sm shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Certificates</span>
                <Award className="size-4 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-amber-400">{metrics.totalCertificates}</div>
              <p className="text-xs text-muted-foreground mt-1">Issued with verification keys</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Your Managed Events</h2>
            <p className="text-xs text-muted-foreground">Select an event to run live attendance or view analytics.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/organizer/events/create">
              <Plus className="size-3.5 mr-1.5" /> New Event
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading your events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-16 text-center bg-card/30">
            <Calendar className="size-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold">No events created yet</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              You haven't hosted any events yet. Use our 5-step wizard with built-in AI assistance to create your first event.
            </p>
            <Button asChild className="mt-6" size="sm">
              <Link href="/organizer/events/create">
                <Plus className="size-4 mr-2" /> Host Your First Event
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {events.map((event) => {
              const imageSrc = getEventImage(event.category, event.image);
              const capacityPercent = event.capacity ? Math.min(100, Math.round(((event.registeredCount || 0) / event.capacity) * 100)) : 0;

              return (
                <div
                  key={event._id}
                  className="flex flex-col lg:flex-row items-stretch justify-between rounded-2xl border bg-card/70 backdrop-blur-sm p-5 gap-5 hover:border-primary/40 hover:shadow-lg transition-all"
                >
                  {/* Left: Thumbnail & Main Info */}
                  <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
                    <div className="relative size-24 sm:size-28 rounded-xl overflow-hidden bg-muted shrink-0">
                      <Image src={imageSrc} alt={event.title} fill className="object-cover" />
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(event.status)}
                        <Badge variant="secondary" className="text-xs uppercase font-medium">
                          {event.category}
                        </Badge>
                        {event.adminApproval && event.adminApproval.status === "pending" && (
                          <span className="text-xs text-amber-400 flex items-center gap-1">
                            <Clock className="size-3" /> Awaiting faculty approval
                          </span>
                        )}
                        {event.adminApproval && event.adminApproval.status === "changes_requested" && (
                          <span className="text-xs text-destructive flex items-center gap-1 font-medium">
                            <ShieldAlert className="size-3" /> Feedback: {event.adminApproval.feedback}
                          </span>
                        )}
                      </div>

                      <Link href={`/events/${event.id || event._id}`}>
                        <h3 className="font-bold text-lg hover:text-primary transition-colors line-clamp-1">
                          {event.title}
                        </h3>
                      </Link>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-primary" />
                          <span>{format(new Date(event.date || event.startDate), "MMM d, yyyy • h:mm a")}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-primary" />
                          <span>{event.venue}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Capacity / Registrations Bar */}
                  <div className="flex flex-col justify-center min-w-[200px] px-2 py-1 bg-muted/20 rounded-xl border border-border/40">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Registrations</span>
                      <span className="font-semibold">
                        {event.registeredCount || 0} / {event.capacity || "∞"}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          capacityPercent >= 100 ? "bg-amber-500" : "bg-primary"
                        }`}
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
                      <span>Attended: {event.checkedInCount || 0}</span>
                      {event.waitlistCount > 0 && <span className="text-amber-400">Waitlist: {event.waitlistCount}</span>}
                    </div>
                  </div>

                  {/* Right: Quick Action Hub */}
                  <div className="flex items-center gap-2 shrink-0 self-center lg:self-center">
                    <Button asChild size="sm" variant="default" className="gap-1.5">
                      <Link href={`/organizer/events/${event._id}/attendance`}>
                        <QrCode className="size-4" /> QR Check-in
                      </Link>
                    </Button>

                    <Button asChild size="sm" variant="outline" className="gap-1.5">
                      <Link href={`/organizer/events/${event._id}/analytics`}>
                        <BarChart3 className="size-4" /> Analytics
                      </Link>
                    </Button>

                    <Button asChild size="icon" variant="ghost" className="size-9">
                      <Link href={`/events/${event._id}`} title="View Public Page">
                        <ExternalLink className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
