import { useEffect, useState } from "react";
import { GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useSchool } from "../../../context/school/useSchool.ts";
import styles from "./ApplicationFormBuilder.module.css";

const FIELD_TYPES = ["text", "number", "date", "select"] as const;
type FieldType = (typeof FIELD_TYPES)[number];

interface DraftField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options: string;
}

interface TemplateField {
  key: string;
  label: string;
  type: string;
  required: boolean;
}

const SELECT_OPTIONS_PLACEHOLDER = "Option A, Option B, Option C";

function toDraft(field: TemplateField): DraftField {
  return {
    key: field.key,
    label: field.label,
    type: (FIELD_TYPES as readonly string[]).includes(field.type)
      ? (field.type as FieldType)
      : "text",
    required: field.required,
    options: "",
  };
}

export function ApplicationFormBuilder() {
  const { user } = useAuth();
  const school = useSchool();
  const schoolId = user?.schoolId ?? "";

  useEffect(() => {
    if (!schoolId) return;
    void school.loadApplicationForm(schoolId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  if (school.isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <header className={styles.header}>
            <p>Enrollment</p>
            <h1>Student application form</h1>
            <span>
              Applicants fill these fields when they apply to your school.
            </span>
          </header>
          <PageSkeleton variant="list" />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>Enrollment</p>
          <h1>Student application form</h1>
          <span>
            Applicants fill these fields when they apply to your school.
          </span>
        </header>
        <FieldsEditor
          key={schoolId}
          schoolId={schoolId}
          initialFields={school.applicationForm}
        />
      </div>
    </main>
  );
}

function FieldsEditor({
  schoolId,
  initialFields,
}: {
  schoolId: string;
  initialFields: TemplateField[];
}) {
  const school = useSchool();
  const [drafts, setDrafts] = useState<DraftField[]>(() =>
    initialFields.map(toDraft),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function updateDraft(index: number, patch: Partial<DraftField>) {
    setDrafts((ds) => ds.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    for (const draft of drafts) {
      if (!draft.label.trim()) {
        setFormError("Every field needs a label.");
        return;
      }
      if (draft.type === "select" && !draft.options.trim()) {
        setFormError(`Field "${draft.label}" needs at least one option.`);
        return;
      }
    }
    setIsSaving(true);
    try {
      await school.saveApplicationForm(
        schoolId,
        drafts.map((draft) => ({
          key:
            draft.key ||
            `field_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          label: draft.label.trim(),
          type: draft.type,
          required: draft.required,
          ...(draft.type === "select"
            ? { options: draft.options.split(",").map((o) => o.trim()).filter(Boolean) }
            : {}),
        })),
      );
      setSuccessMessage("Application form saved.");
    } catch {
      setFormError("The form could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={(e) => void handleSave(e)}>
      {drafts.map((draft, index) => (
        <article key={index} className={styles.fieldCard}>
          <GripVertical size={16} className={styles.grip} />
          <div className={styles.fieldGrid}>
            <input
              aria-label="Label"
              value={draft.label}
              placeholder="e.g. Blood type"
              onChange={(e) => updateDraft(index, { label: e.target.value })}
            />
            <select
              aria-label="Type"
              value={draft.type}
              onChange={(e) =>
                updateDraft(index, { type: e.target.value as FieldType })
              }
            >
              {FIELD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {draft.type === "select" && (
              <input
                className={styles.optionsInput}
                value={draft.options}
                placeholder={SELECT_OPTIONS_PLACEHOLDER}
                onChange={(e) =>
                  updateDraft(index, { options: e.target.value })
                }
              />
            )}
          </div>
          <label className={styles.requiredToggle}>
            <input
              type="checkbox"
              checked={draft.required}
              onChange={(e) =>
                updateDraft(index, { required: e.target.checked })
              }
            />
            Required
          </label>
          <button
            type="button"
            aria-label={`Remove field ${index + 1}`}
            onClick={() => setDrafts((ds) => ds.filter((_, i) => i !== index))}
          >
            <Trash2 size={15} />
          </button>
        </article>
      ))}

      <button
        type="button"
        className={styles.addField}
        onClick={() =>
          setDrafts((ds) => [
            ...ds,
            {
              key: "",
              label: "",
              type: "text",
              required: false,
              options: "",
            },
          ])
        }
      >
        <Plus size={16} /> Add field
      </button>

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
        <Button type="submit" disabled={isSaving || drafts.length === 0}>
          <Save size={16} />
          {isSaving ? "Saving…" : "Save form"}
        </Button>
      </footer>
    </form>
  );
}
