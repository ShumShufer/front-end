import { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useUser } from "../../../context/user/useUser.ts";
import { formatDate } from "../../../utils/formatters.ts";
import styles from "./StudentsDirectory.module.css";

export function StudentsDirectory() {
  const { user } = useAuth();
  const userCtx = useUser();
  const [search, setSearch] = useState("");

  useEffect(() => {
    void userCtx.loadUsers({ role: "STUDENT" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const directory = useMemo(() => {
    const all = (userCtx.users?.data ?? []).filter(
      (u) => u.role === "STUDENT" && (!user?.schoolId || u.schoolId === user.schoolId),
    );
    const query = search.trim().toLowerCase();
    if (!query) return all;
    return all.filter((u) =>
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(query),
    );
  }, [userCtx.users, search, user]);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <Users size={14} /> Directory
          </p>
          <h1>Students</h1>
          <span>
            {directory.length} registered student
            {directory.length === 1 ? "" : "s"}
          </span>
        </header>

        <label className={styles.searchBox}>
          <Search size={16} />
          <input
            value={search}
            placeholder="Search by name or email…"
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        {userCtx.isLoading && (userCtx.users?.data.length ?? 0) === 0 ? (
          <PageSkeleton variant="list" />
        ) : directory.length ? (
          <section className={styles.table} aria-label="Student list">
            <div className={`${styles.row} ${styles.headRow}`}>
              <span>Name</span>
              <span>Email</span>
              <span>Verification</span>
              <span>Joined</span>
            </div>
            {directory.map((student) => (
              <div key={student.id} className={styles.row}>
                <strong>
                  {student.firstName} {student.lastName}
                </strong>
                <span>{student.email}</span>
                <span className={`${styles.badge} ${styles.toneNeutral}`}>
                  {student.verificationStatus}
                </span>
                <span>{formatDate(student.createdAt)}</span>
              </div>
            ))}
          </section>
        ) : (
          <EmptyState
            title="No students found"
            description="Try a different search term."
          />
        )}
      </div>
    </main>
  );
}
