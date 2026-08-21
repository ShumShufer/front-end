import { useEffect } from "react";
import { ArrowLeft, BadgeCheck, MapPin, Navigation, Star } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/Button/Button.tsx";
import { SchoolsMap } from "../../../components/Map/SchoolsMap.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useSchool } from "../../../context/school/useSchool.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./SchoolProfilePage.module.css";

export function SchoolProfilePage() {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    activeSchool,
    branches,
    loadSchoolById,
    loadBranches,
    isLoading,
    error,
  } = useSchool();

  useEffect(() => {
    if (!schoolId) return;
    void loadSchoolById(schoolId);
    void loadBranches(schoolId);
  }, [loadBranches, loadSchoolById, schoolId]);

  const startApplication = () => {
    if (!schoolId) return;
    navigate(user ? ROUTES.student.apply(schoolId) : ROUTES.auth.login, {
      state: { from: ROUTES.student.apply(schoolId) },
    });
  };

  if (isLoading || !activeSchool) {
    return (
      <main className={styles.state}>
        {error ? "We could not find that school." : "Loading school profile…"}
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.inner}>
          <button
            className={styles.back}
            onClick={() => navigate(ROUTES.public.schools)}
          >
            <ArrowLeft size={18} /> Back to discovery
          </button>
          <div className={styles.heroGrid}>
            <div>
              <div className={styles.verified}>
                <BadgeCheck size={16} /> Verified driving school
              </div>
              <h1>{activeSchool.name}</h1>
              <p className={styles.description}>
                {activeSchool.description ||
                  "A verified ShumShufer driving school."}
              </p>
              <div className={styles.metrics}>
                <span>
                  <Star size={17} /> {activeSchool.rating.toFixed(1)} rating
                </span>
                <span>
                  <MapPin size={17} /> {branches.length} Addis Ababa branches
                </span>
              </div>
              <div className={styles.actions}>
                <Button size="lg" onClick={startApplication}>
                  Apply to this school
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() =>
                    document.getElementById("branches")?.scrollIntoView()
                  }
                >
                  View branches
                </Button>
              </div>
            </div>
            <div className={styles.roadCard}>
              <span className={styles.roadLine} />
              <p>From theory to road-ready</p>
              <strong>Learn close to home.</strong>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.content}>
        <div className={styles.inner}>
          <div className={styles.intro}>
            <div>
              <p className={styles.kicker}>School overview</p>
              <h2>Choose the branch that fits your route.</h2>
            </div>
            <p>
              Every location shown below is managed by {activeSchool.name} and
              listed through ShumShufer.
            </p>
          </div>
          <div id="branches" className={styles.branchLayout}>
            <div className={styles.branchList}>
              {branches.map((branch, index) => (
                <article key={branch.id} className={styles.branchCard}>
                  <span className={styles.branchIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{branch.name}</h3>
                    <p>
                      <MapPin size={16} /> {branch.address}
                    </p>
                  </div>
                  <a
                    className={styles.directions}
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.openstreetmap.org/?mlat=${branch.latitude}&mlon=${branch.longitude}#map=16/${branch.latitude}/${branch.longitude}`}
                  >
                    <Navigation size={16} /> Directions
                  </a>
                </article>
              ))}
            </div>
            <SchoolsMap
              schools={[activeSchool]}
              branches={branches}
              variant="profile"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
