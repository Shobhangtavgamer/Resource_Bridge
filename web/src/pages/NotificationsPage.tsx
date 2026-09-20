import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, BellOff, CheckCheck, ExternalLink } from "lucide-react";
import { usersApi } from "@/api/endpoints";
import type { Notification } from "@/api/types";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { useAsync } from "@/hooks/useAsync";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Stagger } from "@/components/motion/Stagger";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";

const TYPE_TONE: Record<string, "brand" | "accent" | "info" | "success" | "neutral"> = {
  STATUS_UPDATE: "brand",
  PICKUP: "accent",
  MATCH: "info",
  REVIEW: "success",
  SYSTEM: "neutral",
};

function NotificationItem({
  notification,
  onMarkRead,
  marking,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  marking: boolean;
}) {
  const unread = !notification.readAt;

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-2xl border p-4 transition-colors",
        unread ? "border-brand-200 bg-brand-50/40" : "border-ink-200 bg-white",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          unread ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-500",
        )}
      >
        <Bell className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={cn(
              "text-sm",
              unread ? "font-semibold text-ink-900" : "font-medium text-ink-700",
            )}
          >
            {notification.title}
          </h3>
          <Badge tone={TYPE_TONE[notification.type] ?? "neutral"}>
            {NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type}
          </Badge>
          {unread && <Badge tone="brand" dot>New</Badge>}
        </div>
        {notification.body && (
          <p className="mt-1 text-sm text-ink-500">{notification.body}</p>
        )}
        <p className="mt-1.5 flex items-center gap-3 text-xs text-ink-400">
          <span>{formatRelativeTime(notification.createdAt)}</span>
          {unread && (
            <button
              type="button"
              onClick={() => onMarkRead(notification.id)}
              disabled={marking}
              className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden />
              {marking ? "Marking…" : "Mark as read"}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

export function NotificationsPage() {
  useDocumentTitle("Notifications");
  const toast = useToast();
  const [markingId, setMarkingId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useAsync(
    (signal) => usersApi.notifications(signal),
    [],
  );

  const unreadCount = (data?.notifications ?? []).filter((n) => !n.readAt).length;

  const handleMarkRead = async (id: string) => {
    setMarkingId(id);
    try {
      await usersApi.readNotification(id);
      refetch();
    } catch {
      toast.error("Couldn't mark as read", "Please try again in a moment.");
    } finally {
      setMarkingId(null);
    }
  };

  const actionAllowed = Boolean(data && data.notifications.length > 0);

  return (
    <Container className="py-8 sm:py-10">
      <PageHeader
        eyebrow="Notifications"
        title="Your activity feed"
        description={
          unreadCount > 0
            ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`
            : "You're all caught up."
        }
        actions={
          actionAllowed ? (
            <Link to={ROUTES.donor.donations}>
              <Button variant="outline" size="sm" rightIcon={<ExternalLink className="h-4 w-4" aria-hidden />}>
                View my donations
              </Button>
            </Link>
          ) : undefined
        }
      />

      <div className="mt-8 space-y-3">
        {loading ? (
          <div className="space-y-3" aria-label="Loading notifications">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-ink-200 bg-white p-4">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="mt-3 h-3.5 w-2/3" />
                <Skeleton className="mt-2 h-3 w-32" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState
            error={error}
            title="Couldn't load notifications"
            onRetry={refetch}
          />
        ) : data && data.notifications.length > 0 ? (
          <Stagger className="space-y-3" stagger={50} delay={20}>
            {data.notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                marking={markingId === notification.id}
                onMarkRead={handleMarkRead}
              />
            ))}
          </Stagger>
        ) : (
          <EmptyState
            icon={<BellOff className="h-7 w-7" aria-hidden />}
            title="No notifications yet"
            description="Status updates, pickups, matches and reviews will show up here."
            action={
              <Link to={ROUTES.donor.donations}>
                <Button variant="outline" size="sm">Browse donations</Button>
              </Link>
            }
          />
        )}
      </div>
    </Container>
  );
}