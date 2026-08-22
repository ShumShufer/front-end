import { Link } from "react-router-dom";
import { ROUTES } from "../../router/routes.config.ts";
import styles from "./PublicFooter.module.css";
import { Logo } from "../Logo/Logo.tsx";

export function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.columns}>
          <div className={styles.brandBlock}>
            <div className={styles.brandRow}>
              <div className={styles.logoWrap}>
                <Logo className={styles.footerLogo} />
              </div>
              <span className={styles.brandName}>ShumShufer</span>
            </div>
            <p className={styles.brandDesc}>
              Ethiopia&apos;s driving school hub — find a verified school, learn
              the theory, book your practical lessons, and get road-ready.
            </p>
          </div>

          <div>
            <h5 className={styles.colTitle}>Platform</h5>
            <Link className={styles.colLink} to={ROUTES.public.schools}>
              Find Schools
            </Link>
            <Link className={styles.colLink} to={ROUTES.public.courses}>
              Learn Online
            </Link>
            <Link className={styles.colLink} to={ROUTES.public.pricing}>
              Pricing
            </Link>
          </div>

          <div>
            <h5 className={styles.colTitle}>Company</h5>
            <Link className={styles.colLink} to={ROUTES.public.about}>
              How it works
            </Link>
            <Link className={styles.colLink} to={ROUTES.public.drivers}>
              Verify a driver
            </Link>
          </div>

          <div>
            <h5 className={styles.colTitle}>Get started</h5>
            <Link className={styles.colLink} to={ROUTES.auth.register}>
              Create account
            </Link>
            <Link className={styles.colLink} to={ROUTES.auth.login}>
              Log in
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        © 2026 ShumShufer. Driving education, connected. · Addis Ababa, Ethiopia
        · Pay with Telebirr &amp; CBE Birr
      </div>
    </footer>
  );
}
