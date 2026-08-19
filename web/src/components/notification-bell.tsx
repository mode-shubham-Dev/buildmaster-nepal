"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Bell, ShoppingCart, Plane, Wallet, Receipt, FileWarning, CheckCheck,
  Inbox, ChevronRight, AlertTriangle,
} from "lucide-react";
import {
  fetchNotifications, fetchNotificationSummary, markNotificationRead, markAllNotificationsRead,
  type ActionItem, type AppNotification,
} from "@/lib/notifications-api";

const ACTION_ICON: Record<string, React.ReactNode> = {
  "shopping-cart": <ShoppingCart className="h-4 w-4" />,
  plane: <Plane className="h-4 w-4" />,
  wallet: <Wallet className="h-4 w-4" />,
  receipt: <Receipt className="h-4 w-4" />,
  "file-warning": <FileWarning className="h-4 w-4" />,
};

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  // lightweight badge poll every 60s
  const { data: summary } = useQuery({
    queryKey: ["notification-summary"],
    queryFn: fetchNotificationSummary,
    refetchInterval: 60000,
  });

  // full bundle only when the panel is open
  const { data: bundle, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: open,
  });

  const markReadMut = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-summary"] });
    },
  });
  const markAllMut = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-summary"] });
    },
  });

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = summary?.unread_count ?? 0;
  const actionCount = summary?.action_count ?? 0;
  const hasBadge = unread > 0 || actionCount > 0;

  const goTo = (link: string, notif?: AppNotification) => {
    if (notif && !notif.read_at) markReadMut.mutate(notif.id);
    setOpen(false);
    router.push(link);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <Bell className="h-5 w-5" />
        {hasBadge && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_40px_-8px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-[#1a1d23]">Notifications</p>
            {(bundle?.unread_count ?? 0) > 0 && (
              <button onClick={() => markAllMut.mutate()} className="flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-slate-600">
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12"><div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" /></div>
            ) : (
              <>
                {/* ACTION CENTER — needs your attention */}
                {(bundle?.actions.length ?? 0) > 0 && (
                  <div className="border-b border-slate-100 bg-slate-50/50 px-3 py-3">
                    <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Needs your attention</p>
                    <div className="space-y-1">
                      {bundle?.actions.map((action) => (
                        <ActionRow key={action.key} action={action} onClick={() => goTo(action.link)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* RECENT NOTIFICATIONS */}
                <div className="px-2 py-2">
                  {(bundle?.notifications.length ?? 0) === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Inbox className="h-8 w-8 text-slate-200" />
                      <p className="mt-2 text-sm text-slate-400">No notifications yet</p>
                    </div>
                  ) : (
                    bundle?.notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => n.link ? goTo(n.link, n) : (!n.read_at && markReadMut.mutate(n.id))}
                        className={`flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-slate-50 ${!n.read_at ? "bg-amber-50/40" : ""}`}
                      >
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.read_at ? "bg-amber-500" : "bg-transparent"}`} />
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm ${!n.read_at ? "font-semibold text-[#1a1d23]" : "font-medium text-slate-600"}`}>{n.title}</p>
                          {n.body && <p className="mt-0.5 text-xs text-slate-400 line-clamp-2">{n.body}</p>}
                          <p className="mt-1 text-[11px] text-slate-300">{timeAgo(n.created_at)}</p>
                        </div>
                        {n.link && <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />}
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionRow({ action, onClick }: { action: ActionItem; onClick: () => void }) {
  const warning = action.tone === "warning";
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl bg-white px-2.5 py-2 text-left shadow-sm ring-1 ring-slate-100 transition hover:ring-slate-200"
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${warning ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-600"}`}>
        {warning ? <AlertTriangle className="h-4 w-4" /> : ACTION_ICON[action.icon] ?? <Bell className="h-4 w-4" />}
      </span>
      <span className="flex-1 text-sm font-medium text-slate-700">{action.label}</span>
      <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${warning ? "bg-amber-500 text-white" : "bg-[#1a1d23] text-white"}`}>
        {action.count}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
    </button>
  );
}