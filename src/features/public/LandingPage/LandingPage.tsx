import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CreditCard,
  MapPin,
  Search,
  Star,
} from "lucide-react";
import { SchoolProvider } from "../../../context/school/SchoolProvider.tsx";
import { useSchool } from "../../../context/school/useSchool.ts";
import { Button } from "../../../components/Button/Button.tsx";
import { PublicFooter } from "../../../components/Layout/PublicFooter.tsx";
import {
  CiEthiopianStarIcon,
  CiSteeringWheelIcon,
} from "../../../components/icons/CustomIcons.tsx";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./LandingPage.module.css";

const FEATURES = [
  {
    icon: BadgeCheck,
    title: "Verified Schools",
    description:
      "We partner only with certified and highly-rated driving academies across Ethiopia to ensure quality education.",
  },
  {
    icon: CalendarDays,
    title: "Easy Booking",
    description:
      "Schedule your theory and practical lessons and manage your timetable effortlessly from your phone.",
  },
  {
    icon: CreditCard,
    title: "Local Payments",
    description:
      "Pay securely using familiar local payment methods — Telebirr, CBE Birr and bank transfer.",
  },
];

function LandingPageContent() {
  const navigate = useNavigate();
  const { schools, loadSchools, isLoading } = useSchool();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    void loadSchools({ status: "ACTIVE" });
  }, [loadSchools]);

  const topSchools = schools?.data.slice(0, 3) ?? [];
  const schoolCount = schools?.meta.total ?? 0;

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    const query = params.toString();
    navigate(
      query ? `${ROUTES.public.schools}?${query}` : ROUTES.public.schools,
    );
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>
              <CiEthiopianStarIcon size={16} />
              Ethiopia&apos;s driving school hub
            </p>
            <h1 className={styles.heroTitle}>
              Learn to drive.
              <br />
              Find a school.
              <br />
              <span className={styles.heroAccent}>All in one place.</span>
            </h1>
            <p className={styles.heroLead}>
              Compare verified driving schools near you, learn the theory online
              with ShumShufer, and book your practical lessons — all from your
              phone.
            </p>

            <div className={styles.heroActions}>
              <Button to={ROUTES.public.schools} size="lg">
                Schools nearby
                <ArrowRight size={18} />
              </Button>
              <Button to={ROUTES.public.courses} variant="secondary" size="lg">
                Learn how to drive
              </Button>
            </div>

            <div className={styles.stats}>
              <div>
                <div className={styles.statValue}>
                  {schoolCount > 0 ? `${schoolCount}+` : "240+"}
                </div>
                <div className={styles.statLabel}>Verified schools</div>
              </div>
              <div>
                <div className={styles.statValue}>38,000+</div>
                <div className={styles.statLabel}>Students enrolled</div>
              </div>
              <div>
                <div className={styles.statValue}>4.7</div>
                <div className={styles.statLabel}>Avg. school rating</div>
              </div>
            </div>
          </div>

          <div className={styles.heroCard}>
            <div className={styles.heroImageWrap}>
              <img
                src="/shumshufer-asset-1.jpg"
                alt="Student learning to drive in Addis Ababa"
                className={styles.heroImage}
              />
              <div className={styles.heroImageOverlay}>
                <span className={styles.heroImageBadge}>
                  <CiSteeringWheelIcon size={14} color="currentColor" />
                  On the road
                </span>
                <p className={styles.heroImageCaption}>
                  Your license journey starts here
                </p>
                <p className={styles.heroImageSub}>
                  Theory, practice, and certification — connected.
                </p>
              </div>
            </div>

            <form className={styles.searchBox} onSubmit={handleSearch}>
              <Search size={18} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search school or location (e.g. Bole)"
                aria-label="Search schools"
              />
              <Button type="submit" size="sm">
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <p className={styles.sectionEyebrow}>Why choose us</p>
        <h2 className={styles.sectionTitle}>
          Everything you need to become a licensed driver.
        </h2>
        <div className={styles.featureGrid}>
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <Icon size={22} />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className={[styles.section, styles.schoolsSection].join(" ")}>
        <div className={styles.schoolsInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionHeaderTitle}>
              Top-rated schools nearby
            </h2>
            <Button
              to={ROUTES.public.schools}
              variant="ghost"
              size="sm"
              className={styles.sectionHeaderLink}
            >
              Browse all
              <ArrowRight size={16} />
            </Button>
          </div>

          {isLoading ? (
            <div className={styles.emptySchools}>Loading schools...</div>
          ) : topSchools.length > 0 ? (
            <div className={styles.schoolGrid}>
              {topSchools.map((school) => (
                <article key={school.id} className={styles.schoolCard}>
                  <div className={styles.schoolBadges}>
                    <span
                      className={[styles.badge, styles.badgeSuccess].join(" ")}
                    >
                      <BadgeCheck size={12} />
                      Verified
                    </span>
                    <span
                      className={[styles.badge, styles.badgeNeutral].join(" ")}
                    >
                      Active
                    </span>
                  </div>
                  <h3 className={styles.schoolName}>{school.name}</h3>
                  <div className={styles.schoolMeta}>
                    <Star size={14} />
                    {school.rating.toFixed(1)}
                    <MapPin size={14} />
                    Addis Ababa
                  </div>
                  <p className={styles.schoolDesc}>{school.description}</p>
                  <Button
                    to={ROUTES.public.schoolProfile(school.id)}
                    variant="tertiary"
                    size="sm"
                    block
                  >
                    View School
                  </Button>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptySchools}>
              No schools found yet. Check back soon.
            </div>
          )}
        </div>
      </section>

      <section className={styles.ctaBand}>
        <div className={styles.ctaInner}>
          <div>
            <p className={styles.ctaEyebrow}>Learn with ShumShufer</p>
            <h3 className={styles.ctaTitle}>
              Start the theory today — no school required yet.
            </h3>
            <p className={styles.ctaDesc}>
              Free traffic-sign lessons and paid full theory + quiz bank, so you
              arrive at driving school already ahead.
            </p>
          </div>
          <Button to={ROUTES.public.courses} size="lg">
            Start Learning
            <ArrowRight size={18} />
          </Button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

export function LandingPage() {
  return (
    <SchoolProvider>
      <LandingPageContent />
    </SchoolProvider>
  );
}
