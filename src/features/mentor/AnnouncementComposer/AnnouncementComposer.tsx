import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Megaphone } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { useClassroom } from "../../../context/classroom/useClassroom.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./AnnouncementComposer.module.css";

const MIN_TITLE_LENGTH = 4;
const MIN_BODY_LENGTH = 10;

export function AnnouncementComposer() {
  const { classroomId = "" } = useParams();
  const classroom = useClassroom();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (title.trim().length < MIN_TITLE_LENGTH) {
      setFormError("Give the announcement a short, clear title.");
      return;
    }
    if (body.trim().length < MIN_BODY_LENGTH) {
      setFormError("Add a few more details so students know what to do.");
      return;
    }
    setIsSaving(true);
    try {
      await classroom.postAnnouncement(classroomId, {
        title: title.trim(),
        body: body.trim(),
      });
      await classroom.loadAnnouncements(classroomId);
      setSuccessMessage("Announcement posted to the classroom feed.");
      setTitle("");
      setBody("");
    } catch {
      setFormError("The announcement could not be posted. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to={ROUTES.mentor.classroomHub(classroomId)} className={styles.back}>
          <ArrowLeft size={16} /> Classroom
        </Link>
        <header className={styles.header}>
          <p>
            <Megaphone size={14} /> Announcements
          </p>
          <h1>Post to the classroom feed</h1>
          <span>Everyone enrolled in this classroom will see it.</span>
        </header>

        <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
          <label className={styles.field}>
            <span>Title</span>
            <input
              value={title}
              placeholder="e.g. Practical session moved to Thursday"
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Message</span>
            <textarea
              rows={6}
              value={body}
              placeholder="Write the details students need…"
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
              {isSaving ? "Posting…" : "Post announcement"}
            </Button>
          </footer>
        </form>
      </div>
    </main>
  );
}
