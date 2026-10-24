import { useEffect, useMemo, useState } from "react";
import { GraduationCap, Search } from "lucide-react";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useSchool } from "../../../context/school/useSchool.ts";
import { useUser } from "../../../context/user/useUser.ts";
import styles from "./BrowseMentors.module.css";

export function BrowseMentors() {
  const userCtx = useUser();
  const school = useSchool();
  const [search, setSearch] = useState("");

  useEffect(() => {
    void userCtx.loadUsers({ role: "MENTOR" });
    void school.loadSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const schoolName = useMemo(
    () => new Map((school.schools?.data ?? []).map((s) => [s.id, s.name])),
    [school.schools],
  );

  const mentors = useMemo(() => {
    const all = (userCtx.users?.data ?? []).filter((u) => u.role === "MENTOR");
    const query = search.trim().toLowerCase();
    if (!query) return all;
    return all.filter((u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(query),
    );
  }, [userCtx.users, search]);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <GraduationCap size={14} /> Instructors
          </p>
          <h1>Browse mentors</h1>
          <span>Certified instructors guiding learners across Ethiopia.</span>
        </header>

        <label className={styles.searchBox}>
          <Search size={16} />
          <input
            value={search}
            placeholder="Search by name…"
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        {userCtx.isLoading && !userCtx.users ? (
          <PageSkeleton variant="list" />
        ) : mentors.length ? (
          <section className={styles.grid}>
            {mentors.map((mentor) => (
              <article key={mentor.id} className={styles.card}>
                <span className={styles.avatar}>
                  {mentor.firstName[0]}
                  {mentor.lastName[0]}
                </span>
                <strong>
                  {mentor.firstName} {mentor.lastName}
                </strong>
                <small>
                  {mentor.schoolId
                    ? schoolName.get(mentor.schoolId) ?? "Independent"
                    : "Independent"}
                </small>
                <span
                  className={`${styles.badge} ${
                    mentor.verificationStatus === "VERIFIED"
                      ? styles.toneSuccess
                      : ""
                  }`}
                >
                  {mentor.verificationStatus === "VERIFIED"
                    ? "Fayda verified"
                    : mentor.verificationStatus}
                </span>
              </article>
            ))}
          </section>
        ) : (
          <EmptyState
            title="No mentors found"
            description="Try a different name or check back later."
          />
        )}
      </div>
    </main>
  );
}
