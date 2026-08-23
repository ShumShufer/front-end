import styles from "./PageSkeleton.module.css";

type SkeletonVariant = "dashboard" | "list" | "calendar" | "admin";

export function PageSkeleton({ variant }: { variant: SkeletonVariant }) {
  if (variant === "calendar")
    return (
      <main className={styles.page}>
        <div className={styles.header} />
        <div className={styles.calendar}>
          <div className={styles.weekdays} />
          {Array.from({ length: 35 }, (_, index) => (
            <span key={index} className={styles.day} />
          ))}
        </div>
        <div className={styles.columns}>
          <div className={styles.list} />
          <div className={styles.list} />
        </div>
      </main>
    );
  if (variant === "list")
    return (
      <main className={styles.page}>
        <div className={styles.header} />
        <div className={styles.list}>
          {Array.from({ length: 5 }, (_, index) => (
            <span key={index} className={styles.row} />
          ))}
        </div>
      </main>
    );
  if (variant === "admin")
    return (
      <main className={styles.page}>
        <div className={styles.header} />
        <div className={styles.adminGrid}>
          <div className={styles.form} />
          <div className={styles.map} />
        </div>
        <div className={styles.list}>
          {Array.from({ length: 3 }, (_, index) => (
            <span key={index} className={styles.row} />
          ))}
        </div>
      </main>
    );
  return (
    <main className={styles.page}>
      <div className={styles.header} />
      <div className={styles.metrics}>
        {Array.from({ length: 3 }, (_, index) => (
          <span key={index} className={styles.metric} />
        ))}
      </div>
      <div className={styles.columns}>
        <div className={styles.list} />
        <div className={styles.list} />
      </div>
    </main>
  );
}
