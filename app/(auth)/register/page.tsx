"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Calendar,
  ArrowRight,
  Sparkles,
  Mail,
  Lock,
  User,
  KeyRound,
  RotateCw,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) {
        toast.error(error.message || "Registration failed");
        setLoading(false);
        return;
      }

      // Also trigger OTP send to ensure user receives the OTP verification email
      try {
        await authClient.emailOtp.sendVerificationOtp({
          email,
          type: "email-verification",
        });
      } catch {
        // Handled by Better Auth automatic sign-up hook
      }

      toast.success("Verification code sent to your email!");
      setStep("otp");
      setResendTimer(60);
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanOtp = otp.trim();
    if (cleanOtp.length < 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setVerifying(true);

    try {
      const { error } = await authClient.emailOtp.verifyEmail({
        email,
        otp: cleanOtp,
      });

      if (error) {
        toast.error(error.message || "Invalid or expired verification code");
        setVerifying(false);
        return;
      }

      toast.success("Email verified successfully! Welcome to Eventallify.");
      
      // Auto sign-in or redirect to login
      try {
        await authClient.signIn.email({
          email,
          password,
        });
        window.location.href = redirect;
      } catch {
        router.push("/login");
      }
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || resending) return;

    setResending(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });

      if (error) {
        toast.error(error.message || "Failed to resend code");
      } else {
        toast.success("New verification code sent!");
        setResendTimer(60);
      }
    } catch {
      toast.error("Could not resend verification code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-background via-background/90 to-background/80">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-20 left-20 size-72 rounded-full bg-foreground/10 blur-3xl" />
        <div className="absolute bottom-20 right-20 size-96 rounded-full bg-foreground/10 blur-3xl" />

        <div className="relative flex flex-col justify-center px-12 text-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-foreground/20 backdrop-blur-sm">
              <Calendar className="size-7" />
            </div>
            <span className="text-2xl font-bold">Eventallify</span>
          </div>

          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Join your campus
            <br />
            community today
          </h1>

          <p className="text-foreground/80 text-lg mb-8 max-w-md">
            Create an account to start exploring and registering for campus
            events.
          </p>

          <div className="space-y-4">
            {[
              "Free to join and use",
              "Instant event registration",
              "QR code tickets for events",
              "Email OTP verification for security",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-foreground/20">
                  <Sparkles className="size-4" />
                </div>
                <span className="text-foreground/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Calendar className="size-8 text-primary" />
              <span className="text-2xl font-bold">Eventallify</span>
            </div>
          </div>

          {step === "form" ? (
            <>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Create Account
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Join Eventallify to discover campus events
                </p>
              </div>

              <div className="rounded-2xl border bg-card p-8 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <User className="size-4 text-muted-foreground" />
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="flex h-12 w-full rounded-xl border bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Mail className="size-4 text-muted-foreground" />
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@college.edu"
                      required
                      className="flex h-12 w-full rounded-xl border bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Lock className="size-4 text-muted-foreground" />
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        required
                        minLength={8}
                        className="flex h-12 w-full rounded-xl border bg-background px-4 py-3 pr-12 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="size-5" />
                        ) : (
                          <Eye className="size-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Lock className="size-4 text-muted-foreground" />
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className="flex h-12 w-full rounded-xl border bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Sending verification code...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Continue
                        <ArrowRight className="size-4" />
                      </div>
                    )}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground pt-2">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-primary hover:underline font-semibold"
                    >
                      Sign in
                    </Link>
                  </p>
                </form>
              </div>
            </>
          ) : (
            <>
              <div>
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
                >
                  <ArrowLeft className="size-3.5" /> Back to form
                </button>
                <h1 className="text-3xl font-bold tracking-tight">
                  Verify Email
                </h1>
                <p className="mt-2 text-muted-foreground text-sm">
                  We sent a 6-digit verification code to{" "}
                  <strong className="text-foreground">{email}</strong>
                </p>
              </div>

              <div className="rounded-2xl border bg-card p-8 shadow-lg">
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="space-y-3 text-center">
                    <div className="flex justify-center">
                      <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <KeyRound className="size-7" />
                      </div>
                    </div>

                    <label
                      htmlFor="otp"
                      className="block text-sm font-medium text-foreground"
                    >
                      Enter 6-Digit OTP Code
                    </label>

                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="• • • • • •"
                      autoFocus
                      required
                      className="flex h-14 w-full rounded-xl border bg-background text-center text-2xl font-mono tracking-[0.5em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all"
                    />

                    <p className="text-xs text-muted-foreground">
                      Check your inbox (and spam folder) for the email from Eventallify.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 font-medium"
                    disabled={verifying || otp.length < 6}
                  >
                    {verifying ? (
                      <div className="flex items-center gap-2">
                        <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Verifying code...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4" />
                        Verify & Complete Registration
                      </div>
                    )}
                  </Button>

                  <div className="flex items-center justify-between pt-2 text-xs border-t">
                    <span className="text-muted-foreground">
                      Didn&apos;t get the code?
                    </span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || resending}
                      className="font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1"
                    >
                      <RotateCw
                        className={`size-3 ${resending ? "animate-spin" : ""}`}
                      />
                      {resendTimer > 0
                        ? `Resend in ${resendTimer}s`
                        : resending
                        ? "Sending..."
                        : "Resend Code"}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border bg-card p-8 animate-pulse">
            <div className="space-y-4">
              <div className="h-12 rounded-xl bg-muted" />
              <div className="h-12 rounded-xl bg-muted" />
              <div className="h-12 rounded-xl bg-muted" />
            </div>
          </div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

