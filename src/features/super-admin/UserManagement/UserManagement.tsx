import { useEffect, useMemo, useState } from "react";
import { Search, ShieldBan, UserCog } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useUser } from "../../../context/user/useUser.ts";
import { Role } from "../../../types/common.types.ts";
import styles from "./UserManagement.module.css";

const ROLE_OPTIONS = [
  Role.STUDENT,
  Role.MENTOR,
  Role.EDUCATION_HEAD,
  Role.ADMIN,
] as const;

export function UserManagement() {
  const userCtx = useUser();
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    void userCtx.loadUsers(search.trim() ? { search: search.trim() } : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const users = useMemo(() => {
    const all = userCtx.users?.data ?? [];
    return [...all].sort((a, b) => a.role.localeCompare(b.role));
  }, [userCtx.users]);

  async function handleRoleChange(userId: string, role: string) {
    setActionError(null);
    setBusyId(userId);
    try {
      await userCtx.assignRole(userId, role);
      await userCtx.loadUsers();
    } catch {
      setActionError("The role could not be updated. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSuspend(userId: string, name: string) {
    if (!window.confirm(`Suspend ${name}? They will lose access immediately.`)) return;
    setActionError(null);
    setBusyId(userId);
    try {
      await userCtx.suspendUser(userId);
      await userCtx.loadUsers();
    } catch {
      setActionError("The account could not be suspended. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <UserCog size={14} /> Accounts
          </p>
          <h1>User management</h1>
        </header>

        <label className={styles.searchBox}>
          <Search size={16} />
          <input
            value={search}
            placeholder="Search users…"
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                void userCtx.loadUsers(
                  search.trim() ? { search: search.trim() } : undefined,
                );
            }}
          />
        </label>

        {actionError && (
          <p className={styles.formError} role="alert">
            {actionError}
          </p>
        )}

        {userCtx.isLoading && !userCtx.users ? (
          <PageSkeleton variant="list" />
        ) : users.length ? (
          <section className={styles.table} aria-label="User list">
            <div className={`${styles.row} ${styles.headRow}`}>
              <span>User</span>
              <span>Role</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {users.map((u) => (
              <div key={u.id} className={styles.row}>
                <strong>
                  {u.firstName} {u.lastName}
                  <small>{u.email}</small>
                </strong>
                <select
                  aria-label={`Role for ${u.firstName}`}
                  value={u.role}
                  disabled={busyId === u.id}
                  onChange={(e) => void handleRoleChange(u.id, e.target.value)}
                >
                  {[...ROLE_OPTIONS, u.role as (typeof ROLE_OPTIONS)[number]]
                    .filter((role, index, arr) => arr.indexOf(role) === index)
                    .map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                </select>
                <span
                  className={`${styles.badge} ${
                    u.verificationStatus === "VERIFIED"
                      ? styles.toneSuccess
                      : u.verificationStatus === "REJECTED"
                        ? styles.toneDanger
                        : styles.toneWarning
                  }`}
                >
                  {u.verificationStatus}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busyId === u.id}
                  onClick={() =>
                    void handleSuspend(u.id, `${u.firstName} ${u.lastName}`)
                  }
                >
                  <ShieldBan size={14} /> Suspend
                </Button>
              </div>
            ))}
          </section>
        ) : (
          <EmptyState title="No users found" description="Try another search." />
        )}
      </div>
    </main>
  );
}
