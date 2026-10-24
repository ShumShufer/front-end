import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  Plus,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import styles from "../../student/StudentWorkspace/StudentWorkspace.module.css";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useSchool } from "../../../context/school/useSchool.ts";
import { useUI } from "../../../context/ui/useUI.ts";
import { useUser } from "../../../context/user/useUser.ts";
import { Role } from "../../../types/common.types.ts";

export function EducationWorkspace({
  view,
}: {
  view: "dashboard" | "classrooms" | "mentors";
}) {
  const { user } = useAuth();
  const school = useSchool();
  const usersStore = useUser();
  const { showToast } = useUI();
  const schoolId = user?.schoolId || "";
  const [newClassName, setNewClassName] = useState("");
  const { loadClassrooms, loadClassroomMentors } = school;
  const { loadUsers } = usersStore;

  useEffect(() => {
    if (!schoolId) return;
    void loadClassrooms(schoolId);
    void loadUsers();
  }, [schoolId, loadClassrooms, loadUsers]);
  useEffect(() => {
    school.classrooms.forEach((item) => void loadClassroomMentors(item.id));
  }, [school.classrooms, loadClassroomMentors]);

  const users = usersStore.users?.data || [];
  const mentors = users.filter(
    (item) => item.schoolId === schoolId && item.role === Role.MENTOR,
  );
  // Latest assignment per classroom (the store dedupes on assign).
  const assigned = useMemo(
    () =>
      new Map(
        school.classroomMentors.map((link) => [
          link.classroomId,
          link.mentorId,
        ]),
      ),
    [school.classroomMentors],
  );
  if (!user) return null;
  if (school.isLoading || usersStore.isLoading)
    return (
      <PageSkeleton variant={view === "dashboard" ? "dashboard" : "list"} />
    );
  const mentorName = (mentorId: string) => {
    const mentor = users.find((item) => item.id === mentorId);
    return mentor ? `${mentor.firstName} ${mentor.lastName}` : "Assigned mentor";
  };
  const assign =
    (classroomId: string) => async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const selected = String(
        new FormData(event.currentTarget).get("mentorId") || "",
      );
      try {
        await school.assignClassroomMentor(classroomId, selected);
        event.currentTarget.reset();
        showToast("Mentor assigned to the classroom.", "success");
      } catch {
        showToast(school.error || "Could not assign this mentor.", "error");
      }
    };
  const unassign = async (classroomId: string, mentorId: string) => {
    if (!window.confirm("Remove this mentor from the classroom?")) return;
    try {
      await school.removeClassroomMentor(classroomId, mentorId);
      showToast("Mentor removed from the classroom.", "info");
    } catch {
      showToast(school.error || "Could not remove this mentor.", "error");
    }
  };
  const createClassroom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newClassName.trim();
    if (!name) return;
    try {
      await school.addClassroom(schoolId, name);
      setNewClassName("");
      showToast("Classroom created.", "success");
    } catch {
      showToast(school.error || "Could not create the classroom.", "error");
    }
  };

  if (view === "classrooms")
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <h1>All classrooms</h1>
          <form className={styles.inlineForm} onSubmit={(event) => void createClassroom(event)}>
            <input
              value={newClassName}
              onChange={(event) => setNewClassName(event.target.value)}
              placeholder="e.g. Batch 2026 - Evening Theory"
              aria-label="New classroom name"
            />
            <Button type="submit" disabled={!newClassName.trim() || school.isLoading}>
              <Plus size={16} /> Create classroom
            </Button>
          </form>
          {school.classrooms.length ? (
            <div className={styles.grid}>
              {school.classrooms.map((item) => (
                <article key={item.id} className={styles.card}>
                  <GraduationCap size={20} />
                  <h2>{item.name}</h2>
                  <p>
                    {assigned.has(item.id)
                      ? `Mentor: ${mentorName(assigned.get(item.id)!)}`
                      : "Awaiting mentor assignment"}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No classrooms created"
              description="Create your first classroom above to organize cohorts."
            />
          )}
        </div>
      </main>
    );
  if (view === "mentors")
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <h1>Mentor assignments</h1>
          {school.classrooms.length ? (
            <div className={styles.grid}>
              {school.classrooms.map((item) => (
                <article key={item.id} className={styles.card}>
                  <Users size={20} />
                  <h2>{item.name}</h2>
                  {assigned.has(item.id) ? (
                    <>
                      <p>Mentor: {mentorName(assigned.get(item.id)!)}</p>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          void unassign(item.id, assigned.get(item.id)!)
                        }
                        disabled={school.isLoading}
                      >
                        <UserMinus size={15} /> Remove mentor
                      </Button>
                    </>
                  ) : (
                    <form onSubmit={(event) => void assign(item.id)(event)}>
                      <select name="mentorId" defaultValue="" aria-label={`Assign a mentor to ${item.name}`}>
                        <option value="">Choose mentor</option>
                        {mentors.map((mentor) => (
                          <option key={mentor.id} value={mentor.id}>
                            {mentor.firstName} {mentor.lastName}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" size="sm">
                        <UserCheck size={16} /> Assign mentor
                      </Button>
                    </form>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No classrooms to staff"
              description="Create classrooms before assigning mentors."
            />
          )}
        </div>
      </main>
    );
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header>
          <p>Education workspace</p>
          <h1>Oversee delivery across every classroom.</h1>
        </header>
        <div className={styles.grid}>
          <article className={styles.card}>
            <GraduationCap size={20} />
            <h2>{school.classrooms.length} classrooms</h2>
            <p>Monitor class coverage and delivery.</p>
          </article>
          <article className={styles.card}>
            <Users size={20} />
            <h2>{mentors.length} mentors</h2>
            <p>Assign mentors to the right classroom.</p>
          </article>
        </div>
      </div>
    </main>
  );
}
