import { Inbox } from "lucide-react";
import styles from "./EmptyState.module.css";
export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className={styles.empty}>
      <span className={styles.icon}>
        <Inbox size={28} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
    </section>
  );
}
