import { type FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Lock, Mail, User } from "lucide-react";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { Button } from "../../../components/Button/Button.tsx";
import { BrandLogo } from "../../../components/BrandLogo/BrandLogo.tsx";
import { Input } from "../../../components/Form/Input.tsx";
import { Role, VerificationStatus } from "../../../types/common.types.ts";
import { getDashboardPathForRole } from "../../../utils/permissions.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./AuthPage.module.css";

type AuthMode = "login" | "register";

interface AuthPageProps {
  initialMode?: AuthMode;
}

export function AuthPage({ initialMode = "login" }: AuthPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, register, isLoading, error } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [authSucceeded, setAuthSucceeded] = useState(false);

  const [prevMode, setPrevMode] = useState<AuthMode>(initialMode);
  if (initialMode !== prevMode) {
    setPrevMode(initialMode);
    setMode(initialMode);
  }

  useEffect(() => {
    if (!authSucceeded || !user) return;

    const from = (location.state as { from?: string } | null)?.from;
    if (from && from !== ROUTES.auth.login && from !== ROUTES.auth.register) {
      navigate(from, { replace: true });
      return;
    }

    if (user.verificationStatus === VerificationStatus.PENDING) {
      navigate(ROUTES.auth.verifyFayda, { replace: true });
      return;
    }

    navigate(getDashboardPathForRole(user.role), { replace: true });
  }, [authSucceeded, user, navigate, location.state]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setFormError(null);
    navigate(nextMode === "login" ? ROUTES.auth.login : ROUTES.auth.register, {
      replace: true,
    });
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!email.trim()) {
      setFormError("Please enter your email.");
      return;
    }
    if (!password) {
      setFormError("Please enter your password.");
      return;
    }

    try {
      await login({ email: email.trim(), password });
      setAuthSucceeded(true);
    } catch {
      // error surfaced via context
    }
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setFormError("Please enter your first and last name.");
      return;
    }
    if (!email.trim()) {
      setFormError("Please enter your email.");
      return;
    }
    if (!password.trim()) {
      setFormError("Please create a password.");
      return;
    }
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(password)
    ) {
      setFormError(
        "Password must be at least 8 characters and include uppercase, lowercase, a digit and a special character.",
      );
      return;
    }

    try {
      await register({
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
        role: Role.STUDENT,
      });
      setAuthSucceeded(true);
    } catch {
      // error surfaced via context
    }
  };

  const displayError = formError ?? error;

  const handleBack = () => {
    navigate(ROUTES.public.landing, { replace: true });
  };

  return (
    <div className={styles.page}>
      <button
        type="button"
        className={styles.backButton}
        onClick={handleBack}
        aria-label="Go to home page"
      >
        <ArrowLeft size={20} />
        Home
      </button>
      <div className={styles.layout}>
        <div className={styles.visual}>
          <img
            src="/shumshufer-asset-2.jpg"
            alt="Driving lesson on an Ethiopian road"
            className={styles.visualImage}
          />
          <div className={styles.visualOverlay}>
            <BrandLogo markSize={30} tone="inverse" className={styles.visualBadge} />
            <h2 className={styles.visualTitle}>
              Shift into gear. Your license awaits.
            </h2>
            <p className={styles.visualDesc}>
              Join thousands of learners finding verified schools, mastering
              theory, and hitting the road with confidence.
            </p>
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.card}>
            <div
              className={styles.tabBar}
              role="tablist"
              aria-label="Authentication mode"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                className={[
                  styles.tab,
                  mode === "login" ? styles.tabActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => switchMode("login")}
              >
                Log in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "register"}
                className={[
                  styles.tab,
                  mode === "register" ? styles.tabActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => switchMode("register")}
              >
                Sign up
              </button>
            </div>

            {mode === "login" ? (
              <>
                <p className={styles.eyebrow}>Welcome back</p>
                <h1 className={styles.title}>Good to see you again</h1>
                <p className={styles.subtitle}>
                  Sign in to continue your driving journey with ShumShufer.
                </p>

                <form className={styles.form} onSubmit={handleLogin}>
                  {displayError ? (
                    <div className={styles.errorBanner}>{displayError}</div>
                  ) : null}

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="student@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    icon={<Mail size={16} />}
                  />

                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    icon={<Lock size={16} />}
                  />

                  <div className={styles.forgotRow}>
                    <Link
                      to={ROUTES.auth.forgotPassword}
                      className={styles.forgotLink}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" size="lg" block disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 size={18} />
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>

                <p className={styles.foot}>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    className={styles.footLink}
                    onClick={() => switchMode("register")}
                  >
                    Create account
                  </button>
                </p>
              </>
            ) : (
              <>
                <p className={styles.eyebrow}>Join ShumShufer Ethiopia</p>
                <h1 className={styles.title}>Start your journey today</h1>
                <p className={styles.subtitle}>
                  Create your free account in under a minute.
                </p>

                <form className={styles.form} onSubmit={handleRegister}>
                  {displayError ? (
                    <div className={styles.errorBanner}>{displayError}</div>
                  ) : null}

                  <div className={styles.nameRow}>
                    <Input
                      label="First name"
                      name="firstName"
                      required
                      minLength={2}
                      autoComplete="given-name"
                      placeholder="Abebe"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      icon={<User size={16} />}
                    />
                    <Input
                      label="Last name"
                      name="lastName"
                      required
                      minLength={2}
                      autoComplete="family-name"
                      placeholder="Kebede"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                    />
                  </div>

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    icon={<Mail size={16} />}
                  />

                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    hint="At least 8 characters, with uppercase, lowercase, a digit and a symbol."
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    icon={<Lock size={16} />}
                  />

                  <Button type="submit" size="lg" block disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 size={18} />
                        Creating account...
                      </>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </form>

                <p className={styles.foot}>
                  Registering a school instead?{" "}
                  <Link to={ROUTES.auth.onboarding} className={styles.footLink}>
                    School registration
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
