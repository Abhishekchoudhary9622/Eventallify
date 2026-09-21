"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns";

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events?limit=100&upcoming=true");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEventDate = (e: any): Date => {
    const raw = e.startDate || e.date;
    if (!raw) return new Date();
    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(getEventDate(e), day));

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const monthEvents = events
    .filter((e) => isSameMonth(getEventDate(e), currentMonth))
    .sort((a, b) => getEventDate(a).getTime() - getEventDate(b).getTime());

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground text-sm">
            Upcoming events by date
          </p>
        </div>

        <Button asChild size="sm">
          <Link href="/events">Explore Events</Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <h2 className="text-lg font-bold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>

        <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-semibold text-muted-foreground">
          {weekdays.map((day) => (
            <div key={day} className="py-2.5">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dayEvents = getEventsForDay(day);
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <div
                key={i}
                className={`min-h-[105px] border-b border-r p-2 last:border-r-0 transition-colors ${
                  !inMonth ? "bg-muted/10 opacity-40" : "bg-card/40"
                } ${today ? "ring-1 ring-inset ring-primary/40 bg-primary/5" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      today
                        ? "flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shadow-sm"
                        : inMonth
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="size-1.5 rounded-full bg-primary" />
                  )}
                </div>

                <div className="mt-1.5 space-y-1">
                  {dayEvents.slice(0, 2).map((event) => {
                    const eId = event._id || event.id;
                    return (
                      <Link
                        key={eId}
                        href={`/events/${eId}`}
                        className="block rounded-md px-1.5 py-0.5 text-[11px] font-medium bg-primary/15 text-primary hover:bg-primary/25 transition-colors truncate"
                        title={event.title}
                      >
                        {event.title}
                      </Link>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <span className="block text-[10px] text-muted-foreground font-medium px-1">
                      +{dayEvents.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Events List for Month */}
      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <CalendarIcon className="size-5 text-primary" />
          Events in {format(currentMonth, "MMMM yyyy")} ({monthEvents.length})
        </h3>

        {monthEvents.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No events scheduled for this month. Explore other months or check back soon!
          </div>
        ) : (
          <div className="space-y-3">
            {monthEvents.map((event) => {
              const eDate = getEventDate(event);
              const eId = event._id || event.id;

              return (
                <Link
                  key={eId}
                  href={`/events/${eId}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border p-3.5 hover:bg-muted/40 hover:border-primary/40 transition-all gap-3 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[48px] p-1 rounded-lg bg-muted/60 border border-border/60">
                      <p className="text-[10px] uppercase font-bold text-primary">
                        {format(eDate, "MMM")}
                      </p>
                      <p className="text-base font-extrabold text-foreground">
                        {format(eDate, "dd")}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 text-primary" /> {format(eDate, "h:mm a")}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-primary" /> {event.venue}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Badge variant="secondary" className="capitalize text-xs self-start sm:self-auto">
                    {event.category || "Event"}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
