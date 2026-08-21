import {
  type LucideIcon,
  Bell,
  Building2,
  Calendar,
  ClipboardList,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MapPinned,
  School,
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
      {
        label: "Enrollments",
        to: ROUTES.admin.enrollments,
        icon: FileCheck2,
      },
      { label: "Staff openings", to: ROUTES.admin.staffPosts, icon: Users },
      { label: "Applications", to: ROUTES.admin.staffApplications, icon: Bell },
      {
        label: "Education heads",
        to: ROUTES.admin.educationHeads,
        icon: UserRound,
      },
    ];
  if (homePath === ROUTES.student.dashboard)
    return [
      { label: "Dashboard", to: homePath, icon: LayoutDashboard },
      { label: "My schools", to: ROUTES.student.applications, icon: School },
      { label: "Classrooms", to: ROUTES.student.classroom, icon: GraduationCap },
      { label: "Courses", to: ROUTES.student.results, icon: ClipboardList },
      { label: "My profile", to: ROUTES.student.profile, icon: UserRound },
      { label: "Notifications", to: ROUTES.student.notifications, icon: Bell },
    ];
  if (homePath === ROUTES.mentor.dashboard)
    return [
      { label: "Dashboard", to: homePath, icon: LayoutDashboard },
      { label: "My classrooms", to: ROUTES.mentor.classrooms, icon: GraduationCap },
      { label: "Course delivery", to: ROUTES.mentor.courses, icon: ClipboardList },
      { label: "My profile", to: ROUTES.mentor.profile, icon: UserRound },
      { label: "Notifications", to: ROUTES.mentor.notifications, icon: Bell },
    ];
  return [
    { label: "Dashboard", to: homePath, icon: LayoutDashboard },
    { label: "Classrooms", to: ROUTES.educationHead.classrooms, icon: GraduationCap },
    { label: "Mentor assignments", to: ROUTES.educationHead.mentors, icon: Users },
    { label: "School calendar", to: ROUTES.educationHead.schedule, icon: Calendar },
    { label: "Course oversight", to: ROUTES.educationHead.courses, icon: ClipboardList },
    { label: "Notifications", to: ROUTES.educationHead.notifications, icon: Bell },
  ];
}
export function AppShell({ roleLabel, homePath }: AppShellProps) {
  const { user, logout } = useAuth();
  const links = linksFor(homePath);
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link to={ROUTES.public.landing} className={styles.brand}>
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
