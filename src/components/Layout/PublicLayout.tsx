import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { useAuth } from "../../context/auth/useAuth.ts";
import { getDashboardPathForRole } from "../../utils/permissions.ts";
import { ROUTES } from "../../router/routes.config.ts";
import { Logo } from "../Logo/Logo.tsx";
import styles from "./PublicLayout.module.css";

const NAV_LINKS: Array<{
  to: string;
  label: string;
  end?: boolean;
}> = [
  { to: ROUTES.public.landing, label: "Home", end: true },
  { to: ROUTES.public.schools, label: "Find Schools" },
  { to: ROUTES.public.courses, label: "Learn Online" },
  { to: ROUTES.public.applications, label: "Applications" },
  { to: ROUTES.public.announcements, label: "Announcements" },
];

const LANDING_HERO_SELECTOR = "[data-landing-hero]";
const DEFAULT_SCROLL_THRESHOLD = 24;

function getNavHeight() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    "--nav-height",
  );
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

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

  // Close the mobile menu whenever the route changes (render-phase
  // adjustment, per React docs).
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const onScroll = () => {
      const hero = document.querySelector<HTMLElement>(LANDING_HERO_SELECTOR);
      // Stay transparent while the hero fills the viewport; turn solid once
      // the user scrolls past it.
      const threshold = hero
        ? hero.offsetHeight - getNavHeight()
        : DEFAULT_SCROLL_THRESHOLD;
      setScrolled(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  const navClass = [
    styles.nav,
    landingRoute && !scrolled ? styles.navTransparent : styles.navSolid,
  ].join(" ");

  return (
    <div className={styles.main}>
      {!authRoute && (
        <header className={navClass}>
          <Link to={ROUTES.public.landing} className={styles.brand}>
            <div className={styles.logoWrap}>
              <Logo className={styles.logoSvg} />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>ShumShufer</span>
            </div>
          </Link>

          <nav className={styles.navLinks} aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
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

          <div className={styles.navActions}>
            {user ? (
              <Link
                to={getDashboardPathForRole(user.role)}
                className={styles.btnPrimary}
              >
                <ArrowUpRight size={16} />
                Portal
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
      )}

      {!authRoute && (
        <div
          className={[
            styles.mobileDrawer,
            menuOpen ? styles.mobileDrawerOpen : "",
          ].join(" ")}
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                [
                  styles.mobileNavLink,
                  isActive ? styles.mobileNavLinkActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              {link.label}
            </NavLink>
          ))}

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
                <ArrowUpRight size={16} /> Portal
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
      )}

      <Outlet />
    </div>
  );
}
