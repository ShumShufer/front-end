import { useEffect } from "react";
import { BookOpen, Building2, GraduationCap, Wallet } from "lucide-react";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useCourse } from "../../../context/course/useCourse.ts";
import { usePayment } from "../../../context/payment/usePayment.ts";
import { useSchool } from "../../../context/school/useSchool.ts";
import { useUser } from "../../../context/user/useUser.ts";
import { formatCurrency } from "../../../utils/formatters.ts";
import styles from "./SuperAdminDashboard.module.css";

const SUCCESS_STATUS = "SUCCESS";

export function SuperAdminDashboard() {
  const school = useSchool();
  const userCtx = useUser();
  const payment = usePayment();
  const course = useCourse();

  useEffect(() => {
    void school.loadSchools();
    void userCtx.loadUsers();
    void payment.loadPayments();
    void course.loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (
    (school.isLoading && !school.schools) ||
    (userCtx.isLoading && !userCtx.users) ||
    (payment.isLoading && !payment.payments)
  ) {
    return <PageSkeleton variant="dashboard" />;
  }

  const schoolsCount = school.schools?.data.length ?? 0;
  const usersCount = userCtx.users?.meta.total ?? 0;
  const coursesCount = course.courses.length;
  const grossVolume = (payment.payments?.data ?? [])
    .filter((p) => p.status === SUCCESS_STATUS)
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1>Platform overview</h1>
          <span>Live snapshot of ShumShufer.</span>
        </header>

        <section className={styles.statGrid}>
          <article className={styles.stat}>
            <Building2 size={18} />
            <strong>{schoolsCount}</strong>
            <span>Schools</span>
          </article>
          <article className={styles.stat}>
            <GraduationCap size={18} />
            <strong>{usersCount}</strong>
            <span>Registered users</span>
          </article>
          <article className={styles.stat}>
            <BookOpen size={18} />
            <strong>{coursesCount}</strong>
            <span>Courses</span>
          </article>
          <article className={styles.stat}>
            <Wallet size={18} />
            <strong>{formatCurrency(grossVolume)}</strong>
            <span>Gross volume</span>
          </article>
        </section>
      </div>
    </main>
  );
}
