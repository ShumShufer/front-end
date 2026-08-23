import { useEffect, useMemo } from "react";
import { Receipt, Wallet } from "lucide-react";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { usePayment } from "../../../context/payment/usePayment.ts";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
} from "../../../utils/formatters.ts";
import styles from "./PaymentsOverview.module.css";

const COMMISSION_RATE = 0.1;
const SUCCESS_STATUS = "SUCCESS";

export function PaymentsOverview() {
  const payment = usePayment();

  useEffect(() => {
    void payment.loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const payments = payment.payments?.data ?? [];
  const successful = useMemo(
    () => payments.filter((p) => p.status === SUCCESS_STATUS),
    [payments],
  );
  const gross = successful.reduce((sum, p) => sum + p.amount, 0);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <Wallet size={14} /> Finance
          </p>
          <h1>Payments overview</h1>
        </header>

        {successful.length > 0 && (
          <section className={styles.summary}>
            <div>
              <strong>{formatCompactCurrency(gross)}</strong>
              <span>Successful volume</span>
            </div>
            <div>
              <strong>{formatCompactCurrency(gross * COMMISSION_RATE)}</strong>
              <span>Platform revenue ({COMMISSION_RATE * 100}%)</span>
            </div>
          </section>
        )}

        {payment.isLoading && !payment.payments ? (
          <PageSkeleton variant="list" />
        ) : payments.length ? (
          <section className={styles.table}>
            <div className={`${styles.row} ${styles.headRow}`}>
              <span>Date</span>
              <span>Type</span>
              <span>Status</span>
              <span>Amount</span>
            </div>
            {[...payments]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((p) => (
                <div key={p.id} className={styles.row}>
                  <span>{formatDate(p.createdAt)}</span>
                  <span>{p.type}</span>
                  <span
                    className={`${styles.badge} ${
                      p.status === SUCCESS_STATUS
                        ? styles.toneSuccess
                        : p.status === "FAILED"
                          ? styles.toneDanger
                          : styles.toneWarning
                    }`}
                  >
                    {p.status}
                  </span>
                  <span>{formatCurrency(p.amount)}</span>
                </div>
              ))}
          </section>
        ) : (
          <EmptyState
            title="No payments yet"
            description="Transactions across the platform appear here."
          />
        )}

        <p className={styles.note}>
          <Receipt size={13} /> Commission is calculated at{" "}
          {COMMISSION_RATE * 100}% per successful transaction.
        </p>
      </div>
    </main>
  );
}
