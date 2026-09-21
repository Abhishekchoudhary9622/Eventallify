"use client";

import { Suspense, useState } from "react";
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
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const initialEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    const { data: signInData, error: signInError } =
      await authClient.signIn.email({
        email: normalizedEmail,
        password,
      });

    if (signInError) {
      const message = signInError.message || "Invalid email or password";
      setError(message);
      toast.error(message);
      setLoading(false);
      return;
    }

    const destination = redirect;

    toast.success("Welcome back!");
    router.push(destination);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-center gap-2">
          <div className="size-2 rounded-full bg-destructive animate-pulse" />
          {error}
        </div>
      )}

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
            placeholder="Enter your password"
            required
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

      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Signing in...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            Sign In
            <ArrowRight className="size-4" />
          </div>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground pt-2">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-primary hover:underline font-semibold"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-background via-background/90 to-background/80">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-20 left-20 size-72 rounded-full bg-foreground/10 blur-3xl" />
        <div className="absolute bottom-20 right-20 size-96 rounded-full bg-foreground/10 blur-3xl" />

        <div className="relative flex flex-col justify-center px-12 text-foreground h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-foreground/20 backdrop-blur-sm">
              <Calendar className="size-7" />
            </div>
            <span className="text-2xl font-bold">Eventallify</span>
          </div>

          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Welcome back to
            <br />
            your campus hub
          </h1>

          <p className="text-foreground/80 text-lg mb-8 max-w-md">
            Sign in to access your events, registrations, and stay connected
            with your campus community.
          </p>

          <div className="space-y-4">
            {[
              "Discover exciting campus events",
              "Register with QR code tickets",
              "Stay updated with announcements",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-foreground/20">
                  <Sparkles className="size-4" />
                </div>
                <span className="text-foreground/90 hover:text-foreground/90">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Calendar className="size-8 text-primary" />
              <span className="text-2xl font-bold">Eventallify</span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to your Eventallify account
            </p>
          </div>

          <Suspense
            fallback={
              <div className="rounded-2xl border bg-card p-8 animate-pulse">
                <div className="space-y-4">
                  <div className="h-12 rounded-xl bg-muted" />
                  <div className="h-12 rounded-xl bg-muted" />
                  <div className="h-12 rounded-xl bg-muted" />
                </div>
              </div>
            }
          >
            <div className="rounded-2xl border bg-card p-8 shadow-lg">
              <LoginForm />
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
