import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./NotFound.module.css";

export function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <span className={styles.icon}>
          <Compass size={26} />
        </span>
        <strong>404</strong>
        <h1>Page not found</h1>
        <p>The road you took doesn't lead anywhere. Let's get you back on track.</p>
        <Button to={ROUTES.public.landing}>Back to home</Button>
        <Link to={ROUTES.public.courses} className={styles.altLink}>
          or browse courses
        </Link>
      </div>
    </main>
  );
}
