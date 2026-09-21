"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Calendar,
  Ticket,
  Award,
  Megaphone,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export function NotificationsDropdown() {
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Ignore background poll errors
    }
  }, [session]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch {
      toast.error("Could not mark as read");
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notif.id }),
      }).catch(() => {});

      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "registration":
      case "waitlist_promoted":
        return <Ticket className="size-4 text-emerald-400" />;
      case "certificate":
        return <Award className="size-4 text-amber-400" />;
      case "announcement":
        return <Megaphone className="size-4 text-purple-400" />;
      case "approval":
        return <Sparkles className="size-4 text-cyan-400" />;
      default:
        return <Calendar className="size-4 text-primary" />;
    }
  };

  if (!session) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="relative flex size-9 items-center justify-center rounded-full hover:bg-muted/80 text-foreground/80 hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 sm:w-96 p-0 bg-card border-border/80 shadow-2xl rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs px-2 py-0">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
          {notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Bell className="size-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 transition-colors hover:bg-muted/40 flex gap-3 items-start ${
                  !n.read ? "bg-primary/5" : ""
                }`}
              >
                <div className="p-2 rounded-xl bg-muted/60 shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-semibold text-foreground line-clamp-1">
                      {n.title}
                    </h4>
                    {!n.read && (
                      <span className="size-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground/70">
                    <span>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => handleNotificationClick(n)}
                        className="text-primary font-medium hover:underline flex items-center gap-0.5"
                      >
                        View <ExternalLink className="size-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-border/60 bg-muted/20 text-center">
          <Button asChild variant="ghost" size="sm" className="w-full text-xs h-8">
            <Link href="/notifications" onClick={() => setOpen(false)}>
              View All Notifications
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
