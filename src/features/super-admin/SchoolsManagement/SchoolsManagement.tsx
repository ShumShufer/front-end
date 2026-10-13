import { useEffect, useMemo, useState } from "react";
import { Building2, CheckCircle2, PauseCircle, Plus, Search } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useSchool } from "../../../context/school/useSchool.ts";
import { Role } from "../../../types/common.types.ts";
import { schoolService } from "../../../services/schoolService.ts";
import { userService } from "../../../services/userService.ts";
import styles from "./SchoolsManagement.module.css";

const STATUS_ACTIVE = "ACTIVE";
const STATUS_SUSPENDED = "SUSPENDED";
const STATUS_PENDING = "PENDING";

interface SchoolDraft {
  name: string;
  description: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
}

const EMPTY_DRAFT: SchoolDraft = {
  name: "",
  description: "",
  adminFirstName: "",
  adminLastName: "",
  adminEmail: "",
};

export function SchoolsManagement() {
  const school = useSchool();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [draft, setDraft] = useState<SchoolDraft>(EMPTY_DRAFT);
  const [createError, setCreateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    void school.loadSchools(
      statusFilter ? { status: statusFilter } : undefined,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const schools = useMemo(() => {
    const all = school.schools?.data ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return all;
    return all.filter((s) => s.name.toLowerCase().includes(query));
  }, [school.schools, search]);

  async function handleCreateSchool(event: React.FormEvent) {
    event.preventDefault();
    setCreateError(null);
    setSuccessMessage(null);
    const email = draft.adminEmail.trim().toLowerCase();
    if (draft.name.trim().length < 3) {
      setCreateError("The school name must be at least 3 characters.");
      return;
    }
    if (!draft.adminFirstName.trim() || !draft.adminLastName.trim()) {
      setCreateError("The school admin needs a first and last name.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setCreateError("Enter a valid email address for the admin.");
      return;
    }
    setIsCreating(true);
    try {
      // A school cannot exist without an admin, so the two records are
      // created together; if the admin step fails we say so explicitly.
      const createdSchool = await schoolService.createSchool({
        name: draft.name,
        description: draft.description || null,
      });
      try {
        await userService.createUser({
          email,
          firstName: draft.adminFirstName,
          lastName: draft.adminLastName,
          role: Role.ADMIN,
          schoolId: createdSchool.id,
        });
      } catch (adminError) {
        setCreateError(
          adminError instanceof Error
            ? `School "${createdSchool.name}" was created, but the admin could not be added: ${adminError.message}`
            : "The school was created but the admin could not be added.",
        );
        await school.loadSchools(statusFilter ? { status: statusFilter } : undefined);
        return;
      }
      await school.loadSchools(statusFilter ? { status: statusFilter } : undefined);
      setSuccessMessage(
        `${createdSchool.name} is ready — its admin account was created and linked.`,
      );
      setDraft(EMPTY_DRAFT);
      setShowCreateForm(false);
    } catch {
      setCreateError("The school could not be created. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  function updateDraft(patch: Partial<SchoolDraft>) {
    setDraft((d) => ({ ...d, ...patch }));
  }

  async function handleStatus(schoolId: string, name: string, status: string) {
    const verb =
      status === STATUS_ACTIVE ? "approve" : `set ${name} to ${status}`;
    if (status === STATUS_SUSPENDED && !window.confirm(`Suspend ${name}?`))
      return;
    setActionError(null);
    setBusyId(schoolId);
    try {
      await school.updateSchoolInfo(schoolId, { status });
      await school.loadSchools(statusFilter ? { status: statusFilter } : undefined);
    } catch {
      setActionError(`Could not ${verb}. Please try again.`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <Building2 size={14} /> Schools
          </p>
          <h1>Schools management</h1>
        </header>

        <div className={styles.controls}>
          <label className={styles.searchBox}>
            <Search size={16} />
            <input
              value={search}
              placeholder="Search schools…"
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {[STATUS_ACTIVE, STATUS_PENDING, STATUS_SUSPENDED].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button onClick={() => setShowCreateForm((open) => !open)}>
            <Plus size={16} />
            {showCreateForm ? "Close form" : "Create school"}
          </Button>
        </div>

        {showCreateForm && (
          <form
            className={styles.createForm}
            onSubmit={(e) => void handleCreateSchool(e)}
          >
            <h2>New school</h2>
            <span className={styles.createHint}>
              Every school needs one admin account — both are created together.
            </span>
            <div className={styles.createGrid}>
              <label>
                School name *
                <input
                  value={draft.name}
                  placeholder="e.g. Addis Driving Academy"
                  onChange={(e) => updateDraft({ name: e.target.value })}
                />
              </label>
              <label>
                Description
                <input
                  value={draft.description}
                  placeholder="Shown on the school's public profile"
                  onChange={(e) => updateDraft({ description: e.target.value })}
                />
              </label>
              <label>
                Admin first name *
                <input
                  value={draft.adminFirstName}
                  onChange={(e) =>
                    updateDraft({ adminFirstName: e.target.value })
                  }
                />
              </label>
              <label>
                Admin last name *
                <input
                  value={draft.adminLastName}
                  onChange={(e) =>
                    updateDraft({ adminLastName: e.target.value })
                  }
                />
              </label>
              <label>
                Admin email *
                <input
                  type="email"
                  value={draft.adminEmail}
                  placeholder="admin@school.et"
                  onChange={(e) => updateDraft({ adminEmail: e.target.value })}
                />
              </label>
            </div>
            {createError && (
              <p className={styles.formError} role="alert">
                {createError}
              </p>
            )}
            {successMessage && (
              <p className={styles.formSuccess} role="status">
                {successMessage}
              </p>
            )}
            <footer className={styles.createActions}>
              <Button type="submit" disabled={isCreating}>
                <Building2 size={16} />
                {isCreating ? "Creating…" : "Create school + admin"}
              </Button>
            </footer>
          </form>
        )}

        {actionError && (
          <p className={styles.formError} role="alert">
            {actionError}
          </p>
        )}

        {school.isLoading && !school.schools ? (
          <PageSkeleton variant="list" />
        ) : schools.length ? (
          <ul className={styles.list}>
            {schools.map((s) => (
              <li key={s.id} className={styles.item}>
                <div className={styles.itemMain}>
                  <strong>{s.name}</strong>
                  {s.description && <p>{s.description}</p>}
                </div>
                <span className={`${styles.badge} ${styles.toneNeutral}`}>
                  ★ {s.rating.toFixed(1)}
                </span>
                <span
                  className={`${styles.badge} ${
                    s.status === STATUS_ACTIVE
                      ? styles.toneSuccess
                      : s.status === STATUS_PENDING
                        ? styles.toneWarning
                        : styles.toneDanger
                  }`}
                >
                  {s.status}
                </span>
                <div className={styles.itemActions}>
                  {s.status !== STATUS_ACTIVE && (
                    <Button
                      size="sm"
                      disabled={busyId === s.id}
                      onClick={() =>
                        void handleStatus(s.id, s.name, STATUS_ACTIVE)
                      }
                    >
                      <CheckCircle2 size={14} /> Activate
                    </Button>
                  )}
                  {s.status !== STATUS_SUSPENDED && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busyId === s.id}
                      onClick={() =>
                        void handleStatus(s.id, s.name, STATUS_SUSPENDED)
                      }
                    >
                      <PauseCircle size={14} /> Suspend
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No schools found"
            description="Adjust the search or status filter."
          />
        )}
      </div>
    </main>
  );
}
