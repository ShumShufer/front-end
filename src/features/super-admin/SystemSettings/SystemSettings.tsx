import { useEffect, useState } from "react";
import { Save, Settings2 } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import styles from "./SystemSettings.module.css";

const COMMISSION_RATE = 0.1;
const MIN_NAME_LENGTH = 3;

export function SystemSettings() {
  const [platformName, setPlatformName] = useState("ShumShufer");
  const [supportEmail, setSupportEmail] = useState("support@shumshufer.et");
  const [commissionRate, setCommissionRate] = useState(
    String(COMMISSION_RATE * 100),
  );
  const [hydrated, setHydrated] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Values ship with the platform defaults; hydrate once for the skeleton.
    const timer = setTimeout(() => setHydrated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (platformName.trim().length < MIN_NAME_LENGTH) {
      setFormError("The platform name must be at least 3 characters.");
      return;
    }
    const numericRate = Number(commissionRate);
    if (
      commissionRate.trim() === "" ||
      Number.isNaN(numericRate) ||
      numericRate < 0 ||
      numericRate > 50
    ) {
      setFormError("Commission rate must be between 0 and 50 percent.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail.trim())) {
      setFormError("Enter a valid support email address.");
      return;
    }
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSuccessMessage("Platform settings saved.");
    } catch {
      setFormError("The settings could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!hydrated) return <PageSkeleton variant="dashboard" />;

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <Settings2 size={14} /> Configuration
          </p>
          <h1>System settings</h1>
        </header>

        <form className={styles.form} onSubmit={(e) => void handleSave(e)}>
          <label className={styles.field}>
            <span>Platform name</span>
            <input
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Support email</span>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
          </label>
          <label className={`${styles.field} ${styles.narrow}`}>
            <span>Commission rate (%)</span>
            <input
              type="number"
              min={0}
              max={50}
              step="0.5"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
            />
          </label>

          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}
          {successMessage && (
            <p className={styles.formSuccess} role="status">
              {successMessage}
            </p>
          )}
          <footer className={styles.actions}>
            <Button type="submit" disabled={isSaving}>
              <Save size={16} />
              {isSaving ? "Saving…" : "Save settings"}
            </Button>
          </footer>
        </form>
      </div>
    </main>
  );
}
