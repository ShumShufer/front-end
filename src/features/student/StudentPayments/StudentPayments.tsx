import { useEffect, useState } from "react";
import {
  CreditCard,
  PlusCircle,
  CheckCircle2,
  Smartphone,
  Building,
  ShieldCheck,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { usePayment } from "../../../context/payment/usePayment.ts";
import { formatCurrency, formatDateTime } from "../../../utils/formatters.ts";
import { PaymentStatus, PaymentType } from "../../../types/common.types.ts";
import { ROUTES } from "../../../router/routes.config.ts";
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

interface ActiveCheckout {
  txRef: string;
  amount: number;
  type: string;
}

export function StudentPayments() {
  const { user } = useAuth();
  const payment = usePayment();
  const { loadPayments, initiatePayment, verifyPayment } = payment;
  const [actionError, setActionError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<PaymentType>(PaymentType.ENROLLMENT);
  const [amount, setAmount] = useState("1500");
  const [isInitiating, setIsInitiating] = useState(false);

  // Chapa Interactive Checkout Modal State
  const [activeCheckout, setActiveCheckout] = useState<ActiveCheckout | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "cbebirr" | "card">("telebirr");
  const [isCompletingPayment, setIsCompletingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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
      const data = await initiatePayment(target.type, target.amount, target.relatedEntityId ?? undefined);
      const txRef = data?.payment?.chapaTxRef || data?.payment?.id || `tx_${target.id}`;
      if (data?.payment || data?.checkoutUrl) {
        setActiveCheckout({
          txRef,
          amount: target.amount,
          type: target.type,
        });
        setPaymentSuccess(false);
      }
      await loadPayments({ userId: user!.id });
    } catch {
      setActionError(
        "The payment could not be started. Please check your connection and try again.",
      );
    } finally {
      setPayingId(null);
    }
  }

  async function handleCreateNewPayment(e: React.FormEvent) {
    e.preventDefault();
    setActionError(null);
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setActionError("Please enter a valid payment amount in ETB.");
      return;
    }

    setIsInitiating(true);
    try {
      const data = await initiatePayment(selectedType, parsedAmount);
      const txRef = data?.payment?.chapaTxRef || data?.payment?.id || `tx_${Date.now()}`;
      if (data?.payment || data?.checkoutUrl) {
        setActiveCheckout({
          txRef,
          amount: parsedAmount,
          type: selectedType,
        });
        setPaymentSuccess(false);
      }
      await loadPayments({ userId: user!.id });
      setShowModal(false);
    } catch {
      setActionError("Failed to initiate Chapa payment. Please try again.");
    } finally {
      setIsInitiating(false);
    }
  }

  async function handleSimulateCompletePayment() {
    if (!activeCheckout) return;
    setIsCompletingPayment(true);
    setActionError(null);
    try {
      await verifyPayment(activeCheckout.txRef);
      setPaymentSuccess(true);
      await loadPayments({ userId: user!.id });
    } catch {
      setActionError("Payment verification failed. Please try again.");
    } finally {
      setIsCompletingPayment(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p>
              <CreditCard size={14} /> Billing & Invoices
            </p>
            <h1>My payments</h1>
            <span>Track and manage your driving school fees paid through Chapa.</span>
          </div>

          <Button
            onClick={() => {
              setActionError(null);
              setShowModal(true);
            }}
          >
            <PlusCircle size={16} style={{ display: "inline", marginRight: "6px" }} />
            New Payment (Chapa)
          </Button>
        </header>

        {/* Chapa Checkout Simulator Dialog */}
        {activeCheckout && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "1rem",
            }}
          >
            <div
              style={{
                background: "var(--color-surface-raised, #ffffff)",
                border: "1px solid var(--color-border)",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "480px",
                padding: "2rem",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
                position: "relative",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveCheckout(null)}
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                }}
              >
                <X size={20} />
              </button>

              {!paymentSuccess ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#00a859", marginBottom: "0.5rem" }}>
                    <ShieldCheck size={20} />
                    <strong style={{ fontSize: "16px" }}>Chapa Checkout Gateway</strong>
                  </div>
                  <h2 style={{ fontSize: "24px", margin: "0.25rem 0 1rem" }}>
                    {formatCurrency(activeCheckout.amount)}
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "1.25rem" }}>
                    Ref: <code style={{ fontSize: "11px", background: "var(--color-bg)", padding: "2px 6px", borderRadius: "4px" }}>{activeCheckout.txRef}</code>
                  </p>

                  <div style={{ display: "grid", gap: "10px", marginBottom: "1.5rem" }}>
                    <label
                      onClick={() => setPaymentMethod("telebirr")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: paymentMethod === "telebirr" ? "2px solid #00a859" : "1px solid var(--color-border)",
                        background: paymentMethod === "telebirr" ? "rgba(0, 168, 89, 0.08)" : "var(--color-bg)",
                        cursor: "pointer",
                      }}
                    >
                      <Smartphone size={20} color="#00a859" />
                      <div>
                        <strong>Telebirr</strong>
                        <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Ethio Telecom mobile wallet</div>
                      </div>
                    </label>

                    <label
                      onClick={() => setPaymentMethod("cbebirr")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: paymentMethod === "cbebirr" ? "2px solid #800080" : "1px solid var(--color-border)",
                        background: paymentMethod === "cbebirr" ? "rgba(128, 0, 128, 0.08)" : "var(--color-bg)",
                        cursor: "pointer",
                      }}
                    >
                      <Building size={20} color="#800080" />
                      <div>
                        <strong>CBEBirr</strong>
                        <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Commercial Bank of Ethiopia</div>
                      </div>
                    </label>

                    <label
                      onClick={() => setPaymentMethod("card")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: paymentMethod === "card" ? "2px solid #0066cc" : "1px solid var(--color-border)",
                        background: paymentMethod === "card" ? "rgba(0, 102, 204, 0.08)" : "var(--color-bg)",
                        cursor: "pointer",
                      }}
                    >
                      <CreditCard size={20} color="#0066cc" />
                      <div>
                        <strong>Bank Card</strong>
                        <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Visa / Mastercard / Local Debit</div>
                      </div>
                    </label>
                  </div>

                  <Button
                    block
                    disabled={isCompletingPayment}
                    onClick={() => void handleSimulateCompletePayment()}
                  >
                    {isCompletingPayment
                      ? "Processing Payment…"
                      : `Confirm & Pay ${formatCurrency(activeCheckout.amount)}`}
                  </Button>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                  <CheckCircle2 size={56} color="#00a859" style={{ margin: "0 auto 1rem" }} />
                  <h2 style={{ fontSize: "22px", marginBottom: "0.5rem" }}>Payment Successful!</h2>
                  <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
                    Your transaction for {formatCurrency(activeCheckout.amount)} was confirmed by Chapa.
                  </p>
                  <div style={{ display: "grid", gap: "10px" }}>
                    <Button onClick={() => setActiveCheckout(null)}>
                      Done & View Invoice
                    </Button>
                    <Link
                      to={ROUTES.student.courses}
                      style={{ fontSize: "14px", color: "var(--color-primary)", textDecoration: "none", marginTop: "4px" }}
                    >
                      Go to Courses →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {showModal && (
          <div
            style={{
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "1.5rem",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <h3 style={{ marginBottom: "0.5rem" }}>Initiate New Chapa Payment</h3>
            <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
              Pay your school enrollment fee, course bundle, or driving lesson practice fee via Telebirr / CBEBirr.
            </p>
            <form onSubmit={handleCreateNewPayment} style={{ display: "grid", gap: "1rem", maxWidth: "480px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                  Payment Purpose
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as PaymentType)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)" }}
                >
                  <option value={PaymentType.ENROLLMENT}>Enrollment Fee</option>
                  <option value={PaymentType.COURSE_PURCHASE}>Course Purchase</option>
                  <option value={PaymentType.PRACTICE_ELSEWHERE_FEE}>Practice Elsewhere Fee</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                  Amount (ETB)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="50"
                  step="50"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)" }}
                />
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[500, 1500, 2500, 4000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "16px",
                      padding: "3px 10px",
                      fontSize: "12px",
                      cursor: "pointer",
                      color: "var(--color-text)",
                    }}
                  >
                    {preset} ETB
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "0.5rem" }}>
                <Button type="submit" disabled={isInitiating}>
                  {isInitiating ? "Starting Chapa Session…" : "Proceed to Chapa"}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
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
            description="Click 'New Payment (Chapa)' to initiate a school enrollment or course purchase."
          />
        )}
      </div>
    </main>
  );
}

