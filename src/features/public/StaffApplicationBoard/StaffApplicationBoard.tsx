import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Briefcase, CalendarDays, CheckCircle2 } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useSchool } from "../../../context/school/useSchool.ts";
import { ApplicationStatus } from "../../../types/common.types.ts";
import type { Role } from "../../../types/common.types.ts";
import type { StaffApplicationPost } from "../../../types/school.types.ts";
import { schoolService } from "../../../services/schoolService.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import { formatDate } from "../../../utils/formatters.ts";
import styles from "./StaffApplicationBoard.module.css";

const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Platform admin",
  ADMIN: "School admin",
  EDUCATION_HEAD: "Education head",
  MENTOR: "Mentor (instructor)",
  STUDENT: "Student",
};

export function StaffApplicationBoard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const school = useSchool();

  const [posts, setPosts] = useState<StaffApplicationPost[] | null>(null);
  const [appliedPostIds, setAppliedPostIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [applyingPostId, setApplyingPostId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [allPosts] = await Promise.all([
          schoolService.getStaffPosts(),
          school.loadSchools(),
        ]);
        if (cancelled) return;
        setPosts(allPosts.filter((post) => post.status === "OPEN"));
      } catch {
        if (!cancelled) setError("Openings could not be loaded. Please try again.");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    schoolService
      .getStaffApplications({ applicantId: user.id })
      .then((applications) => {
        if (cancelled) return;
        setAppliedPostIds(
          new Set(
            applications
              .filter(
                (application) =>
                  application.status === ApplicationStatus.PENDING ||
                  application.status === ApplicationStatus.ACCEPTED,
              )
              .map((application) => application.postId),
          ),
        );
      })
      .catch(() => {
        // Non-fatal: the board still works without the applied markers.
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const schoolNames = useMemo(() => {
    const names = new Map<string, string>();
    for (const item of school.schools?.data ?? []) {
      names.set(item.id, item.name);
    }
    return names;
  }, [school.schools]);

  function schoolName(post: StaffApplicationPost): string {
    return schoolNames.get(post.schoolId) ?? "A partner school";
  }

  async function handleApply(postId: string, roleLabel: string) {
    if (!user) return;
    setError(null);
    setNotice(null);
    setApplyingPostId(postId);
    try {
      await schoolService.applyToStaffPost(postId, user.id);
      setAppliedPostIds((ids) => new Set(ids).add(postId));
      setNotice(`Application submitted for the ${roleLabel} opening.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "The application could not be sent.",
      );
    } finally {
      setApplyingPostId(null);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <Briefcase size={14} /> Work with us
          </p>
          <h1>Staff applications</h1>
          <span>
            Openings posted by driving schools across the platform. Pick one and
            apply — the school reviews your application directly.
          </span>
        </header>

        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}
        {notice && (
          <div className={styles.successRow} role="status">
            <CheckCircle2 size={16} />
            <span>{notice}</span>
          </div>
        )}

        {posts === null ? (
          <PageSkeleton variant="list" />
        ) : posts.length ? (
          <section className={styles.list}>
            {[...posts]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((post) => {
                const roleLabel = ROLE_LABELS[post.role];
                const hasApplied = appliedPostIds.has(post.id);
                return (
                  <article key={post.id} className={styles.card}>
                    <div className={styles.cardBody}>
                      <strong>{roleLabel}</strong>
                      <span className={styles.school}>{schoolName(post)}</span>
                      <p>{post.description}</p>
                      <small>
                        <CalendarDays size={13} /> Posted{" "}
                        {formatDate(post.createdAt)}
                      </small>
                    </div>
                    <div className={styles.cardAction}>
                      {hasApplied ? (
                        <span className={styles.appliedBadge}>Applied</span>
                      ) : user ? (
                        <Button
                          size="sm"
                          disabled={applyingPostId === post.id}
                          onClick={() => void handleApply(post.id, roleLabel)}
                        >
                          {applyingPostId === post.id
                            ? "Sending…"
                            : "Apply now"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() =>
                            navigate(ROUTES.auth.login, {
                              state: { from: location.pathname },
                            })
                          }
                        >
                          Sign in to apply
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
          </section>
        ) : (
          <EmptyState
            title="No openings right now"
            description="Check back soon — schools post new roles here as they grow."
          />
        )}
      </div>
    </main>
  );
}
