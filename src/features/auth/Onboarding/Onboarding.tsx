import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./Onboarding.module.css";

const MIN_PASSWORD_LENGTH = 8;

export function Onboarding() {
  const auth = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      setFormError("Enter your full name as it appears on your Fayda ID.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(
        `Your password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      );
      return;
    }
    if (password !== confirmPassword) {
      setFormError("The passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await auth.register({
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
        role: "STUDENT",
      });
    } catch {
      setFormError("We couldn't create your account. Try a different email.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <p>
            <UserPlus size={14} /> Get started
          </p>
          <h1>Create your learner account</h1>
          <span>Next step: verify your identity with Fayda.</span>
        </header>

        <form className={styles.form} onSubmit={(e) => void handleRegister(e)}>
          <div className={styles.nameRow}>
            <label className={styles.field}>
              <span>First name</span>
              <input
                value={firstName}
                autoComplete="given-name"
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Last name</span>
              <input
                value={lastName}
                autoComplete="family-name"
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>
          </div>
          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              value={email}
              autoComplete="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <input
              type="password"
              value={password}
              autoComplete="new-password"
              placeholder={`${MIN_PASSWORD_LENGTH}+ characters`}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Confirm password</span>
            <input
              type="password"
              value={confirmPassword}
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>
          {auth.error && (
            <p className={styles.formError} role="alert">
              {formError ?? auth.error}
            </p>
          )}
          {!auth.error && formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}
          <Button type="submit" block disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <footer className={styles.footer}>
          Already have an account?{" "}
          <Link to={ROUTES.auth.login}>Sign in</Link>
        </footer>
      </div>
    </main>
  );
}
