"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  AlertCircle,
  Search,
  CheckCircle2,
  Calendar,
  User,
  ArrowLeft,
  Loader2,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CertificateView } from "@/components/certificates/certificate-view";
import { useRouter } from "next/navigation";

export default function PublicVerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const certId = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lookupInput, setLookupInput] = useState("");

  useEffect(() => {
    if (certId) {
      verifyCertificate(certId);
    }
  }, [certId]);

  const verifyCertificate = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/verify/${id}`);
      const data = await res.json();
      if (res.ok && data.valid) {
        setCertData(data.certificate);
      } else {
        setError(data.error || "Certificate not found or verification failed.");
      }
    } catch {
      setError("Network error while validating certificate.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (lookupInput.trim()) {
      router.push(`/verify/${encodeURIComponent(lookupInput.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="border-b bg-card/40 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3"
          >
            <ArrowLeft className="size-3.5" /> Return to Eventallify
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-emerald-400 mb-1 font-medium">
                <ShieldCheck className="size-4" /> Official Credential Registry
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Certificate Verification</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Verify authentic student participation and achievement credentials issued by VIT Chennai campus clubs.
              </p>
            </div>

            {/* Quick search input */}
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <input
                value={lookupInput}
                onChange={(e) => setLookupInput(e.target.value)}
                placeholder="Enter Certificate ID..."
                className="px-3 py-1.5 text-xs rounded-lg border bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <Button type="submit" size="sm" variant="outline" className="text-xs">
                <Search className="size-3.5 mr-1" /> Verify
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Verifying credential against tamper-proof registry...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 p-12 text-center max-w-xl mx-auto space-y-4">
            <AlertCircle className="size-12 text-destructive" />
            <h2 className="text-xl font-bold text-foreground">Verification Failed</h2>
            <p className="text-xs text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Please ensure the certificate number or URL is correct. If you believe this is an error, contact the event organizers.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        ) : certData ? (
          <div className="space-y-6">
            {/* Verified Banner */}
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="size-6 shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-foreground">Authentic Verified Credential</h3>
                <p className="text-xs text-muted-foreground">
                  This certificate was officially issued by <strong>{certData.organizerName}</strong> and registered on the Eventallify network.
                </p>
              </div>
            </div>

            {/* Certificate Preview Card */}
            <div className="rounded-2xl border bg-card p-6 shadow-2xl">
              <CertificateView certificate={certData} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
