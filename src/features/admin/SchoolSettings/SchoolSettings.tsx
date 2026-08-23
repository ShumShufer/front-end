import { useEffect, useState } from "react";
import { Building2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useSchool } from "../../../context/school/useSchool.ts";
import styles from "./SchoolSettings.module.css";

export function SchoolSettings() {
  const { user } = useAuth();
  const school = useSchool();
  const schoolId = user?.schoolId ?? "";

  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId) return;
    void school.loadSchoolById(schoolId);
    void school.loadBranches(schoolId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  const activeSchool = school.activeSchool;

  async function handleAddBranch(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (branchName.trim().length < 2 || !branchAddress.trim()) {
      setFormError("A branch needs a name and an address.");
      return;
    }
    try {
      await school.addBranch(schoolId, {
        name: branchName.trim(),
        address: branchAddress.trim(),
      });
      await school.loadBranches(schoolId);
      setSuccessMessage("Branch added.");
      setBranchName("");
      setBranchAddress("");
    } catch {
      setFormError("The branch could not be added. Please try again.");
    }
  }

  async function handleRemoveBranch(branchId: string, branchNameLabel: string) {
    if (!window.confirm(`Remove the ${branchNameLabel} branch?`)) return;
    setFormError(null);
    try {
      await school.removeBranch(branchId);
      await school.loadBranches(schoolId);
      setSuccessMessage("Branch removed.");
    } catch {
      setFormError("The branch could not be removed. Please try again.");
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <Building2 size={14} /> Settings
          </p>
          <h1>School profile</h1>
        </header>

        {school.isLoading && !activeSchool ? (
          <PageSkeleton variant="dashboard" />
        ) : (
          <>
            {activeSchool && (
              <ProfileForm
                key={activeSchool.id}
                schoolId={schoolId}
                initialName={activeSchool.name}
                initialDescription={activeSchool.description ?? ""}
              />
            )}

            <section className={styles.branchSection}>
              <h2>Branches</h2>
              <form className={styles.branchForm} onSubmit={(e) => void handleAddBranch(e)}>
                <input
                  value={branchName}
                  placeholder="Branch name"
                  onChange={(e) => setBranchName(e.target.value)}
                />
                <input
                  value={branchAddress}
                  placeholder="Branch address"
                  onChange={(e) => setBranchAddress(e.target.value)}
                />
                <Button type="submit">
                  <Plus size={16} /> Add
                </Button>
              </form>
              {school.branches.length ? (
                <ul className={styles.branchList}>
                  {school.branches.map((branch) => (
                    <li key={branch.id}>
                      <div>
                        <strong>{branch.name}</strong>
                        <small>{branch.address}</small>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${branch.name}`}
                        onClick={() =>
                          void handleRemoveBranch(branch.id, branch.name)
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.muted}>No branches yet — your main site is the default.</p>
              )}
            </section>

            {(formError || school.error) && (
              <p className={styles.formError} role="alert">
                {formError ?? school.error}
              </p>
            )}
            {successMessage && (
              <p className={styles.formSuccess} role="status">
                {successMessage}
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

interface ProfileFormProps {
  schoolId: string;
  initialName: string;
  initialDescription: string;
}

function ProfileForm({
  schoolId,
  initialName,
  initialDescription,
}: ProfileFormProps) {
  const school = useSchool();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (name.trim().length < 3) {
      setFormError("The school name must be at least 3 characters.");
      return;
    }
    setIsSaving(true);
    try {
      await school.updateSchoolInfo(schoolId, {
        name: name.trim(),
        description: description.trim() || null,
      });
      setSuccessMessage("School profile updated.");
    } catch {
      setFormError("Changes could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={(e) => void handleSaveProfile(e)}>
      <h2>General</h2>
      <label className={styles.field}>
        <span>School name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className={styles.field}>
        <span>Description</span>
        <input
          value={description}
          placeholder="A short introduction shown on your public profile"
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}
      {successMessage && (
        <p className={styles.formSuccess} role="status">
          {successMessage}
        </p>
      )}
      <footer className={styles.actions}>
        <Button type="submit" disabled={isSaving}>
          <Save size={16} />
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
      </footer>
    </form>
  );
}
