import { Clock3, MailCheck } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./VerificationPending.module.css";

export function VerificationPending() {
  const auth = useAuth();
  const status = auth.user?.verificationStatus ?? "PENDING";

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        {status === "REJECTED" ? (
          <>
            <span className={`${styles.icon} ${styles.iconDanger}`}>
              <Clock3 size={26} />
            </span>
            <h1>Verification declined</h1>
            <p>
              Your Fayda ID could not be verified. Please resubmit a valid ID
              number or contact your driving school for help.
            </p>
            <Button to={ROUTES.auth.verifyFayda} variant="secondary">
              Resubmit ID
            </Button>
          </>
        ) : (
          <>
            <span className={`${styles.icon} ${styles.iconPrimary}`}>
              <MailCheck size={26} />
            </span>
            <h1>Verification in progress</h1>
            <p>
              We've received your Fayda ID. Most checks finish within one
              business day — you'll get a notification as soon as you're
              verified.
            </p>
            <Button to={ROUTES.auth.login} variant="secondary">
              Back to sign in
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
