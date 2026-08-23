import { useEffect, useMemo } from "react";
import { Banknote, PiggyBank, Receipt, TrendingUp } from "lucide-react";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { usePayment } from "../../../context/payment/usePayment.ts";
import { formatCurrency, formatDate } from "../../../utils/formatters.ts";
import styles from "./RevenueReport.module.css";

const COMMISSION_RATE = 0.1;
const SUCCESS_STATUS = "SUCCESS";

export function RevenueReport() {
  const payment = usePayment();

  useEffect(() => {
    void payment.loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const successful = useMemo(
    () =>
      (payment.payments?.data ?? []).filter((p) => p.status === SUCCESS_STATUS),
    [payment.payments],
  );

  const totals = useMemo(() => {
    let gross = 0;
    let commission = 0;
    const byType = new Map<string, number>();
    successful.forEach((p) => {
      gross += p.amount;
      commission += p.amount * COMMISSION_RATE;
      byType.set(p.type, (byType.get(p.type) ?? 0) + p.amount);
    });
    return {
      gross,
      commission,
      net: gross - commission,
      count: successful.length,
      byType: [...byType.entries()],
    };
  }, [successful]);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <TrendingUp size={14} /> Finance
          </p>
          <h1>Revenue report</h1>
          <span>Platform commission is {COMMISSION_RATE * 100}% of each transaction.</span>
        </header>

        {payment.isLoading && !payment.payments ? (
          <PageSkeleton variant="dashboard" />
        ) : successful.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Successful payments will appear here as they are processed."
          />
        ) : (
          <>
            <section className={styles.statGrid}>
              <article className={`${styles.stat} ${styles.gross}`}>
                <Banknote size={18} />
                <strong>{formatCurrency(totals.gross)}</strong>
                <span>Gross volume</span>
              </article>
              <article className={`${styles.stat} ${styles.commission}`}>
                <Receipt size={18} />
                <strong>{formatCurrency(totals.commission)}</strong>
                <span>Platform commission</span>
              </article>
              <article className={`${styles.stat} ${styles.net}`}>
                <PiggyBank size={18} />
                <strong>{formatCurrency(totals.net)}</strong>
                <span>Net to school</span>
              </article>
              <article className={styles.stat}>
                <Receipt size={18} />
                <strong>{totals.count}</strong>
                <span>Transactions</span>
              </article>
            </section>

            {totals.byType.length > 0 && (
              <section className={styles.breakdown}>
                <h2>By type</h2>
                {totals.byType.map(([type, amount]) => (
                  <div key={type} className={styles.barRow}>
                    <span>{type}</span>
                    <div className={styles.track}>
                      <div
                        className={styles.fill}
                        style={{ width: `${Math.round((amount / totals.gross) * 100)}%` }}
                      />
                    </div>
                    <strong>{formatCurrency(amount)}</strong>
                  </div>
                ))}
              </section>
            )}

            <section className={styles.table}>
              <h2>Recent transactions</h2>
              {[...successful]
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .slice(0, 10)
                .map((p) => (
                  <div key={p.id} className={styles.row}>
                    <span>{p.type}</span>
                    <small>{formatDate(p.createdAt)}</small>
                    <span>{formatCurrency(p.amount)}</span>
                  </div>
                ))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
