import { useEffect, useMemo, useState } from "react";
import { Search, ShieldAlert, UserPlus } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useSchool } from "../../../context/school/useSchool.ts";
import { useUser } from "../../../context/user/useUser.ts";
import { Role } from "../../../types/common.types.ts";
import styles from "./AdminManagement.module.css";

export function AdminManagement() {
  const userCtx = useUser();
  const school = useSchool();
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    void userCtx.loadUsers({ role: Role.ADMIN });
    void school.loadSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const admins = useMemo(() => {
    const all = (userCtx.users?.data ?? []).filter(
      (u) => u.role === Role.ADMIN,
    );
    const query = search.trim().toLowerCase();
    if (!query) return all;
    return all.filter((u) =>
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(query),
    );
  }, [userCtx.users, search]);

  async function handleMoveToSchool(userId: string, name: string) {
    const target = school.schools?.data[0];
    if (!target) {
      setActionError("No school is available to assign this admin to.");
      return;
    }
    setActionError(null);
    setSuccessMessage(null);
    setBusyId(userId);
    try {
      await userCtx.updateUser(userId, { schoolId: target.id });
      setSuccessMessage(`${name} is now linked to ${target.name}.`);
      await userCtx.loadUsers({ role: Role.ADMIN });
    } catch {
      setActionError("The assignment could not be saved. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <ShieldAlert size={14} /> Administration
          </p>
          <h1>School admins</h1>
          <span>Accounts holding the ADMIN role across the platform.</span>
        </header>

        <label className={styles.searchBox}>
          <Search size={16} />
          <input
            value={search}
            placeholder="Search admins…"
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        {(actionError || userCtx.error) && (
          <p className={styles.formError} role="alert">
            {actionError ?? userCtx.error}
          </p>
        )}
        {successMessage && (
          <p className={styles.formSuccess} role="status">
            {successMessage}
          </p>
        )}

        {userCtx.isLoading && !userCtx.users ? (
          <PageSkeleton variant="list" />
        ) : admins.length ? (
          <ul className={styles.list}>
            {admins.map((admin) => (
              <li key={admin.id} className={styles.item}>
                <div className={styles.itemMain}>
                  <strong>
                    {admin.firstName} {admin.lastName}
                  </strong>
                  <small>{admin.email}</small>
                </div>
                <span className={`${styles.badge} ${admin.schoolId ? styles.toneSuccess : styles.toneWarning}`}>
                  {admin.schoolId ? "School-linked" : "Unassigned"}
                </span>
                {!admin.schoolId && (
                  <Button
                    size="sm"
                    disabled={busyId === admin.id}
                    onClick={() =>
                      void handleMoveToSchool(
                        admin.id,
                        `${admin.firstName} ${admin.lastName}`,
                      )
                    }
                  >
                    <UserPlus size={14} /> Link first school
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No admins found"
            description="No accounts currently hold the ADMIN role."
          />
        )}
      </div>
    </main>
  );
}
