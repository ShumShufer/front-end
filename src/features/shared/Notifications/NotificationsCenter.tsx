import { useEffect } from "react";
import {
  Award,
  Bell,
  Briefcase,
  CheckCheck,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  Info,
  Megaphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import styles from "./NotificationsCenter.module.css";
import { useNotifications } from "../../../context/notification/useNotifications.ts";
import { NotificationTopic } from "../../../types/common.types.ts";

const TOPIC_ICONS: Record<string, LucideIcon> = {
  [NotificationTopic.APPLICATION]: FileText,
  [NotificationTopic.TASK]: ClipboardList,
  [NotificationTopic.CLASSROOM]: GraduationCap,
  [NotificationTopic.SCHOOL_ANNOUNCEMENT]: Megaphone,
  [NotificationTopic.STAFF_POST]: Briefcase,
  [NotificationTopic.PAYMENT]: CreditCard,
  [NotificationTopic.RESULT]: Award,
  [NotificationTopic.SYSTEM]: Info,
};

export function NotificationsCenter({ section }: { section: string }) {
  const store = useNotifications();
  const { loadNotifications, markAsRead, markAllAsRead } = store;

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  if (store.isLoading && !store.notifications)
    return <PageSkeleton variant="list" />;

  const items = store.notifications?.data || [];

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{section}</p>
            <h1>Notifications</h1>
            <p>
              {items.some((item) => !item.read)
                ? "You have unread updates waiting."
                : "You are all caught up."}
            </p>
          </div>
          <Button
            variant="secondary"
            disabled={!items.some((item) => !item.read) || store.isLoading}
            onClick={() => void markAllAsRead()}
          >
            <CheckCheck size={16} /> Mark all read
          </Button>
        </header>
        <section className={styles.stack}>
          {items.length ? (
            items.map((item) => {
              const TopicIcon = TOPIC_ICONS[item.topic] ?? Bell;
              return (
                <article
                  key={item.id}
                  className={[
                    styles.item,
                    item.read ? "" : styles.unread,
                  ].join(" ")}
                >
                  <span className={styles.iconWrap}>
                    <TopicIcon size={18} />
                  </span>
                  <div className={styles.body}>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                    <span className={styles.meta}>
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {!item.read ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void markAsRead(item.id)}
                    >
                      Mark read
                    </Button>
                  ) : null}
                </article>
              );
            })
          ) : (
            <EmptyState
              title="No notifications yet"
              description="Application decisions, classroom updates, and announcements will appear here."
            />
          )}
        </section>
      </div>
    </main>
  );
}
