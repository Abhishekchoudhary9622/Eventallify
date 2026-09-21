"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  Calendar,
  LayoutDashboard,
  Shield,
  User,
  LogOut,
  Sun,
  Moon,
  Megaphone,
  ChevronDown,
  Ticket,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { authClient } from "@/lib/auth-client";
import { NotificationsDropdown } from "./notifications-dropdown";

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const loggedInLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
];

const guestLinks: NavLink[] = [
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
];

function getInitials(name?: string | null, email?: string | null) {
  if (name && name.trim().length > 0) {
    return name
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email && email.trim().length > 0) {
    return email.trim().charAt(0).toUpperCase();
  }
  return "U";
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);

  const { data: session } = authClient.useSession();
  const user = session?.user ?? null;
  const userRole = (user as any)?.role || "student";
  const isAdmin = userRole === "admin";

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await authClient.signOut();
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    } finally {
      setLoggingOut(false);
    }
  };

  const navItems = user ? loggedInLinks : guestLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Calendar className="size-4" />
          </div>
          <span>Eventallify</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/admin")
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Shield className="size-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <NotificationsDropdown />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="size-9 rounded-md text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>

          {user ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex items-center gap-2 rounded-full p-1 pl-2 hover:bg-muted transition-colors focus:outline-none"
              >
                <div className="size-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                  {getInitials(user.name, user.email)}
                </div>
                <ChevronDown className="size-3.5 text-muted-foreground hidden sm:block" />
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-card p-1.5 shadow-lg z-50 space-y-1">
                  <div className="px-3 py-2 border-b">
                    <p className="font-medium text-sm truncate">{user.name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <Badge variant="outline" className="mt-1 capitalize text-[10px]">
                      {userRole}
                    </Badge>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md hover:bg-muted transition-colors"
                  >
                    <LayoutDashboard className="size-4 text-muted-foreground" />
                    Dashboard
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md hover:bg-muted transition-colors"
                  >
                    <User className="size-4 text-muted-foreground" />
                    Profile
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md hover:bg-muted transition-colors"
                    >
                      <Shield className="size-4 text-muted-foreground" />
                      Admin Panel
                    </Link>
                  )}

                  <div className="border-t pt-1">
                    <button
                      onClick={handleSignOut}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    >
                      <LogOut className="size-4" />
                      {loggingOut ? "Signing out..." : "Sign Out"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden size-9"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-b bg-background px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  {item.label}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                <Shield className="size-4 text-muted-foreground" />
                Admin
              </Link>
            )}

            {user && (
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                <User className="size-4 text-muted-foreground" />
                Profile
              </Link>
            )}
          </nav>

          {user ? (
            <div className="pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={loggingOut}
                className="w-full text-destructive hover:text-destructive"
              >
                <LogOut className="size-4 mr-2" />
                {loggingOut ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          ) : (
            <div className="pt-3 border-t flex flex-col gap-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Button asChild size="sm" className="w-full">
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  Register
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

