import styles from "./Skeleton.module.css";
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-label="Loading"
      className={[styles.skeleton, className].filter(Boolean).join(" ")}
    />
  );
}
