"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  Megaphone,
  Check,
  Trash2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "registration" | "reminder" | "announcement" | "certificate" | "waitlist_promoted" | "general";
  link?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    fetchNotifications();
  }, [session]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success("All notifications marked as read");
      }
    } catch {
      toast.error("Failed to update notifications");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch {
      // Ignore background sync error
    }
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "waitlist_promoted":
        return <Sparkles className="size-5 text-amber-400" />;
      case "registration":
        return <CheckCircle2 className="size-5 text-emerald-400" />;
      case "certificate":
        return <Award className="size-5 text-purple-400" />;
      case "announcement":
        return <Megaphone className="size-5 text-blue-400" />;
      case "reminder":
        return <Bell className="size-5 text-orange-400" />;
      default:
        return <Bell className="size-5 text-primary" />;
    }
  };

  const filtered = notifications.filter((n) => (filter === "unread" ? !n.read : true));
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!session && !sessionLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <AlertCircle className="mx-auto size-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Sign in to view notifications</h1>
        <p className="text-muted-foreground mb-6">Stay updated with event alerts, approvals, and certificates.</p>
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
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-primary mb-1 font-medium">
                <Bell className="size-4" /> Inbox
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Notifications Center</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Real-time alerts for waitlist promotions, registration passes, and campus broadcasts.
              </p>
            </div>
            {unreadCount > 0 && (
              <Button size="sm" variant="outline" onClick={markAllAsRead} className="gap-2">
                <Check className="size-4" /> Mark all as read ({unreadCount})
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 pt-6">
            <Button
              size="sm"
              variant={filter === "all" ? "default" : "ghost"}
              onClick={() => setFilter("all")}
              className="text-xs"
            >
              All Notifications ({notifications.length})
            </Button>
            <Button
              size="sm"
              variant={filter === "unread" ? "default" : "ghost"}
              onClick={() => setFilter("unread")}
              className="text-xs"
            >
              Unread ({unreadCount})
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-16 text-center bg-card/30">
            <Bell className="size-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold">No notifications</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              {filter === "unread"
                ? "You have caught up with all your notifications!"
                : "You don't have any notifications yet. When you register for events or receive updates, they will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item._id}
                onClick={() => !item.read && markAsRead(item._id)}
                className={`group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${
                  item.read
                    ? "bg-card/40 border-border/50 text-muted-foreground"
                    : "bg-card border-primary/30 shadow-md shadow-primary/5 text-foreground"
                }`}
              >
                <div className="size-10 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-sm font-semibold truncate ${!item.read ? "text-foreground" : "text-foreground/90"}`}>
                      {item.title}
                    </h4>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.message}</p>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    {item.link ? (
                      <Button asChild size="sm" variant="link" className="h-auto p-0 text-xs text-primary gap-1">
                        <Link href={item.link}>
                          View details <ExternalLink className="size-3" />
                        </Link>
                      </Button>
                    ) : (
                      <div />
                    )}

                    {!item.read && (
                      <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
