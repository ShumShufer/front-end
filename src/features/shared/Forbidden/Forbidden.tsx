import { Link } from "react-router-dom";
import { ShieldOff } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./Forbidden.module.css";

export function Forbidden() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <span className={styles.icon}>
          <ShieldOff size={26} />
        </span>
        <strong>403</strong>
        <h1>Access denied</h1>
        <p>
          Your account doesn't have permission to view this page. If you think
          this is a mistake, contact your school's administrator.
        </p>
        <Button to={ROUTES.public.landing}>Back to home</Button>
        <Link to={ROUTES.auth.login} className={styles.altLink}>
          switch account
        </Link>
      </div>
    </main>
  );
}
