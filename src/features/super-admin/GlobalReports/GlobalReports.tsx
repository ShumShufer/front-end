import { useEffect, useMemo } from "react";
import { BarChart3, Building2, GraduationCap, Wallet } from "lucide-react";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useCourse } from "../../../context/course/useCourse.ts";
import { useEnrollment } from "../../../context/enrollment/useEnrollment.ts";
import { usePayment } from "../../../context/payment/usePayment.ts";
import { useSchool } from "../../../context/school/useSchool.ts";
import { useUser } from "../../../context/user/useUser.ts";
import { formatCurrency } from "../../../utils/formatters.ts";
import styles from "./GlobalReports.module.css";

const SUCCESS_STATUS = "SUCCESS";

export function GlobalReports() {
  const school = useSchool();
  const userCtx = useUser();
  const payment = usePayment();
  const course = useCourse();
  const enrollment = useEnrollment();

  useEffect(() => {
    void school.loadSchools();
    void userCtx.loadUsers();
    void payment.loadPayments();
    void course.loadCourses();
    void enrollment.loadPracticeRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const report = useMemo(() => {
    const successful = (payment.payments?.data ?? []).filter(
      (p) => p.status === SUCCESS_STATUS,
    );
    const gross = successful.reduce((sum, p) => sum + p.amount, 0);
    const byType = new Map<string, number>();
    successful.forEach((p) =>
      byType.set(p.type, (byType.get(p.type) ?? 0) + p.amount),
    );
    return {
      gross,
      transactions: successful.length,
      schools: school.schools?.meta.total ?? school.schools?.data.length ?? 0,
      users: userCtx.users?.meta.total ?? userCtx.users?.data.length ?? 0,
      courses: course.courses.length,
      practiceRequests: enrollment.practiceRequests.length,
      byType: [...byType.entries()],
    };
  }, [school.schools, userCtx.users, payment.payments, course.courses, enrollment.practiceRequests]);

  if (
    (payment.isLoading && !payment.payments) ||
    (userCtx.isLoading && !userCtx.users)
  ) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <BarChart3 size={14} /> Insights
          </p>
          <h1>Global reports</h1>
        </header>

        <section className={styles.statGrid}>
          <article className={styles.stat}>
            <Building2 size={18} />
            <strong>{report.schools}</strong>
            <span>Schools on platform</span>
          </article>
          <article className={styles.stat}>
            <GraduationCap size={18} />
            <strong>{report.users}</strong>
            <span>Total users</span>
          </article>
          <article className={styles.stat}>
            <BarChart3 size={18} />
            <strong>{report.practiceRequests}</strong>
            <span>Practice requests</span>
          </article>
          <article className={styles.stat}>
            <Wallet size={18} />
            <strong>{formatCurrency(report.gross)}</strong>
            <span>Gross volume ({report.transactions})</span>
          </article>
        </section>

        <section className={styles.breakdown}>
          <h2>Volume by transaction type</h2>
          {report.byType.length ? (
            report.byType.map(([type, amount]) => (
              <div key={type} className={styles.barRow}>
                <span>{type}</span>
                <div className={styles.track}>
                  <div
                    className={styles.fill}
                    style={{
                      width: `${Math.round((amount / report.gross) * 100)}%`,
                    }}
                  />
                </div>
                <strong>{formatCurrency(amount)}</strong>
              </div>
            ))
          ) : (
            <p className={styles.muted}>No successful transactions yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
