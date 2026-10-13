import { useEffect } from "react";
import { BellRing, CheckCheck } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useNotifications } from "../../../context/notification/useNotifications.ts";
import { formatDateTime } from "../../../utils/formatters.ts";
import styles from "./SuperAdminNotifications.module.css";

export function SuperAdminNotifications() {
  const notification = useNotifications();

  useEffect(() => {
    void notification.loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notifications = notification.notifications?.data ?? [];

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.headerRow}>
          <div>
            <p>
              <BellRing size={14} /> Inbox
            </p>
            <h1>Notifications</h1>
          </div>
          {notification.unreadCount > 0 && (
            <Button
              variant="secondary"
              onClick={() => void notification.markAllAsRead()}
            >
              <CheckCheck size={16} /> Mark all read
            </Button>
          )}
        </header>

        {notification.isLoading && !notification.notifications ? (
          <PageSkeleton variant="list" />
        ) : notifications.length ? (
          <ul className={styles.list}>
            {notifications.map((item) => (
              <li
                key={item.id}
                className={`${styles.item} ${item.read ? "" : styles.itemUnread}`}
              >
                <button
                  type="button"
                  className={styles.itemBtn}
                  onClick={() => {
                    if (!item.read) void notification.markAsRead(item.id);
                  }}
                >
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                  <small>{formatDateTime(item.createdAt)}</small>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No notifications"
            description="Platform events and alerts will appear here."
          />
        )}
      </div>
    </main>
  );
}
