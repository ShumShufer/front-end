import { useEffect, useState } from "react";
import { Megaphone, Send } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useClassroom } from "../../../context/classroom/useClassroom.ts";
import { formatDateTime } from "../../../utils/formatters.ts";
import styles from "./PlatformAnnouncements.module.css";

const MIN_TITLE_LENGTH = 4;
const MIN_BODY_LENGTH = 10;

export function PlatformAnnouncements() {
  const { user } = useAuth();
  const classroom = useClassroom();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void classroom.loadPlatformAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleBroadcast(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (!user) {
      setFormError("Your session expired — please sign in again.");
      return;
    }
    if (title.trim().length < MIN_TITLE_LENGTH) {
      setFormError("Give the announcement a short, clear title.");
      return;
    }
    if (body.trim().length < MIN_BODY_LENGTH) {
      setFormError("Add a few more details so recipients know what to do.");
      return;
    }
    setIsSaving(true);
    try {
      await classroom.broadcastPlatformAnnouncement({
        title: title.trim(),
        body: body.trim(),
        authorId: user.id,
      });
      setSuccessMessage("Announcement published platform-wide.");
      setTitle("");
      setBody("");
    } catch {
      setFormError("The announcement could not be published. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <Megaphone size={14} /> Broadcasts
          </p>
          <h1>Platform announcements</h1>
          <span>Visible to every signed-in user.</span>
        </header>

        <form className={styles.form} onSubmit={(e) => void handleBroadcast(e)}>
          <label className={styles.field}>
            <span>Title</span>
            <input
              value={title}
              placeholder="e.g. Scheduled maintenance this weekend"
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Message</span>
            <textarea
              rows={5}
              value={body}
              placeholder="Write the announcement…"
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}
          {successMessage && (
            <p className={styles.formSuccess} role="status">
              {successMessage}
            </p>
          )}
          <footer className={styles.actions}>
            <Button type="submit" disabled={isSaving}>
              <Send size={16} />
              {isSaving ? "Publishing…" : "Publish"}
            </Button>
          </footer>
        </form>

        <h2 className={styles.listTitle}>History</h2>
        {classroom.isLoading && classroom.announcements.length === 0 ? (
          <PageSkeleton variant="list" />
        ) : classroom.announcements.length ? (
          <ul className={styles.list}>
            {classroom.announcements.map((announcement) => (
              <li key={announcement.id} className={styles.item}>
                <strong>{announcement.title}</strong>
                <p>{announcement.body}</p>
                <small>{formatDateTime(announcement.createdAt)}</small>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Nothing published yet"
            description="Platform-wide announcements will appear here."
          />
        )}
      </div>
    </main>
  );
}
