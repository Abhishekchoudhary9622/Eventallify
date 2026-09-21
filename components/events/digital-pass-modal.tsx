"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Clock,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Ticket,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import QRCode from "qrcode";
import { toast } from "sonner";

export function DigitalPassModal({
  open,
  onOpenChange,
  pass,
  isOpen,
  onClose,
  registration,
  event,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  pass?: any;
  isOpen?: boolean;
  onClose?: () => void;
  registration?: any;
  event?: any;
}) {
  const isModalOpen = open !== undefined ? open : isOpen !== undefined ? isOpen : false;
  const handleClose = onOpenChange || onClose || (() => {});

  const currentReg = registration || pass || {};
  const currentEvent = event || currentReg.event || pass?.event || {};

  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const passId = currentReg.registrationId || currentReg.id || "REG-SAMPLE";
  const studentName = currentReg.userName || currentReg.studentName || "Student";
  const studentEmail = currentReg.userEmail || currentReg.studentEmail || "";
  const eventTitle = currentEvent.title || currentReg.eventTitle || "Campus Event";
  const eventCategory = currentEvent.category || currentReg.eventCategory || "General";
  const eventVenue = currentEvent.venue || currentReg.eventVenue || "Campus Venue";
  const rawDate = currentEvent.startDate || currentEvent.date || currentReg.eventDate;

  let eventDate: Date | null = null;
  if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) eventDate = d;
  }

  const isCheckedIn = currentReg.checkedIn || currentReg.status === "attended";

  useEffect(() => {
    if (isModalOpen) {
      const payload = currentReg.qrPayload || JSON.stringify({
        v: "1",
        regId: passId,
        eventId: currentReg.eventId || currentEvent._id || currentEvent.id,
        t: "tok_" + passId,
      });

      QRCode.toDataURL(payload, {
        width: 300,
        margin: 2,
        color: { dark: "#09090b", light: "#ffffff" },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [isModalOpen, currentReg, currentEvent, passId]);

  if (!isModalOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const targetUrl = `${window.location.origin}/pass/${currentEvent._id || currentReg.eventId || passId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Digital Pass: ${eventTitle}`,
          text: `Here is my event pass for ${eventTitle} (ID: ${passId}) on Eventallify.`,
          url: targetUrl,
        });
      } catch {
        // Share cancelled
      }
    } else {
      navigator.clipboard.writeText(targetUrl);
      toast.success("Pass link copied to clipboard!");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(val) => !val && (onClose ? onClose() : onOpenChange && onOpenChange(false))}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-zinc-950 border-zinc-800 text-zinc-100 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Digital Event Pass</DialogTitle>
        </DialogHeader>

        {/* Printable Ticket Area */}
        <div id="printable-pass" className="p-6 space-y-6">
          {/* Ticket Header */}
          <div className="flex items-center justify-between pb-4 border-b border-dashed border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                <Ticket className="size-4" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                  Eventallify Campus Pass
                </span>
                <div className="font-mono text-xs font-semibold text-primary">
                  {passId}
                </div>
              </div>
            </div>

            <Badge
              variant="outline"
              className={`capitalize text-xs font-semibold px-2.5 py-0.5 ${
                isCheckedIn
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-blue-500/10 text-blue-400 border-blue-500/30"
              }`}
            >
              {isCheckedIn ? "Checked In" : "Valid Pass"}
            </Badge>
          </div>

          {/* Event Title & Metadata */}
          <div className="space-y-3">
            <Badge
              variant="secondary"
              className="capitalize text-[11px] font-medium bg-zinc-900 text-zinc-300 border-zinc-800"
            >
              {eventCategory}
            </Badge>
            <h2 className="text-2xl font-extrabold tracking-tight text-white leading-tight">
              {eventTitle}
            </h2>
            <div className="text-xs text-zinc-400">
              Organized by <span className="text-zinc-200">{currentEvent?.organizer?.name || "Campus Club"}</span>
            </div>
          </div>

          {/* Logistics Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-xs">
            <div className="space-y-1">
              <span className="text-zinc-500 flex items-center gap-1.5 font-medium">
                <Calendar className="size-3.5 text-primary" /> Date
              </span>
              <span className="font-semibold text-zinc-200 block">
                {eventDate ? format(eventDate, "EEE, MMM d, yyyy") : "Date TBA"}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-zinc-500 flex items-center gap-1.5 font-medium">
                <Clock className="size-3.5 text-primary" /> Time
              </span>
              <span className="font-semibold text-zinc-200 block">
                {eventDate ? format(eventDate, "h:mm a") : "Time TBA"}
              </span>
            </div>

            <div className="col-span-2 pt-2 border-t border-zinc-800/60 space-y-1">
              <span className="text-zinc-500 flex items-center gap-1.5 font-medium">
                <MapPin className="size-3.5 text-primary" /> Venue
              </span>
              <span className="font-semibold text-zinc-200 block truncate">
                {eventVenue}
              </span>
            </div>
          </div>

          {/* Attendee Details */}
          <div className="flex items-center justify-between px-2 text-xs">
            <div>
              <span className="text-zinc-500 block">Attendee</span>
              <span className="font-semibold text-zinc-200 text-sm">
                {studentName}
              </span>
              {studentEmail && (
                <span className="text-[11px] text-zinc-400 block">{studentEmail}</span>
              )}
            </div>
            <div className="text-right">
              <span className="text-zinc-500 block">Verification</span>
              <span className="flex items-center gap-1 font-mono text-emerald-400 text-xs">
                <ShieldCheck className="size-3.5" /> Encrypted QR
              </span>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="relative p-6 rounded-2xl bg-white text-zinc-950 flex flex-col items-center justify-center space-y-2 text-center shadow-lg">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Ticket QR Code"
                className="size-48 object-contain rounded-md"
              />
            ) : (
              <div className="size-48 bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs">
                Generating QR...
              </div>
            )}
            <span className="font-mono text-xs font-bold tracking-wider text-zinc-700">
              {passId}
            </span>
            <span className="text-[10px] text-zinc-500">
              Show this QR code at the entrance for attendance check-in
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-10 border-zinc-700 text-zinc-200 hover:bg-zinc-800"
            onClick={handlePrint}
          >
            <Printer className="size-4 mr-2" />
            Print Pass
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-10 border-zinc-700 text-zinc-200 hover:bg-zinc-800"
            onClick={handleShare}
          >
            <Share2 className="size-4 mr-2" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
