import {
  type LucideIcon,
  Bell,
  Building2,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MapPinned,
  UserRound,
  Users,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/auth/useAuth.ts";
import { ROUTES } from "../../router/routes.config.ts";
import styles from "./AppShell.module.css";

interface AppShellProps {
  roleLabel: string;
  homePath: string;
}
interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}
function linksFor(homePath: string): NavItem[] {
  if (homePath === ROUTES.admin.dashboard)
    return [
      {
        label: "Control room",
        to: ROUTES.admin.dashboard,
        icon: LayoutDashboard,
      },
      { label: "My profile", to: ROUTES.admin.profile, icon: UserRound },
      {
        label: "School profile",
        to: ROUTES.admin.schoolProfile,
        icon: Building2,
      },
      {
        label: "School Calendar",
        to: ROUTES.admin.schedule,
        icon: Calendar,
      },
      { label: "Branches", to: ROUTES.admin.branches, icon: MapPinned },
      { label: "Classrooms", to: ROUTES.admin.classrooms, icon: GraduationCap },
      { label: "Staff openings", to: ROUTES.admin.staffPosts, icon: Users },
      { label: "Applications", to: ROUTES.admin.staffApplications, icon: Bell },
      {
        label: "Education heads",
        to: ROUTES.admin.educationHeads,
        icon: UserRound,
      },
    ];
  const profile =
    homePath === ROUTES.student.dashboard
      ? ROUTES.student.profile
      : ROUTES.mentor.profile;
  return [
    { label: "Dashboard", to: homePath, icon: LayoutDashboard },
    { label: "My profile", to: profile, icon: UserRound },
    { label: "Notifications", to: ROUTES.shared.notifications, icon: Bell },
  ];
}
export function AppShell({ roleLabel, homePath }: AppShellProps) {
  const { user, logout } = useAuth();
  const links = linksFor(homePath);
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link to={homePath} className={styles.brand}>
          <img src="/shumshufer-logo.jpg" alt="ShumShufer" />
          <span>ShumShufer</span>
        </Link>
        <p className={styles.role}>{roleLabel}</p>
        <nav>
          {links.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [styles.link, isActive ? styles.active : ""]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.account}>
          <span>
            {user?.firstName} {user?.lastName}
          </span>
          <button onClick={() => void logout()}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
