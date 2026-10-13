import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileWarning, Film, FileText } from "lucide-react";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./MediaViewer.module.css";

const TYPE_ICONS: Record<string, typeof FileText> = {
  VIDEO: Film,
  PDF: FileText,
  PPT: FileText,
};

export function MediaViewer() {
  const { mediaId = "" } = useParams();

  const decodedId = decodeURIComponent(mediaId);
  const looksLikeUrl =
    decodedId.startsWith("http://") || decodedId.startsWith("https://");
  const extension = decodedId.split(".").pop()?.toUpperCase() ?? "";
  const Icon = TYPE_ICONS[extension] ?? FileWarning;

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to={ROUTES.public.landing} className={styles.back}>
          <ArrowLeft size={16} /> Home
        </Link>
        <header className={styles.header}>
          <h1>Media viewer</h1>
        </header>

        {looksLikeUrl ? (
          <section className={styles.viewer}>
            {extension === "MP4" || extension === "WEBM" ? (
              <video controls src={decodedId} className={styles.video} />
            ) : (
              <object data={decodedId} type="application/pdf" className={styles.frame}>
                <div className={styles.fallback}>
                  <Icon size={22} />
                  <p>
                    This document can't be previewed inline.
                  </p>
                  <a href={decodedId} target="_blank" rel="noreferrer">
                    Open in a new tab
                  </a>
                </div>
              </object>
            )}
          </section>
        ) : (
          <EmptyState
            title="Unsupported media"
            description={`We couldn't resolve "${mediaId}" into a viewable file.`}
          />
        )}
      </div>
    </main>
  );
}
