import { type FormEvent, useState } from "react";
import { KeyRound, Mail } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../../components/Button/Button.tsx";
import { Input } from "../../../components/Form/Input.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./PasswordFlow.module.css";

export function PasswordFlow({ reset = false }: { reset?: boolean }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { requestPasswordReset, resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      if (reset) {
        if (password !== confirm) throw new Error("Passwords do not match");
        await resetPassword(
          params.get("token") || "mock-reset-token",
          password,
        );
        setNotice("Password reset. You can now sign in.");
      } else {
        await requestPasswordReset(email);
        setNotice(
          "If the address is registered, we sent a password reset link.",
        );
      }
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Something went wrong",
      );
    }
  };
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.icon}>
          <KeyRound size={24} />
        </div>
        <p className={styles.kicker}>
          {reset ? "Secure your account" : "Password recovery"}
        </p>
        <h1>{reset ? "Set a new password" : "Forgot your password?"}</h1>
        <p className={styles.lead}>
          {reset
            ? "Choose a strong password you have not used before."
            : "Enter the email you use for ShumShufer and we will send a reset link."}
        </p>
        <form onSubmit={submit} className={styles.form}>
          {reset ? (
            <>
              <Input
                label="New password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
                icon={<KeyRound size={17} />}
              />
              <Input
                label="Confirm password"
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                minLength={8}
                required
                icon={<KeyRound size={17} />}
              />
            </>
          ) : (
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              icon={<Mail size={17} />}
            />
          )}
          {error && <p className={styles.error}>{error}</p>}
          {notice && <p className={styles.notice}>{notice}</p>}
          <Button type="submit" block size="lg" disabled={isLoading}>
            {isLoading
              ? "Please wait…"
              : reset
                ? "Reset password"
                : "Send reset link"}
          </Button>
        </form>
        <Link to={ROUTES.auth.login} className={styles.back}>
          Back to sign in
        </Link>
        {reset && notice && (
          <Button
            variant="secondary"
            block
            onClick={() => navigate(ROUTES.auth.login)}
          >
            Go to sign in
          </Button>
        )}
      </section>
    </main>
  );
}
