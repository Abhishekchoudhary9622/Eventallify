"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  BarChart3,
  Users,
  CheckCircle2,
  Award,
  Star,
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  TrendingUp,
  MessageSquare,
  QrCode,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function EventAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalRegistrations: 0,
    checkedInCount: 0,
    turnoutRate: 0,
    capacityRate: 0,
    avgRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  useEffect(() => {
    fetchAnalytics();
  }, [eventId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [eventRes, feedbackRes, attendanceRes] = await Promise.all([
        fetch(`/api/events/${eventId}`),
        fetch(`/api/events/${eventId}/feedback`),
        fetch(`/api/events/${eventId}/attendance`),
      ]);

      if (eventRes.ok) {
        const d = await eventRes.json();
        setEventData(d.event);
      }

      let fbData = { reviews: [], avgRating: 0, totalReviews: 0 };
      if (feedbackRes.ok) {
        fbData = await feedbackRes.json();
        setReviews(fbData.reviews || []);
      }

      let attData = { stats: { total: 0, checkedIn: 0, rate: 0 } };
      if (attendanceRes.ok) {
        attData = await attendanceRes.json();
      }

      // Calculate rating distribution
      const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      (fbData.reviews || []).forEach((r: any) => {
        if (dist[r.rating] !== undefined) {
          dist[r.rating]++;
        }
      });

      const cap = eventData?.capacity || 100;
      const regCount = attData.stats.total || eventData?.registeredCount || 0;
      const capRate = Math.min(100, Math.round((regCount / (eventData?.capacity || 100)) * 100));

      setStats({
        totalRegistrations: regCount,
        checkedInCount: attData.stats.checkedIn,
        turnoutRate: attData.stats.rate,
        capacityRate: capRate,
        avgRating: fbData.avgRating || 0,
        totalReviews: fbData.totalReviews || 0,
        ratingDistribution: dist,
      });
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Calculating event metrics & engagement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="border-b bg-card/40 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/organizer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3"
          >
            <ArrowLeft className="size-3.5" /> Back to Organizer Hub
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-primary mb-1 font-medium">
                <BarChart3 className="size-4" /> Performance & Attendee Intelligence
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{eventData?.title || "Event Analytics"}</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Real-time student conversion, attendance check-ins, and participant feedback ratings.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline" className="gap-1.5">
                <Link href={`/organizer/events/${eventId}/attendance`}>
                  <QrCode className="size-4" /> Scanner
                </Link>
              </Button>
              <Button asChild size="sm" className="gap-1.5">
                <Link href={`/events/${eventId}`}>
                  <ExternalLink className="size-4" /> Public Page
                </Link>
              </Button>
            </div>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="rounded-2xl border bg-card/70 p-5 backdrop-blur-sm shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Registrations</span>
                <Users className="size-4 text-primary" />
              </div>
              <div className="text-3xl font-bold">{stats.totalRegistrations}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.capacityRate}% of {eventData?.capacity || "unlimited"} seats filled
              </div>
            </div>

            <div className="rounded-2xl border bg-card/70 p-5 backdrop-blur-sm shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Live Check-Ins</span>
                <CheckCircle2 className="size-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-emerald-400">{stats.checkedInCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Verified on-site participants</div>
            </div>

            <div className="rounded-2xl border bg-card/70 p-5 backdrop-blur-sm shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Turnout Rate</span>
                <TrendingUp className="size-4 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-400">{stats.turnoutRate}%</div>
              <div className="text-xs text-muted-foreground mt-1">Check-in conversion percentage</div>
            </div>

            <div className="rounded-2xl border bg-card/70 p-5 backdrop-blur-sm shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Average Rating</span>
                <Star className="size-4 text-amber-400 fill-amber-400" />
              </div>
              <div className="text-3xl font-bold text-amber-400">
                {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "N/A"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">From {stats.totalReviews} attendee reviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Rating Distribution & Feedback */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rating Breakdown */}
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Star className="size-5 text-amber-400" /> Attendee Rating Distribution
              </h3>

              <div className="space-y-2.5 pt-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.ratingDistribution[star] || 0;
                  const pct = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 w-12 text-muted-foreground shrink-0">
                        <span>{star}</span>
                        <Star className="size-3 text-amber-400 fill-amber-400" />
                      </div>

                      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="w-12 text-right text-muted-foreground shrink-0">{count} ({pct}%)</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attendee Reviews & Comments */}
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <MessageSquare className="size-5 text-primary" /> Attendee Feedback & Testimonials
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {reviews.length} Reviews
                </Badge>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-10 rounded-xl border border-dashed bg-muted/20 p-4 text-muted-foreground text-xs">
                  No written reviews submitted yet for this event.
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-4 rounded-xl border bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-foreground">{rev.userName}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`size-3 ${
                                  s <= rev.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {format(new Date(rev.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      {rev.comment && (
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                          "{rev.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Logistics Summary & Certificate Summary */}
          <div className="space-y-6">
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Calendar className="size-5 text-primary" /> Event Logistics
              </h3>

              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex justify-between border-b pb-2">
                  <span>Category:</span>
                  <Badge variant="secondary" className="text-[10px]">{eventData?.category}</Badge>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Venue:</span>
                  <span className="font-medium text-foreground">{eventData?.venue}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Host Club:</span>
                  <span className="font-medium text-foreground">{eventData?.organizer?.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Event Date:</span>
                  <span>{eventData?.startDate ? format(new Date(eventData.startDate), "MMM d, yyyy") : "TBD"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge className="capitalize text-[10px] bg-emerald-500">{eventData?.status}</Badge>
                </div>
              </div>
            </div>

            {/* Certificate Issuance Callout */}
            <div className="rounded-2xl border bg-gradient-to-br from-amber-500/10 via-card to-card p-6 space-y-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-amber-400">
                <Award className="size-5" /> Verified Certificates
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Issue certificates to verified attendees with cryptographically unique credential keys.
              </p>
              <Button asChild size="sm" variant="outline" className="w-full text-amber-400 border-amber-500/30">
                <Link href={`/organizer/events/${eventId}/attendance`}>
                  Manage Issuance in Attendance Hub
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
