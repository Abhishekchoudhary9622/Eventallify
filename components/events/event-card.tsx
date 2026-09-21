"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export interface EventCardData {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  shortDescription?: string;
  startDate?: string | Date;
  date?: string | Date;
  endDate?: string | Date | null;
  venue: string;
  category: string;
  image?: string | null;
  imageUrl?: string | null;
  registrationDeadline?: string | Date | null;
  deadline?: string | Date | null;
  capacity?: number | null;
  maxParticipants?: number | null;
  registeredCount?: number;
  registrationCount?: number;
  status?: string;
}

export interface EventCardProps {
  event: EventCardData;
  isBookmarkedInitial?: boolean;
  onBookmarkToggle?: (isBookmarked: boolean) => void;
}

export function EventCard({
  event,
  isBookmarkedInitial = false,
  onBookmarkToggle,
}: EventCardProps) {
  const eventId = event._id || event.id || "";
  const rawDate = event.startDate || event.date;

  let eventDate: Date | null = null;
  if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) eventDate = d;
  }

  const isPast = eventDate ? eventDate < new Date() : false;
  const max = event.capacity || event.maxParticipants || 0;
  const count = event.registeredCount || event.registrationCount || 0;
  const isFull = max > 0 && count >= max;

  return (
    <div className="flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
      <div className="p-6 flex flex-1 flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="capitalize text-xs">
              {event.category || "General"}
            </Badge>
            {isPast ? (
              <Badge variant="outline" className="text-muted-foreground text-xs">
                Past
              </Badge>
            ) : isFull ? (
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-xs">
                Full
              </Badge>
            ) : null}
          </div>

          <h3 className="font-semibold text-lg leading-tight line-clamp-1">
            <Link href={`/events/${eventId}`} className="hover:text-primary transition-colors">
              {event.title}
            </Link>
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.shortDescription || event.description}
          </p>
        </div>

        <div className="space-y-3 pt-2 border-t text-sm text-muted-foreground">
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 text-primary" />
              <span>
                {eventDate ? format(eventDate, "MMM dd, yyyy • hh:mm a") : "Date TBA"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 text-primary" />
              <span className="truncate">{event.venue || "Campus Venue TBA"}</span>
            </div>

            {max > 0 && (
              <div className="flex items-center gap-2">
                <Users className="size-3.5 text-primary" />
                <span>
                  {count} / {max} registered
                </span>
              </div>
            )}
          </div>

          <Button asChild className="w-full" size="sm">
            <Link href={`/events/${eventId}`}>
              View Details <ArrowRight className="size-3.5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

