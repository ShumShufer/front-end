import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Film,
  Link2,
  Upload,
} from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useClassroom } from "../../../context/classroom/useClassroom.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import { formatDate } from "../../../utils/formatters.ts";
import styles from "./ResourceLibrary.module.css";

const RESOURCE_TYPES = ["PDF", "PPT", "VIDEO", "LINK"] as const;
type ResourceType = (typeof RESOURCE_TYPES)[number];

const TYPE_ICONS: Record<string, typeof FileText> = {
  PDF: FileText,
  PPT: FileText,
  VIDEO: Film,
  LINK: Link2,
};

function parseUrlOrNull(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function ResourceLibrary() {
  const { classroomId = "" } = useParams();
  const classroom = useClassroom();
  const [title, setTitle] = useState("");
  const [resourceType, setResourceType] = useState<ResourceType>("LINK");
  const [url, setUrl] = useState("");
  const [mandatory, setMandatory] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!classroomId) return;
    void classroom.loadResources(classroomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId]);

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (!title.trim() || !url.trim()) {
      setFormError("A title and link are required.");
      return;
    }
    const parsed = parseUrlOrNull(url.trim());
    if (!parsed || !parsed.protocol.startsWith("http")) {
      setFormError("Enter a valid link starting with http(s).");
      return;
    }
    setIsSaving(true);
    try {
      await classroom.uploadResource(classroomId, {
        title: title.trim(),
        type: resourceType,
        url: url.trim(),
        mandatory,
        topicId: null,
      });
      await classroom.loadResources(classroomId);
      setSuccessMessage("Resource shared with the classroom.");
      setTitle("");
      setUrl("");
      setMandatory(false);
    } catch {
      setFormError("The resource could not be saved. Please try again.");
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
            <Upload size={14} /> Resource library
          </p>
          <h1>Classroom materials</h1>
        </header>

        <form className={styles.form} onSubmit={(e) => void handleUpload(e)}>
          <label className={styles.field}>
            <span>Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Highway code chapter 4"
            />
          </label>
          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span>Type</span>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as ResourceType)}
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className={`${styles.field} ${styles.checkboxField}`}>
              <span>Mandatory for students</span>
              <input
                type="checkbox"
                checked={mandatory}
                onChange={(e) => setMandatory(e.target.checked)}
              />
            </label>
          </div>
          <label className={styles.field}>
            <span>Link</span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
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
              <Upload size={16} />
              {isSaving ? "Sharing…" : "Share resource"}
            </Button>
          </footer>
        </form>

        {classroom.isLoading && classroom.resources.length === 0 ? (
          <PageSkeleton variant="list" />
        ) : classroom.resources.length ? (
          <section className={styles.list}>
            {classroom.resources.map((resource) => {
              const Icon = TYPE_ICONS[resource.type] ?? Link2;
              return (
                <article key={resource.id} className={styles.rowCard}>
                  <Icon size={18} />
                  <div className={styles.rowBody}>
                    <strong>{resource.title}</strong>
                    <span>
                      {resource.type} ·{" "}
                      {resource.mandatory ? "Mandatory" : "Optional"} · added{" "}
                      {formatDate(resource.uploadedAt)}
                    </span>
                  </div>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.openLink}
                  >
                    <ExternalLink size={14} /> Open
                  </a>
                </article>
              );
            })}
          </section>
        ) : (
          <EmptyState
            title="No resources yet"
            description="Share the first PDF, video or link with your students."
          />
        )}
      </div>
    </main>
  );
}
