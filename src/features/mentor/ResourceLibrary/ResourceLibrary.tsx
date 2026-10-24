import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Film,
  Link2,
  Upload,
  CheckCircle2,
  FileUp,
} from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useClassroom } from "../../../context/classroom/useClassroom.ts";
import { uploadService } from "../../../services/index.ts";
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

function detectResourceType(filename: string): ResourceType {
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  if (ext === "pdf") return "PDF";
  if (["ppt", "pptx", "key"].includes(ext)) return "PPT";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return "VIDEO";
  return "LINK";
}

function resolveResourceUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // If it's a relative backend upload (e.g. /uploads/filename.ext)
  if (url.startsWith("/uploads/")) {
    const apiBase = import.meta.env.VITE_API_BASE_URL;
    if (apiBase && apiBase.startsWith("http")) {
      const serverOrigin = new URL(apiBase).origin;
      return `${serverOrigin}${url}`;
    }
  }
  return url;
}

export function ResourceLibrary() {
  const { classroomId = "" } = useParams();
  const classroom = useClassroom();

  const [sourceMode, setSourceMode] = useState<"file" | "link">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [resourceType, setResourceType] = useState<ResourceType>("PDF");
  const [url, setUrl] = useState("");
  const [mandatory, setMandatory] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!classroomId) return;
    void classroom.loadResources(classroomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    if (!title.trim()) {
      // Clean filename for title (remove extension)
      const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(baseName);
    }
    setResourceType(detectResourceType(file.name));
    setFormError(null);
  }

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setFormError("A resource title is required.");
      return;
    }

    let finalUrl = url.trim();

    if (sourceMode === "file") {
      if (!selectedFile) {
        setFormError("Please select a file to upload.");
        return;
      }

      setIsSaving(true);
      try {
        const uploadRes = await uploadService.uploadFile(selectedFile);
        finalUrl = uploadRes.url;
      } catch {
        setFormError("Failed to upload the file to server storage. Please try again.");
        setIsSaving(false);
        return;
      }
    } else {
      if (!finalUrl) {
        setFormError("Please enter a valid external link.");
        return;
      }
      try {
        const parsed = new URL(finalUrl);
        if (!parsed.protocol.startsWith("http")) {
          setFormError("Link must start with http:// or https://");
          return;
        }
      } catch {
        setFormError("Enter a valid URL starting with http(s).");
        return;
      }
    }

    setIsSaving(true);
    try {
      await classroom.uploadResource(classroomId, {
        title: title.trim(),
        type: resourceType,
        url: finalUrl,
        mandatory,
        topicId: null,
      });
      await classroom.loadResources(classroomId);
      setSuccessMessage("Resource uploaded and shared with the classroom!");
      setTitle("");
      setUrl("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
          <div className={styles.modeTabs}>
            <button
              type="button"
              className={`${styles.modeTab} ${sourceMode === "file" ? styles.modeTabActive : ""}`}
              onClick={() => {
                setSourceMode("file");
                setResourceType("PDF");
              }}
            >
              <FileUp size={14} /> Upload file (PDF / Slides / Docs)
            </button>
            <button
              type="button"
              className={`${styles.modeTab} ${sourceMode === "link" ? styles.modeTabActive : ""}`}
              onClick={() => {
                setSourceMode("link");
                setResourceType("LINK");
              }}
            >
              <Link2 size={14} /> External Link / Video URL
            </button>
          </div>

          <label className={styles.field}>
            <span>Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ethiopian Highway Code & Traffic Rules"
            />
          </label>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span>Material Type</span>
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

          {sourceMode === "file" ? (
            <div className={styles.field}>
              <span>Upload Document</span>
              <div
                className={styles.dropZone}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className={styles.fileInput}
                  onChange={handleFileChange}
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.mp4,.mov,.png,.jpg,.jpeg"
                />
                <FileUp size={28} />
                {selectedFile ? (
                  <>
                    <strong>{selectedFile.name}</strong>
                    <span className={styles.fileInfo}>
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Click to change file
                    </span>
                  </>
                ) : (
                  <>
                    <strong>Click or drag a file to upload</strong>
                    <span className={styles.fileInfo}>
                      Supports PDF, PowerPoint (PPT/PPTX), Word documents, and Videos (up to 50MB)
                    </span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <label className={styles.field}>
              <span>External Link</span>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://drive.google.com/... or https://youtube.com/..."
              />
            </label>
          )}

          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}
          {successMessage && (
            <p className={styles.formSuccess} role="status">
              <CheckCircle2 size={16} /> {successMessage}
            </p>
          )}

          <footer className={styles.actions}>
            <Button type="submit" disabled={isSaving}>
              <Upload size={16} />
              {isSaving ? "Uploading to storage…" : "Share resource"}
            </Button>
          </footer>
        </form>

        {classroom.isLoading && classroom.resources.length === 0 ? (
          <PageSkeleton variant="list" />
        ) : classroom.resources.length ? (
          <section className={styles.list}>
            {classroom.resources.map((resource) => {
              const Icon = TYPE_ICONS[resource.type] ?? Link2;
              const directUrl = resolveResourceUrl(resource.url);
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
                    href={directUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.openLink}
                  >
                    <ExternalLink size={14} /> Open file
                  </a>
                </article>
              );
            })}
          </section>
        ) : (
          <EmptyState
            title="No resources yet"
            description="Upload the first PDF, slide presentation or video for your students."
          />
        )}
      </div>
    </main>
  );
}
