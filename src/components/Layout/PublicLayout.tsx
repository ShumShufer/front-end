import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowRight, LayoutDashboard, Menu, X } from "lucide-react";
import { useAuth } from "../../context/auth/useAuth.ts";
import { getDashboardPathForRole } from "../../utils/permissions.ts";
import { ROUTES } from "../../router/routes.config.ts";
import styles from "./PublicLayout.module.css";

const NAV_LINKS = [
  { to: ROUTES.public.schools, label: "Find Schools" },
  { to: ROUTES.public.courses, label: "Learn Online" },
  { to: ROUTES.public.mentors, label: "Mentors" },
  { to: ROUTES.public.drivers, label: "Verify a Driver" },
  { to: ROUTES.public.about, label: "How it works" },
  { to: ROUTES.public.pricing, label: "Pricing" },
];

function isAuthRoute(pathname: string) {
  return pathname.startsWith("/auth");
}

function isLandingRoute(pathname: string) {
  return pathname === ROUTES.public.landing;
}

export function PublicLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const authRoute = isAuthRoute(location.pathname);
  const landingRoute = isLandingRoute(location.pathname);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navClass = [
    styles.nav,
    landingRoute && !scrolled ? styles.navTransparent : styles.navSolid,
  ].join(" ");

  return (
    <div className={styles.main}>
      <header className={navClass}>
        <Link to={ROUTES.public.landing} className={styles.brand}>
          <div className={styles.logoWrap}>
            <img src="/shumshufer-logo.jpg" alt="ShumShufer logo" />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>ShumShufer</span>
            <span className={styles.brandSub}>Ethiopia</span>
          </div>
        </Link>

        {!authRoute ? (
          <nav className={styles.navLinks} aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.navLinkActive : ""]
                    .filter(Boolean)
                    .join(" ")
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        ) : (
          <div className={styles.navLinks} aria-hidden="true" />
        )}

        <div className={styles.navActions}>
          {authRoute ? (
            location.pathname === ROUTES.auth.login ? (
              <>
                <span className={styles.navHint}>New here?</span>
                <Link to={ROUTES.auth.register} className={styles.btnGhost}>
                  Sign up
                </Link>
              </>
            ) : location.pathname === ROUTES.auth.register ? (
              <>
                <span className={styles.navHint}>Already have an account?</span>
                <Link to={ROUTES.auth.login} className={styles.btnGhost}>
                  Log in
                </Link>
              </>
            ) : null
          ) : user ? (
            <Link
              to={getDashboardPathForRole(user.role)}
              className={styles.btnPrimary}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          ) : (
            <>
              <Link to={ROUTES.auth.login} className={styles.btnGhost}>
                Log in
              </Link>
              <Link to={ROUTES.auth.register} className={styles.btnPrimary}>
                Sign up
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className={styles.mobileMenuBtn}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <div
        className={[
          styles.mobileDrawer,
          menuOpen ? styles.mobileDrawerOpen : "",
        ].join(" ")}
      >
        {!authRoute
          ? NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  [styles.mobileNavLink, isActive ? styles.navLinkActive : ""]
                    .filter(Boolean)
                    .join(" ")
                }
              >
                {link.label}
              </NavLink>
            ))
          : null}

        <div className={styles.mobileDivider} />

        <div className={styles.mobileActions}>
          {user ? (
            <Link
              to={getDashboardPathForRole(user.role)}
              className={[
                styles.mobileActionBtn,
                styles.mobileActionBtnSolid,
              ].join(" ")}
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to={ROUTES.auth.login}
                className={[
                  styles.mobileActionBtn,
                  styles.mobileActionBtnOutline,
                ].join(" ")}
              >
                Log in
              </Link>
              <Link
                to={ROUTES.auth.register}
                className={[
                  styles.mobileActionBtn,
                  styles.mobileActionBtnSolid,
                ].join(" ")}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      <Outlet />
    </div>
  );
}
