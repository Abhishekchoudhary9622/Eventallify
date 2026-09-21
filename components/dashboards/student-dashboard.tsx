"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/events/event-card";
import { DashboardSkeleton } from "@/components/skeletons";
import {
  Calendar,
  TrendingUp,
  Megaphone,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

interface DashboardData {
  registrations: any[];
  announcements: any[];
  events: any[];
}

function getPriorityColor(p: string) {
  if (p === "urgent" || p === "high")
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  if (p === "important")
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
  return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
}

export function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [regsRes, annRes, eventsRes] = await Promise.all([
        fetch("/api/registrations"),
        fetch("/api/announcements"),
        fetch("/api/events?limit=6&upcoming=true"),
      ]);

      const regsJson = regsRes.ok ? await regsRes.json() : {};
      const registrations = Array.isArray(regsJson) ? regsJson : regsJson.registrations || [];
      const annJson = annRes.ok ? await annRes.json() : [];
      const announcements = Array.isArray(annJson) ? annJson : annJson.announcements || [];
      const eventsData = eventsRes.ok ? await eventsRes.json() : { events: [] };

      setData({
        registrations,
        announcements,
        events: eventsData.events || [],
      });
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center py-20 text-muted-foreground">
          <AlertCircle className="mx-auto size-12 mb-4" />
          <p>Failed to load dashboard data. Please refresh.</p>
        </div>
      </div>
    );
  }

  const upcomingRegs = data.registrations.filter((r) => {
    const rawDate = r.event?.startDate || r.eventDate || r.startDate;
    if (!rawDate) return true;
    const d = new Date(rawDate);
    return isNaN(d.getTime()) || d >= new Date(Date.now() - 24 * 60 * 60 * 1000);
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your events at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Registered Events</p>
              <p className="text-3xl font-bold">{data.registrations.length}</p>
            </div>
            <Calendar className="size-8 text-primary/30" />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-3xl font-bold">{upcomingRegs.length}</p>
            </div>
            <TrendingUp className="size-8 text-green-500/30" />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Announcements</p>
              <p className="text-3xl font-bold">{data.announcements.length}</p>
            </div>
            <Megaphone className="size-8 text-orange-500/30" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Registrations</h2>
          {data.registrations.length > 0 && (
            <Link
              href="/events"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Browse more <ArrowRight className="size-3" />
            </Link>
          )}
        </div>
        {data.registrations.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <Calendar className="mx-auto size-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              You haven&apos;t registered for any events yet.
            </p>
            <Button asChild className="mt-4">
              <Link href="/events">Explore Events</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingRegs.slice(0, 6).map((reg) => {
              const regId = reg._id || reg.id;
              const eventId = reg.eventId || reg.event?._id || reg.event?.id || regId;
              const eventTitle = reg.event?.title || reg.eventTitle || "Campus Event";
              const eventCategory = reg.event?.category || reg.eventCategory || "General";
              const eventVenue = reg.event?.venue || reg.eventVenue || "Campus";
              const rawDate = reg.event?.startDate || reg.eventDate;
              let formattedDate = "Date TBA";
              if (rawDate) {
                const d = new Date(rawDate);
                if (!isNaN(d.getTime())) {
                  formattedDate = format(d, "MMM dd, yyyy 'at' hh:mm a");
                }
              }

              return (
                <Link
                  key={regId}
                  href={`/events/${eventId}`}
                  className="group rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      variant="secondary"
                      className={getPriorityColor(eventCategory)}
                    >
                      {eventCategory}
                    </Badge>
                    <Badge
                      variant={
                        reg.status === "confirmed" ? "default" : "secondary"
                      }
                    >
                      {reg.status || "confirmed"}
                    </Badge>
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {eventTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formattedDate}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {eventVenue}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {data.announcements.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Announcements</h2>
          <div className="space-y-3">
            {data.announcements.slice(0, 3).map((ann) => (
              <div key={ann.id || ann._id} className="rounded-xl border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={getPriorityColor(ann.priority)}
                      >
                        {ann.priority || "normal"}
                      </Badge>
                      <h3 className="font-medium">{ann.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ann.content}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {ann.createdAt ? format(new Date(ann.createdAt), "MMM dd") : "Recent"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.events.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <Link
              href="/events"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.events.map((event) => (
              <EventCard key={event._id || event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
