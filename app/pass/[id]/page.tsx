"use client";

import { useEffect, useState, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Clock,
  Printer,
  Share2,
  ArrowLeft,
  Ticket,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import QRCode from "qrcode";

function PassContent({ passId }: { passId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [passData, setPassData] = useState<any | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadPass() {
      try {
        const res = await fetch("/api/registrations");
        if (res.ok) {
          const regs = await res.json();
          const match = regs.find(
            (r: any) =>
              r.id === passId ||
              r.id.toLowerCase() === passId.toLowerCase()
          );
          if (match) {
            setPassData(match);

            // Generate QR code if needed
            const qrPayload = JSON.stringify({
              v: "1",
              regId: match.id,
              eventId: match.eventId,
            });
            const qrUrl = await QRCode.toDataURL(qrPayload, {
              width: 320,
              margin: 2,
              color: { dark: "#09090b", light: "#ffffff" },
            });
            setQrDataUrl(qrUrl);
          }
        }
      } catch {
        toast.error("Could not load digital pass");
      } finally {
        setLoading(false);
      }
    }
    loadPass();
  }, [passId]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4 animate-pulse">
        <div className="h-12 w-12 mx-auto rounded-full bg-muted" />
        <div className="h-64 rounded-3xl bg-muted" />
      </div>
    );
  }

  if (!passData) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <Ticket className="size-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Pass Not Found</h2>
        <p className="text-xs text-muted-foreground">
          Could not find a valid digital pass for ID: {passId}.
        </p>
        <Button asChild size="sm">
          <Link href="/my-events">Go to My Events</Link>
        </Button>
      </div>
    );
  }

  const eventDate = new Date(passData.eventDate);

  return (
    <div className="min-h-screen py-10 px-4 flex flex-col items-center justify-center space-y-6">
      {/* Top back navigation */}
      <div className="w-full max-w-md flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="text-xs">
          <Link href="/my-events">
            <ArrowLeft className="size-3.5 mr-1" />
            My Events
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs h-8"
          >
            <Printer className="size-3.5 mr-1" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Event Pass: ${passData.eventTitle}`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Pass URL copied to clipboard!");
              }
            }}
            className="text-xs h-8"
          >
            <Share2 className="size-3.5 mr-1" />
            Share
          </Button>
        </div>
      </div>

      {/* Ticket Container */}
      <div
        id="printable-pass"
        className="w-full max-w-md rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl shadow-black/80 space-y-6 p-6"
      >
        {/* Ticket Header */}
        <div className="flex items-center justify-between pb-4 border-b border-dashed border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <Ticket className="size-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                Eventallify Pass
              </span>
              <div className="font-mono text-xs font-bold text-primary">
                {passData.id}
              </div>
            </div>
          </div>

          <Badge
            variant="outline"
            className={`capitalize text-xs font-semibold px-2.5 py-0.5 ${
              passData.checkedIn
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-blue-500/10 text-blue-400 border-blue-500/30"
            }`}
          >
            {passData.checkedIn ? "Checked In" : "Valid Pass"}
          </Badge>
        </div>

        {/* Event Title & Metadata */}
        <div className="space-y-2">
          <Badge
            variant="secondary"
            className="capitalize text-[10px] font-medium bg-zinc-900 text-zinc-300 border-zinc-800"
          >
            {passData.eventCategory || "Campus Event"}
          </Badge>
          <h1 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
            {passData.eventTitle}
          </h1>
        </div>

        {/* Date, Time, Venue */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 text-xs">
          <div className="space-y-1">
            <span className="text-zinc-500 flex items-center gap-1.5 font-medium">
              <Calendar className="size-3.5 text-primary" /> Date
            </span>
            <span className="font-semibold text-zinc-200 block">
              {format(eventDate, "EEE, MMM d, yyyy")}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-zinc-500 flex items-center gap-1.5 font-medium">
              <Clock className="size-3.5 text-primary" /> Time
            </span>
            <span className="font-semibold text-zinc-200 block">
              {format(eventDate, "h:mm a")}
            </span>
          </div>

          <div className="col-span-2 pt-2 border-t border-zinc-800/60 space-y-1">
            <span className="text-zinc-500 flex items-center gap-1.5 font-medium">
              <MapPin className="size-3.5 text-primary" /> Venue
            </span>
            <span className="font-semibold text-zinc-200 block truncate">
              {passData.eventVenue}
            </span>
          </div>
        </div>

        {/* Attendee Details */}
        <div className="flex items-center justify-between px-2 text-xs">
          <div>
            <span className="text-zinc-500 block">Attendee ID</span>
            <span className="font-mono font-semibold text-zinc-200 text-sm">
              {passData.id}
            </span>
          </div>
          <div className="text-right">
            <span className="text-zinc-500 block">Status</span>
            <span className="flex items-center gap-1 font-mono text-emerald-400 text-xs">
              <ShieldCheck className="size-3.5" /> Verified Pass
            </span>
          </div>
        </div>

        {/* QR Section */}
        <div className="p-6 rounded-2xl bg-white text-zinc-950 flex flex-col items-center justify-center space-y-2 text-center shadow-xl">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Pass QR Code"
              className="size-48 object-contain rounded-md"
            />
          ) : (
            <div className="size-48 bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs">
              QR Not Available
            </div>
          )}
          <span className="font-mono text-xs font-bold tracking-widest text-zinc-800">
            {passData.id}
          </span>
          <span className="text-[10px] text-zinc-500">
            Show this QR ticket at the entrance scanner
          </span>
        </div>

        <Button asChild variant="outline" className="w-full h-10 border-zinc-700 text-zinc-200 hover:bg-zinc-800">
          <Link href={`/events/${passData.eventId}`}>
            View Event Details Page
            <ExternalLink className="size-3.5 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function PassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading pass...</div>}>
      <PassContent passId={id} />
    </Suspense>
  );
}
