import { useEffect, useState } from "react";
import { CreditCard, ExternalLink } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { usePayment } from "../../../context/payment/usePayment.ts";
import { formatCurrency, formatDateTime } from "../../../utils/formatters.ts";
import { PaymentStatus, PaymentType } from "../../../types/common.types.ts";
import styles from "./StudentPayments.module.css";

const TYPE_LABELS: Record<PaymentType, string> = {
  ENROLLMENT: "Enrollment fee",
  COURSE_PURCHASE: "Course purchase",
  PRACTICE_ELSEWHERE_FEE: "Practice elsewhere fee",
};

const STATUS_TONES: Record<string, string> = {
  SUCCESS: styles.toneSuccess,
  PENDING: styles.toneWarning,
  FAILED: styles.toneDanger,
  REFUNDED: styles.toneMuted,
};

export function StudentPayments() {
  const { user } = useAuth();
  const payment = usePayment();
  const { loadPayments, initiatePayment } = payment;
  const [actionError, setActionError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void loadPayments({ userId: user.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) return null;
  const payments = payment.payments?.data ?? [];

  if (payment.isLoading && payments.length === 0)
    return <PageSkeleton variant="list" />;

  async function handlePay(id: string) {
    setActionError(null);
    const target = payments.find((p) => p.id === id);
    if (!target) return;
    setPayingId(id);
    try {
      await initiatePayment(target.type, target.amount, target.relatedEntityId ?? undefined);
      await loadPayments({ userId: user!.id });
    } catch {
      setActionError(
        "The payment could not be started. Please check your connection and try again.",
      );
    } finally {
      setPayingId(null);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <CreditCard size={14} /> Billing
          </p>
          <h1>My payments</h1>
          <span>Track your enrollment and course fees paid through Chapa.</span>
        </header>

        {payment.checkoutUrl && (
          <div className={styles.checkoutBanner}>
            <span>A Chapa checkout session is open for your latest payment.</span>
            <a
              href={payment.checkoutUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.checkoutLink}
            >
              <ExternalLink size={14} /> Open checkout
            </a>
          </div>
        )}

        {(actionError || payment.error) && (
          <p className={styles.formError} role="alert">
            {actionError ?? payment.error}
          </p>
        )}

        {payments.length ? (
          <section className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {payments.map((item) => (
                  <tr key={item.id}>
                    <td>{TYPE_LABELS[item.type] ?? item.type}</td>
                    <td>{formatCurrency(item.amount)}</td>
                    <td>{formatDateTime(item.createdAt)}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          STATUS_TONES[item.status] ?? styles.toneMuted
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {item.status === PaymentStatus.PENDING && (
                        <Button
                          size="sm"
                          disabled={payingId === item.id}
                          onClick={() => void handlePay(item.id)}
                        >
                          {payingId === item.id ? "Starting…" : "Pay now"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : (
          <EmptyState
            title="No payments yet"
            description="Fees for enrollments and course purchases will appear here."
          />
        )}
      </div>
    </main>
  );
}
