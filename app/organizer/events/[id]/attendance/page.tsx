"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Award,
  ArrowLeft,
  Camera,
  Loader2,
  RefreshCw,
  Clock,
  Check,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function AttendanceScannerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const { data: session } = authClient.useSession();
  const [eventData, setEventData] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState({ total: 0, checkedIn: 0, rate: 0 });
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Scanner state
  const [manualInput, setManualInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [scanResult, setScanResult] = useState<{
    status: "success" | "duplicate" | "error";
    message: string;
    participant?: any;
  } | null>(null);

  // Certificate issuance
  const [issuingCerts, setIssuingCerts] = useState(false);

  useEffect(() => {
    fetchAttendanceData();
  }, [eventId]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}/attendance`);
      if (res.ok) {
        const data = await res.json();
        setEventData(data.event);
        setAttendanceStats(data.stats);
        setParticipants(data.participants || []);
      } else {
        toast.error("Failed to load attendance data");
      }
    } catch {
      toast.error("Error fetching event attendees");
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = async (customRegId?: string) => {
    const idToVerify = customRegId || manualInput.trim();
    if (!idToVerify) {
      toast.error("Please enter a Registration ID or QR payload");
      return;
    }

    setVerifying(true);
    setScanResult(null);

    try {
      let payloadToSend: any = { eventId };

      if (idToVerify.startsWith("{") && idToVerify.endsWith("}")) {
        // Raw QR payload
        payloadToSend.qrPayload = idToVerify;
      } else {
        // Manual registration ID or student ID
        payloadToSend.registrationId = idToVerify;
      }

      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSend),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.alreadyCheckedIn) {
          setScanResult({
            status: "duplicate",
            message: `Student was already checked in at ${format(new Date(data.checkedInAt), "h:mm a")}`,
            participant: data.registration,
          });
          toast.warning("Duplicate check-in detected!");
        } else {
          setScanResult({
            status: "success",
            message: "Attendee verified and checked in successfully!",
            participant: data.registration,
          });
          toast.success(`Checked in ${data.registration.userName}!`);
          setManualInput("");
          fetchAttendanceData();
        }
      } else {
        setScanResult({
          status: "error",
          message: data.error || "Invalid ticket pass or registration not found",
        });
        toast.error(data.error || "Check-in failed");
      }
    } catch {
      setScanResult({
        status: "error",
        message: "Network error during check-in verification",
      });
    } finally {
      setVerifying(false);
    }
  };

  const issueCertificates = async () => {
    if (attendanceStats.checkedIn === 0) {
      toast.error("No attendees have been checked in yet.");
      return;
    }

    setIssuingCerts(true);
    try {
      const res = await fetch(`/api/events/${eventId}/certificates`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Issued ${data.issuedCount} verified certificates! Attendees can now view them on their profile.`);
      } else {
        toast.error(data.error || "Failed to issue certificates");
      }
    } catch {
      toast.error("Error issuing certificates");
    } finally {
      setIssuingCerts(false);
    }
  };

  const exportCSV = () => {
    if (participants.length === 0) return toast.info("No participants to export");
    const headers = ["Registration ID", "Student Name", "Email", "Status", "Checked In", "Check-in Time"];
    const rows = participants.map((p) => [
      p.registrationId,
      p.userName,
      p.userEmail,
      p.status,
      p.checkedIn ? "Yes" : "No",
      p.checkedInAt ? format(new Date(p.checkedInAt), "yyyy-MM-dd HH:mm:ss") : "N/A",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${eventData?.title?.replace(/\s+/g, "_") || "event"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Attendance report exported to CSV");
  };

  const filteredParticipants = participants.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.userName?.toLowerCase().includes(q) ||
      p.userEmail?.toLowerCase().includes(q) ||
      p.registrationId?.toLowerCase().includes(q)
    );
  });

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
                <QrCode className="size-4" /> Live On-Site Attendance
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{eventData?.title || "Event Attendance"}</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Scan attendee QR passes or look up student registration IDs for real-time verification.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                onClick={issueCertificates}
                disabled={issuingCerts || attendanceStats.checkedIn === 0}
              >
                {issuingCerts ? <Loader2 className="size-4 animate-spin" /> : <Award className="size-4" />}
                Issue Certificates ({attendanceStats.checkedIn})
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={exportCSV}>
                <FileSpreadsheet className="size-4" /> Export CSV
              </Button>
            </div>
          </div>

          {/* Live Attendance Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="rounded-xl border bg-card/60 p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Total Registrations</div>
              <div className="text-2xl font-bold">{attendanceStats.total}</div>
            </div>

            <div className="rounded-xl border bg-card/60 p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Checked In</div>
              <div className="text-2xl font-bold text-emerald-400">{attendanceStats.checkedIn}</div>
            </div>

            <div className="rounded-xl border bg-card/60 p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Pending Check-in</div>
              <div className="text-2xl font-bold text-amber-400">
                {Math.max(0, attendanceStats.total - attendanceStats.checkedIn)}
              </div>
            </div>

            <div className="rounded-xl border bg-card/60 p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Turnout Rate</div>
              <div className="text-2xl font-bold text-primary">{attendanceStats.rate}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Scanner & Directory Body */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="scanner" className="space-y-6">
          <TabsList className="grid grid-cols-2 max-w-md">
            <TabsTrigger value="scanner" className="gap-2">
              <QrCode className="size-4" /> QR Scanner & ID Check-in
            </TabsTrigger>
            <TabsTrigger value="directory" className="gap-2">
              <Users className="size-4" /> Attendee Directory ({participants.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Scanner */}
          <TabsContent value="scanner" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Input & Scanner Interface */}
              <div className="rounded-2xl border bg-card p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Camera className="size-5 text-primary" /> QR & Registration ID Verification
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Scan the student’s Digital QR Pass or enter their unique 6-digit registration code (e.g. <code>REG-A4B72C</code>).
                  </p>
                </div>

                {/* Input Field */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleManualCheckIn()}
                      placeholder="Paste QR payload or enter REG-XXXXXX..."
                      className="flex-1 px-4 py-3 text-sm rounded-xl border bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <Button
                      onClick={() => handleManualCheckIn()}
                      disabled={verifying || !manualInput.trim()}
                      className="px-6 shadow-md shadow-primary/20"
                    >
                      {verifying ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                      Check In
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Tip: Barcode scanners connected via USB or Bluetooth will automatically paste into this box and trigger check-in.
                  </p>
                </div>

                {/* Simulated Camera Viewfinder */}
                <div className="relative h-64 rounded-2xl border-2 border-dashed border-primary/30 bg-muted/20 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                  <div className="size-40 border-2 border-primary/60 rounded-xl relative flex items-center justify-center animate-pulse">
                    <div className="absolute top-0 left-0 size-3 border-t-2 border-l-2 border-primary" />
                    <div className="absolute top-0 right-0 size-3 border-t-2 border-r-2 border-primary" />
                    <div className="absolute bottom-0 left-0 size-3 border-b-2 border-l-2 border-primary" />
                    <div className="absolute bottom-0 right-0 size-3 border-b-2 border-r-2 border-primary" />
                    <QrCode className="size-16 text-primary/40" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Ready for scanning. Position attendee pass within frame.
                  </p>
                </div>
              </div>

              {/* Right: Verification Status Display */}
              <div className="rounded-2xl border bg-card p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-4">Verification Result</h3>

                  {scanResult ? (
                    <div
                      className={`p-6 rounded-2xl border text-center space-y-4 animate-in fade-in-50 zoom-in-95 duration-200 ${
                        scanResult.status === "success"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : scanResult.status === "duplicate"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "bg-destructive/10 border-destructive/30 text-destructive"
                      }`}
                    >
                      <div className="mx-auto size-16 rounded-full flex items-center justify-center bg-background/80 shadow-md">
                        {scanResult.status === "success" && <CheckCircle2 className="size-8 text-emerald-500" />}
                        {scanResult.status === "duplicate" && <Clock className="size-8 text-amber-500" />}
                        {scanResult.status === "error" && <X className="size-8 text-destructive" />}
                      </div>

                      <div>
                        <h4 className="font-bold text-lg text-foreground">
                          {scanResult.status === "success"
                            ? "Verified & Checked In!"
                            : scanResult.status === "duplicate"
                            ? "Already Checked In"
                            : "Invalid Ticket Pass"}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">{scanResult.message}</p>
                      </div>

                      {scanResult.participant && (
                        <div className="text-left bg-card/90 p-4 rounded-xl border border-border/60 text-xs text-foreground space-y-2 mt-4">
                          <div className="flex justify-between border-b pb-1.5">
                            <span className="text-muted-foreground">Attendee Name:</span>
                            <span className="font-semibold">{scanResult.participant.userName}</span>
                          </div>
                          <div className="flex justify-between border-b pb-1.5">
                            <span className="text-muted-foreground">Email:</span>
                            <span>{scanResult.participant.userEmail}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Registration Code:</span>
                            <span className="font-mono font-bold text-primary">
                              {scanResult.participant.registrationId}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                      <QrCode className="size-16 text-muted-foreground/30 mb-3" />
                      <p className="text-sm font-medium">Awaiting next attendee scan</p>
                      <p className="text-xs max-w-xs mt-1">
                        Scan results will appear here with student verification status and profile details.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span>Live sync active</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={fetchAttendanceData}>
                    <RefreshCw className="size-3" /> Refresh List
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Full Attendee Directory */}
          <TabsContent value="directory" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter attendees by name, email, or registration ID..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredParticipants.length}</span> of{" "}
                {participants.length}
              </div>
            </div>

            <div className="rounded-2xl border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Pass ID</th>
                      <th className="px-4 py-3 font-semibold">Student Name</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Attendance</th>
                      <th className="px-4 py-3 font-semibold text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          No registered participants found matching your query.
                        </td>
                      </tr>
                    ) : (
                      filteredParticipants.map((p) => (
                        <tr key={p._id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-mono text-primary font-semibold">{p.registrationId}</td>
                          <td className="px-4 py-3 font-medium text-foreground">{p.userName}</td>
                          <td className="px-4 py-3 text-muted-foreground">{p.userEmail}</td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="capitalize text-[10px]">
                              {p.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {p.checkedIn ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                                <CheckCircle2 className="size-3.5" /> Checked In
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Not arrived</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {!p.checkedIn ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => handleManualCheckIn(p.registrationId)}
                              >
                                Manual Check-in
                              </Button>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">
                                {p.checkedInAt ? format(new Date(p.checkedInAt), "h:mm a") : "Done"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
