import { useEffect, useState } from "react";
import { Edit2, Megaphone, Send, Trash2, X } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useClassroom } from "../../../context/classroom/useClassroom.ts";
import { classroomService } from "../../../services/index.ts";
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

  // Edit modal / inline state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

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

  function startEdit(announcement: { id: string; title: string; body: string }) {
    setEditingId(announcement.id);
    setEditTitle(announcement.title);
    setEditBody(announcement.body);
    setFormError(null);
    setSuccessMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
  }

  async function handleSaveEdit(id: string) {
    if (editTitle.trim().length < MIN_TITLE_LENGTH) {
      setFormError("Announcement title must be at least 4 characters.");
      return;
    }
    if (editBody.trim().length < MIN_BODY_LENGTH) {
      setFormError("Announcement message must be at least 10 characters.");
      return;
    }
    setIsUpdating(true);
    setFormError(null);
    try {
      await classroomService.updateAnnouncement(id, {
        title: editTitle.trim(),
        body: editBody.trim(),
      });
      setSuccessMessage("Announcement updated successfully.");
      setEditingId(null);
      await classroom.loadPlatformAnnouncements();
    } catch {
      setFormError("Failed to update announcement. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete(id: string, announceTitle: string) {
    if (!window.confirm(`Are you sure you want to delete "${announceTitle}"?`)) {
      return;
    }
    setFormError(null);
    try {
      await classroomService.deleteAnnouncement(id);
      setSuccessMessage("Announcement deleted successfully.");
      await classroom.loadPlatformAnnouncements();
    } catch {
      setFormError("Failed to delete announcement. Please try again.");
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
                {editingId === announcement.id ? (
                  <div style={{ display: "grid", gap: "0.75rem", width: "100%", padding: "0.5rem 0" }}>
                    <input
                      style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.95rem", fontWeight: 600 }}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Announcement title"
                    />
                    <textarea
                      rows={4}
                      style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.9rem", resize: "vertical" }}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      placeholder="Announcement message"
                    />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Button size="sm" disabled={isUpdating} onClick={() => void handleSaveEdit(announcement.id)}>
                        {isUpdating ? "Saving…" : "Save changes"}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={cancelEdit}>
                        <X size={14} /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                      <strong>{announcement.title}</strong>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          type="button"
                          onClick={() => startEdit(announcement)}
                          title="Edit announcement"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#4f46e5", padding: "4px" }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(announcement.id, announcement.title)}
                          title="Delete announcement"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "4px" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p>{announcement.body}</p>
                    <small>{formatDateTime(announcement.createdAt)}</small>
                  </>
                )}
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
