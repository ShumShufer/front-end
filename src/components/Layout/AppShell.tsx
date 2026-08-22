import {
  type LucideIcon,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  ClipboardList,
  CreditCard,
  FileCheck2,
  FingerprintPattern,
  Flag,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Megaphone,
  School,
  Settings,
  ShieldUser,
  UserRound,
  Users,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/auth/useAuth.ts";
import { Logo } from "../Logo/Logo.tsx";
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
      { label: "Job openings", to: ROUTES.mentor.openings, icon: Briefcase },
      { label: "My profile", to: ROUTES.mentor.profile, icon: UserRound },
      { label: "Notifications", to: ROUTES.mentor.notifications, icon: Bell },
    ];
  if (homePath === ROUTES.educationHead.dashboard)
    return [
      { label: "Dashboard", to: homePath, icon: LayoutDashboard },
      { label: "Classrooms", to: ROUTES.educationHead.classrooms, icon: GraduationCap },
      { label: "Mentor assignments", to: ROUTES.educationHead.mentors, icon: Users },
      { label: "School calendar", to: ROUTES.educationHead.schedule, icon: Calendar },
      { label: "Course oversight", to: ROUTES.educationHead.courses, icon: ClipboardList },
      { label: "Notifications", to: ROUTES.educationHead.notifications, icon: Bell },
    ];
  
  if (homePath === ROUTES.superAdmin.dashboard)
    return [
      { label: "Dashboard", to: homePath, icon: LayoutDashboard },
      { label: "Schools", to: ROUTES.superAdmin.schools, icon: School },
      { label: "Admins", to: ROUTES.superAdmin.admins, icon: ShieldUser },
      { label: "Announcements", to: ROUTES.superAdmin.announcements, icon: Megaphone },
      { label: "Courses", to: ROUTES.superAdmin.courses, icon: ClipboardList },
      { label: "Payments", to: ROUTES.superAdmin.payments, icon: CreditCard },
      { label: "Reports", to: ROUTES.superAdmin.reports, icon: Flag },
      { label: "Users", to: ROUTES.superAdmin.users, icon: Users },
      { label: "Fayda Audit", to: ROUTES.superAdmin.faydaAudit, icon: FingerprintPattern },
      { label: "Settings", to: ROUTES.superAdmin.settings, icon: Settings },
      { label: "Notifications", to: ROUTES.superAdmin.notifications, icon: Bell },
    ];
  // Unknown home path: show a minimal nav rather than failing.
  return [{ label: "Dashboard", to: homePath, icon: LayoutDashboard }];
}
export function AppShell({ roleLabel, homePath }: AppShellProps) {
  const { user, logout } = useAuth();
  const links = linksFor(homePath);
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link to={ROUTES.public.landing} className={styles.brand}>
          <Logo className={styles.brandLogo} />
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
