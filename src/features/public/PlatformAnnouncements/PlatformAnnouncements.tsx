import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { classroomService } from "../../../services/classroomService.ts";
import type { Announcement } from "../../../types/classroom.types.ts";
import { formatDateTime } from "../../../utils/formatters.ts";
import styles from "./PlatformAnnouncements.module.css";

export function PlatformAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    classroomService
      .getPlatformAnnouncements()
      .then((items) => {
        if (!cancelled) setAnnouncements(items);
      })
      .catch(() => {
        if (!cancelled)
          setError("Announcements could not be loaded. Please try again.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <Megaphone size={14} /> Platform news
          </p>
          <h1>Announcements</h1>
          <span>
            Updates from the ShumShufer team — new features, campaigns and
            anything that affects schools nationwide.
          </span>
        </header>

        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}

        {announcements === null ? (
          <PageSkeleton variant="list" />
        ) : announcements.length ? (
          <ol className={styles.timeline}>
            {announcements.map((announcement) => (
              <li key={announcement.id} className={styles.item}>
                <span className={styles.dot} aria-hidden="true" />
                <article className={styles.card}>
                  <h2>{announcement.title}</h2>
                  <p>{announcement.body}</p>
                  <time dateTime={announcement.createdAt}>
                    {formatDateTime(announcement.createdAt)}
                  </time>
                </article>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState
            title="No announcements yet"
            description="When the platform team posts an update, it will appear here."
          />
        )}
      </div>
    </main>
  );
}
