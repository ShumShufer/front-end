import { type FormEvent, useEffect, useMemo } from "react";
import { GraduationCap, UserCheck, Users } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useSchool } from "../../../context/school/useSchool.ts";
import { useUser } from "../../../context/user/useUser.ts";
import { Role } from "../../../types/common.types.ts";
import styles from "../../student/StudentWorkspace/StudentWorkspace.module.css";

export function EducationWorkspace({
  view,
}: {
  view: "dashboard" | "classrooms" | "mentors";
}) {
  const { user } = useAuth();
  const school = useSchool();
  const usersStore = useUser();
  const schoolId = user?.schoolId || "";
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
  const assign =
    (classroomId: string) => async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const mentorId = String(
        new FormData(event.currentTarget).get("mentorId") || "",
      );
      await school.assignClassroomMentor(classroomId, mentorId);
      event.currentTarget.reset();
    };

  if (view === "classrooms")
    return (
      <main className={styles.page}>
        <h1>All classrooms</h1>
        {school.classrooms.length ? (
          <div className={styles.grid}>
            {school.classrooms.map((item) => (
              <article key={item.id} className={styles.card}>
                <GraduationCap size={20} />
                <h2>{item.name}</h2>
                <p>
                  {assigned.has(item.id)
                    ? "Mentor assigned"
                    : "Awaiting mentor assignment"}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No classrooms created"
            description="The school administrator must create a classroom first."
          />
        )}
      </main>
    );
  if (view === "mentors")
    return (
      <main className={styles.page}>
        <h1>Mentor assignments</h1>
        {school.classrooms.length ? (
          <div className={styles.grid}>
            {school.classrooms.map((item) => (
              <article key={item.id} className={styles.card}>
                <Users size={20} />
                <h2>{item.name}</h2>
                {assigned.has(item.id) ? (
                  <p>Mentor assigned.</p>
                ) : (
                  <form onSubmit={(event) => void assign(item.id)(event)}>
                    <select name="mentorId" defaultValue="">
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
      </main>
    );
  return (
    <main className={styles.page}>
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
    </main>
  );
}
