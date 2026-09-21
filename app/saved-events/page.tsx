"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function SavedEventsPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Technical", "Cultural", "Sports", "Academic", "Workshop", "Hackathon"];

  useEffect(() => {
    fetchSavedEvents();
  }, [session]);

  const fetchSavedEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bookmarks");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error("Failed to load bookmarks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = (eventId: string, isBookmarked: boolean) => {
    if (!isBookmarked) {
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
      toast.success("Removed from saved events");
    }
  };

  const filteredEvents = selectedCategory === "All"
    ? events
    : events.filter((e) => e.category?.toLowerCase() === selectedCategory.toLowerCase());

  if (!session && !sessionLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <AlertCircle className="mx-auto size-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Sign in to view saved events</h1>
        <p className="text-muted-foreground mb-6">Create a shortlist of events you want to register for later.</p>
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
                <Bookmark className="size-4" /> Personal Shortlist
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Saved Events</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Keep track of workshops, hackathons, and activities you are interested in.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/events">Explore More Events</Link>
            </Button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-6 pb-1 scrollbar-none">
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? "default" : "outline"}
                className={`rounded-full text-xs shrink-0 ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-background/80 hover:bg-muted"
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading your saved events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-16 text-center bg-card/30">
            <Bookmark className="size-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold">No saved events</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              {selectedCategory === "All"
                ? "You haven't bookmarked any events yet. Click the bookmark icon on any event card to save it for quick access."
                : `No saved events found in the "${selectedCategory}" category.`}
            </p>
            <Button asChild className="mt-6" size="sm">
              <Link href="/events">
                <Sparkles className="size-4 mr-2" /> Explore Campus Events
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                isBookmarkedInitial={true}
                onBookmarkToggle={(isBookmarked) => handleBookmarkToggle(event._id, isBookmarked)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
