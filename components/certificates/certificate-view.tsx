"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Calendar,
  CheckCircle2,
  Download,
  Printer,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export interface CertificateData {
  _id?: string;
  id?: string;
  certificateNumber?: string;
  studentName?: string;
  userName?: string;
  eventTitle?: string;
  eventDate?: string | Date;
  issueDate?: string | Date;
  organizerName?: string;
  verificationCode?: string;
  issuedAt?: string | Date;
  createdAt?: string | Date;
  venue?: string;
  category?: string;
}

export function CertificateView({
  cert,
  certificate,
}: {
  cert?: CertificateData;
  certificate?: CertificateData;
}) {
  const c = cert || certificate || ({} as CertificateData);
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const certId = c.certificateNumber || c.id || c.verificationCode || "CERT-DEMO";
  const studentName = c.studentName || c.userName || "Student Attendee";
  const eventTitle = c.eventTitle || "Campus Technical Workshop";
  const organizer = c.organizerName || "VIT Chennai Campus Organization";

  const rawEventDate = c.eventDate || c.issueDate || c.createdAt;
  let formattedEventDate = "Recent Event";
  if (rawEventDate) {
    const d = new Date(rawEventDate);
    if (!isNaN(d.getTime())) {
      formattedEventDate = format(d, "MMMM d, yyyy");
    }
  }

  const rawIssuedDate = c.issuedAt || c.issueDate || c.createdAt || new Date();
  let formattedIssuedDate = format(new Date(), "MMM d, yyyy");
  if (rawIssuedDate) {
    const d = new Date(rawIssuedDate);
    if (!isNaN(d.getTime())) {
      formattedIssuedDate = format(d, "MMM d, yyyy");
    }
  }

  const verifyUrl = `/verify/${certId}`;

  return (
    <div className="space-y-6">
      {/* Certificate Frame Container */}
      <div
        ref={certRef}
        id="printable-certificate"
        className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border-4 border-amber-500/40 bg-zinc-950 p-8 sm:p-12 text-zinc-100 shadow-2xl shadow-amber-500/5"
      >
        {/* Decorative Corner Ornaments */}
        <div className="absolute top-3 left-3 size-12 border-t-2 border-l-2 border-amber-400/60" />
        <div className="absolute top-3 right-3 size-12 border-t-2 border-r-2 border-amber-400/60" />
        <div className="absolute bottom-3 left-3 size-12 border-b-2 border-l-2 border-amber-400/60" />
        <div className="absolute bottom-3 right-3 size-12 border-b-2 border-r-2 border-amber-400/60" />

        {/* Subtle Watermark Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          {/* Header Badge & Seal */}
          <div className="flex items-center gap-2">
            <div className="size-14 rounded-full bg-amber-500/10 border-2 border-amber-400/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
              <Award className="size-7" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold tracking-[0.25em] text-amber-400/90 uppercase">
              Eventallify Campus Network
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-serif">
              Certificate of Participation
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 italic">
              This is to officially certify that
            </p>
          </div>

          {/* Student Name */}
          <div className="w-full max-w-md py-2 border-b-2 border-amber-400/40">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-300 font-serif">
              {studentName}
            </h2>
          </div>

          {/* Event description */}
          <div className="max-w-xl text-sm sm:text-base text-zinc-300 leading-relaxed">
            has actively participated and successfully completed all required sessions for{" "}
            <span className="font-bold text-white">&ldquo;{eventTitle}&rdquo;</span> organized by{" "}
            <span className="font-semibold text-zinc-200">{organizer}</span> on{" "}
            <span className="font-semibold text-zinc-200">{formattedEventDate}</span>.
          </div>

          {/* Footer Signatures and Verification */}
          <div className="w-full pt-8 mt-4 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-xs">
            {/* Organizer Signature Area */}
            <div className="space-y-1 text-center sm:text-left">
              <div className="font-serif italic text-sm text-zinc-300">{organizer}</div>
              <div className="h-0.5 w-32 bg-zinc-700 mx-auto sm:mx-0" />
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">
                Event Organizer
              </span>
            </div>

            {/* Verified Stamp */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px]">
                <ShieldCheck className="size-3.5" /> Authenticated
              </div>
              <span className="font-mono text-[10px] text-zinc-500">ID: {certId}</span>
            </div>

            {/* Date and Verification link */}
            <div className="space-y-1 text-center sm:text-right">
              <span className="text-zinc-400 block font-medium">Issued {formattedIssuedDate}</span>
              <div className="font-mono text-[10px] text-amber-400/80">Code: {certId}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={handlePrint} className="h-10 font-semibold px-6">
          <Printer className="size-4 mr-2" />
          Print / Save PDF
        </Button>
        <Button asChild variant="outline" className="h-10">
          <Link href={verifyUrl} target="_blank">
            <ExternalLink className="size-4 mr-2" />
            Public Verification Page
          </Link>
        </Button>
      </div>
    </div>
  );
}
