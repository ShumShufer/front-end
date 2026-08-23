import { type FormEvent, useEffect, useMemo } from "react";
import {
  GraduationCap,
  MapPin,
  Plus,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { Input } from "../../../components/Form/Input.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { SchoolsMap } from "../../../components/Map/SchoolsMap.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useSchool } from "../../../context/school/useSchool.ts";
import { useUser } from "../../../context/user/useUser.ts";
import { ApplicationStatus, Role } from "../../../types/common.types.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./SchoolAdminWorkspace.module.css";

type WorkspaceView =
  | "dashboard"
  | "profile"
  | "branches"
  | "classrooms"
  | "posts"
  | "applications"
  | "educationHeads";
const roleNames: Record<Role, string> = {
  ADMIN: "Administrator",
  EDUCATION_HEAD: "Education head",
  MENTOR: "Mentor",
  STUDENT: "Student",
  SUPER_ADMIN: "Platform administrator",
};

export function SchoolAdminWorkspace({ view }: { view: WorkspaceView }) {
  const { user } = useAuth();
  const schoolId = user?.schoolId || "";
  const school = useSchool();
  const userStore = useUser();
  const {
    loadSchoolById,
    loadBranches,
    loadClassrooms,
    loadStaffPosts,
    loadStaffApplications,
    loadClassroomMentors,
  } = school;
  const { loadUsers } = userStore;
  useEffect(() => {
    if (!schoolId) return;
    void loadSchoolById(schoolId);
    void loadBranches(schoolId);
    void loadClassrooms(schoolId);
    void loadStaffPosts(schoolId);
    void loadStaffApplications({ schoolId });
    void loadUsers();
  }, [
    schoolId,
    loadSchoolById,
    loadBranches,
    loadClassrooms,
    loadStaffPosts,
    loadStaffApplications,
    loadUsers,
  ]);
  useEffect(() => {
    school.classrooms.forEach((item) => void loadClassroomMentors(item.id));
  }, [school.classrooms, loadClassroomMentors]);
  const users = userStore.users?.data || [];
  const mentors = users.filter(
    (item) => item.schoolId === schoolId && item.role === Role.MENTOR,
  );
  const heads = users.filter(
    (item) => item.schoolId === schoolId && item.role === Role.EDUCATION_HEAD,
  );
  const linkedMentors = useMemo(
    () =>
      new Map(
        school.classroomMentors.map((link) => [
          link.classroomId,
          link.mentorId,
        ]),
      ),
    [school.classroomMentors],
  );
  const userName = (id: string) => {
    const found = users.find((item) => item.id === id);
    return found ? `${found.firstName} ${found.lastName}` : "Applicant";
  };
  const submit =
    (action: (data: FormData) => Promise<void>) =>
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await action(new FormData(event.currentTarget));
      event.currentTarget.reset();
    };
  const title: Record<WorkspaceView, string> = {
    dashboard: "School control room",
    profile: "School profile",
    branches: "Branch management",
    classrooms: "Classrooms",
    posts: "Staff openings",
    applications: "Staff applications",
    educationHeads: "Education heads",
  };
  if (!schoolId) return null;
  const loading = school.isLoading || userStore.isLoading;
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>
              ShumShufer / {school.activeSchool?.name || "School workspace"}
            </p>
            <h1>{title[view]}</h1>
          </div>
          {school.error && <span className={styles.error}>{school.error}</span>}
        </header>
        {loading && !school.activeSchool ? (
          <PageSkeleton
            variant={view === "dashboard" ? "dashboard" : "admin"}
          />
        ) : (
          <>
            {view === "dashboard" && (
              <section className={styles.dashboard}>
                <div className={styles.metrics}>
                  <Metric label="Mentors" value={String(mentors.length)} />
                  <Metric
                    label="Classrooms"
                    value={String(school.classrooms.length)}
                  />
                  <Metric
                    label="Branches"
                    value={String(school.branches.length)}
                  />
                  <Metric
                    label="Open roles"
                    value={String(
                      school.staffPosts.filter((post) => post.status === "OPEN")
                        .length,
                    )}
                  />
                </div>
                <div className={styles.grid}>
                  <section className={styles.card}>
                    <h2>Run the next school action</h2>
                    <div className={styles.actionList}>
                      <Link to={ROUTES.admin.classrooms}>
                        <GraduationCap size={18} /> Create a classroom and
                        assign a mentor
                      </Link>
                      <Link to={ROUTES.admin.branches}>
                        <MapPin size={18} /> Keep branch locations current
                      </Link>
                      <Link to={ROUTES.admin.staffPosts}>
                        <Users size={18} /> Open a staff role
                      </Link>
                    </div>
                  </section>
                  <section className={styles.card}>
                    <h2>Branch coverage</h2>
                    <SchoolsMap
                      schools={school.activeSchool ? [school.activeSchool] : []}
                      branches={school.branches}
                      variant="profile"
                    />
                  </section>
                </div>
              </section>
            )}
            {view === "profile" && (
              <form
                className={styles.formCard}
                onSubmit={submit(async (data) =>
                  school.updateSchoolInfo(schoolId, {
                    name: String(data.get("name") || ""),
                    description: String(data.get("description") || ""),
                  }),
                )}
              >
                <Input
                  name="name"
                  label="School name"
                  defaultValue={school.activeSchool?.name}
                  required
                />
                <label className={styles.textField}>
                  Description
                  <textarea
                    name="description"
                    defaultValue={school.activeSchool?.description || ""}
                  />
                </label>
                <Button type="submit">Save school profile</Button>
              </form>
            )}
            {view === "branches" && (
              <section className={styles.grid}>
                <form
                  className={styles.formCard}
                  onSubmit={submit(async (data) =>
                    school.addBranch(schoolId, {
                      name: String(data.get("name") || ""),
                      address: String(data.get("address") || ""),
                      latitude: Number(data.get("latitude")),
                      longitude: Number(data.get("longitude")),
                    }),
                  )}
                >
                  <h2>Add Addis Ababa branch</h2>
                  <Input name="name" label="Branch name" required />
                  <Input name="address" label="Address" required />
                  <div className={styles.twoCol}>
                    <Input
                      name="latitude"
                      label="Latitude"
                      type="number"
                      step="any"
                      defaultValue="9.03"
                      required
                    />
                    <Input
                      name="longitude"
                      label="Longitude"
                      type="number"
                      step="any"
                      defaultValue="38.74"
                      required
                    />
                  </div>
                  <Button type="submit">
                    <Plus size={16} /> Add branch
                  </Button>
                </form>
                <section className={styles.card}>
                  <SchoolsMap
                    schools={school.activeSchool ? [school.activeSchool] : []}
                    branches={school.branches}
                    variant="profile"
                  />
                </section>
                <section className={styles.listCard}>
                  {school.branches.length ? (
                    school.branches.map((branch) => (
                      <article key={branch.id} className={styles.row}>
                        <div>
                          <strong>{branch.name}</strong>
                          <span>{branch.address}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void school.removeBranch(branch.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </article>
                    ))
                  ) : (
                    <EmptyState
                      title="No branches yet"
                      description="Add your first Addis Ababa branch to make it visible to students."
                    />
                  )}
                </section>
              </section>
            )}
            {view === "classrooms" && (
              <section className={styles.grid}>
                <form
                  className={styles.formCard}
                  onSubmit={submit(async (data) =>
                    school.addClassroom(
                      schoolId,
                      String(data.get("name") || ""),
                    ),
                  )}
                >
                  <h2>Create a classroom</h2>
                  <Input
                    name="name"
                    label="Classroom name"
                    placeholder="e.g. June weekday theory"
                    required
                  />
                  <Button type="submit">
                    <Plus size={16} /> Create classroom
                  </Button>
                </form>
                <section className={styles.listCard}>
                  {school.classrooms.length ? (
                    school.classrooms.map((classroom) => {
                      const currentMentor = linkedMentors.get(classroom.id);
                      return (
                        <article
                          key={classroom.id}
                          className={styles.classroom}
                        >
                          <div>
                            <strong>{classroom.name}</strong>
                            <span>
                              {currentMentor
                                ? `Mentor: ${userName(currentMentor)}`
                                : "No mentor assigned"}
                            </span>
                          </div>
                          <div className={styles.inlineAction}>
                            {!currentMentor && (
                              <form
                                onSubmit={submit(async (data) =>
                                  school.assignClassroomMentor(
                                    classroom.id,
                                    String(data.get("mentorId") || ""),
                                  ),
                                )}
                              >
                                <select name="mentorId" defaultValue="">
                                  <option value="">Assign mentor</option>
                                  {mentors.map((mentor) => (
                                    <option key={mentor.id} value={mentor.id}>
                                      {mentor.firstName} {mentor.lastName}
                                    </option>
                                  ))}
                                </select>
                                <Button size="sm" type="submit">
                                  Assign
                                </Button>
                              </form>
                            )}
                            {currentMentor && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  void school.removeClassroomMentor(
                                    classroom.id,
                                    currentMentor,
                                  )
                                }
                              >
                                <X size={16} /> Remove mentor
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                void school.removeClassroom(classroom.id)
                              }
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <EmptyState
                      title="No classrooms yet"
                      description="Create a classroom, then assign a mentor to begin delivery."
                    />
                  )}
                </section>
              </section>
            )}
            {view === "posts" && (
              <section className={styles.grid}>
                <form
                  className={styles.formCard}
                  onSubmit={submit(async (data) =>
                    school.addStaffPost(
                      schoolId,
                      String(data.get("role")) as Role,
                      String(data.get("description") || ""),
                    ),
                  )}
                >
                  <h2>Post an opening</h2>
                  <label className={styles.textField}>
                    Role
                    <select name="role" defaultValue={Role.MENTOR}>
                      <option value={Role.MENTOR}>Mentor</option>
                      <option value={Role.EDUCATION_HEAD}>
                        Education head
                      </option>
                    </select>
                  </label>
                  <label className={styles.textField}>
                    Role description
                    <textarea name="description" required />
                  </label>
                  <Button type="submit">
                    <Plus size={16} /> Publish opening
                  </Button>
                </form>
                <section className={styles.listCard}>
                  {school.staffPosts.length ? (
                    school.staffPosts.map((post) => (
                      <article key={post.id} className={styles.row}>
                        <div>
                          <strong>{roleNames[post.role]}</strong>
                          <span>{post.description}</span>
                        </div>
                        <div className={styles.inlineAction}>
                          <span className={styles.badge}>{post.status}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void school.removeStaffPost(post.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <EmptyState
                      title="No open staff roles"
                      description="Publish an opening to start receiving staff applications."
                    />
                  )}
                </section>
              </section>
            )}
            {view === "applications" && (
              <section className={styles.listCard}>
                {school.staffApplications.length ? (
                  school.staffApplications.map((application) => (
                    <article key={application.id} className={styles.row}>
                      <div>
                        <strong>{userName(application.applicantId)}</strong>
                        <span>
                          Applied for{" "}
                          {
                            roleNames[
                              school.staffPosts.find(
                                (post) => post.id === application.postId,
                              )?.role || Role.MENTOR
                            ]
                          }
                        </span>
                      </div>
                      <div className={styles.inlineAction}>
                        <span className={styles.badge}>
                          {application.status}
                        </span>
                        {application.status === ApplicationStatus.PENDING && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                void school.updateStaffApplication(
                                  application.id,
                                  ApplicationStatus.ACCEPTED,
                                )
                              }
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                void school.updateStaffApplication(
                                  application.id,
                                  ApplicationStatus.REJECTED,
                                )
                              }
                            >
                              Decline
                            </Button>
                          </>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <EmptyState
                    title="No staff applications"
                    description="Applications for your published openings will appear here."
                  />
                )}
              </section>
            )}
            {view === "educationHeads" && (
              <section className={styles.grid}>
                <section className={styles.listCard}>
                  <h2>Assigned education heads</h2>
                  {heads.length ? (
                    heads.map((head) => (
                      <article key={head.id} className={styles.row}>
                        <div>
                          <strong>
                            {head.firstName} {head.lastName}
                          </strong>
                          <span>{head.email}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            void school.removeEducationHead(schoolId, head.id)
                          }
                        >
                          <X size={16} /> Remove
                        </Button>
                      </article>
                    ))
                  ) : (
                    <EmptyState
                      title="No education head assigned"
                      description="Promote an eligible mentor to oversee delivery."
                    />
                  )}
                </section>
                <section className={styles.listCard}>
                  <h2>Eligible mentors</h2>
                  {mentors.map((mentor) => (
                    <article key={mentor.id} className={styles.row}>
                      <div>
                        <strong>
                          {mentor.firstName} {mentor.lastName}
                        </strong>
                        <span>{mentor.email}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          void school.assignEducationHead(schoolId, mentor.id)
                        }
                      >
                        <UserCheck size={16} /> Assign
                      </Button>
                    </article>
                  ))}
                </section>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className={styles.metric}>
      <strong>{value}</strong>
      <p>{label}</p>
    </article>
  );
}
