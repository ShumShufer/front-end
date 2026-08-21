import { type FormEvent } from "react";
import { BadgeCheck, Building2, Mail, ShieldCheck } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { Input } from "../../../components/Form/Input.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { Role } from "../../../types/common.types.ts";
import styles from "./ProfilePage.module.css";

const roleLabel: Record<Role, string> = {
  STUDENT: "Student driver",
  MENTOR: "Driving mentor",
  EDUCATION_HEAD: "Education head",
  ADMIN: "School administrator",
  SUPER_ADMIN: "Platform administrator",
};

export function ProfilePage() {
  const { user, updateProfile, isLoading, error } = useAuth();
  if (!user) return null;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await updateProfile({
      firstName: String(form.get("firstName") || ""),
      lastName: String(form.get("lastName") || ""),
      phone: String(form.get("phone") || "") || null,
    });
  };
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <section className={styles.header}>
          <div
            className={styles.avatar}
          >{`${user.firstName[0]}${user.lastName[0]}`}</div>
          <div>
            <p className={styles.kicker}>My profile</p>
            <h1>
              {user.firstName} {user.lastName}
            </h1>
            <p>{roleLabel[user.role]}</p>
          </div>
        </section>
        <div className={styles.grid}>
          <form
            className={styles.card}
            onSubmit={(event) => void submit(event)}
          >
            <div className={styles.cardHead}>
              <h2>Personal details</h2>
              {error && <span className={styles.error}>{error}</span>}
            </div>
            <div className={styles.fields}>
              <Input
                name="firstName"
                label="First name"
                defaultValue={user.firstName}
                required
              />
              <Input
                name="lastName"
                label="Last name"
                defaultValue={user.lastName}
                required
              />
              <Input
                name="phone"
                label="Phone number"
                type="tel"
                defaultValue={user.phone || ""}
              />
              <Input
                label="Email address"
                type="email"
                value={user.email}
                readOnly
                icon={<Mail size={17} />}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving…" : "Save changes"}
            </Button>
          </form>
          <aside className={styles.stack}>
            <section className={styles.card}>
              <h2>Account status</h2>
              <div className={styles.status}>
                <BadgeCheck size={20} />
                <div>
                  <strong>Identity verified</strong>
                  <span>Your Fayda check is complete.</span>
                </div>
              </div>
              <div className={styles.status}>
                <ShieldCheck size={20} />
                <div>
                  <strong>{roleLabel[user.role]}</strong>
                  <span>Your access is scoped to your role.</span>
                </div>
              </div>
              {user.schoolId && (
                <div className={styles.status}>
                  <Building2 size={20} />
                  <div>
                    <strong>School workspace</strong>
                    <span>Connected to your assigned school.</span>
                  </div>
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
