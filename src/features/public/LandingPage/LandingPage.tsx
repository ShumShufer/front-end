import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Layers,
  Laptop,
  MapPin,
  Search,
  Star,
} from "lucide-react";
import { SchoolProvider } from "../../../context/school/SchoolProvider.tsx";
import { useSchool } from "../../../context/school/useSchool.ts";
import { Button } from "../../../components/Button/Button.tsx";
import { PublicFooter } from "../../../components/Layout/PublicFooter.tsx";
import { CiEthiopianStarIcon } from "../../../components/icons/CustomIcons.tsx";
import { useCountUp } from "../../../hooks/useCountUp.ts";
import { useInView } from "../../../hooks/useInView.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./LandingPage.module.css";

const FALLBACK_SCHOOL_COUNT = 240;
const STUDENTS_ENROLLED = 38000;
const AVG_RATING = 4.7;

const FEATURES = [
  {
    icon: BadgeCheck,
    title: "Verified Schools",
    subtitle: "Trusted academies only",
    description:
      "Every academy on ShumShufer is certified and highly rated — we check credentials so you can pick with confidence.",
    image: "/shumshufer-feature-schools.jpg",
    alt: "Cars and buses moving through Addis Ababa traffic",
  },
  {
    icon: Laptop,
    title: "Online Learning",
    subtitle: "Theory from your phone",
    description:
      "Study the full theory course with lessons and quiz banks, then walk into driving school already ahead.",
    image: "/shumshufer-feature-online.jpg",
    alt: "Ethiopian students learning together in a group discussion",
  },
  {
    icon: Layers,
    title: "All in One",
    subtitle: "Search, book, pay",
    description:
      "Compare schools, book practical lessons and pay with Telebirr, CBE Birr or bank transfer — one platform for the whole journey.",
    image: "/shumshufer-feature-allinone.jpg",
    alt: "Streets of Addis Ababa lined with buildings",
  },
];

interface StatProps {
  value: number;
  suffix?: string;
  label: string;
  decimals?: number;
}

function Stat({ value, suffix, label, decimals = 0 }: StatProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const display = useCountUp(value, { start: inView, decimals });

  return (
    <div ref={ref} className={styles.stat}>
      <div className={styles.statValue}>
        {display}
        {suffix ? <span className={styles.statSuffix}>{suffix}</span> : null}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

interface FeatureCardProps {
  icon: typeof BadgeCheck;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  alt: string;
  index: number;
}

function FeatureCard({
  icon: Icon,
  title,
  subtitle,
  description,
  image,
  alt,
  index,
}: FeatureCardProps) {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <article
      ref={ref}
      className={[
        styles.featureCard,
        index % 2 === 1 ? styles.featureCardReverse : "",
        inView ? styles.featureCardVisible : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.featureMedia}>
        <img src={image} alt={alt} loading="lazy" />
      </div>
      <div className={styles.featureBody}>
        <span className={styles.featureIcon}>
          <Icon size={22} />
        </span>
        <p className={styles.featureSubtitle}>{subtitle}</p>
        <h3 className={styles.featureTitle}>{title}</h3>
        <p className={styles.featureDesc}>{description}</p>
      </div>
    </article>
  );
}

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
      <section className={styles.hero} data-landing-hero="">
        <img
          src="/shumshufer-asset-1.jpg"
          alt="Student learning to drive in Addis Ababa"
          className={styles.heroImage}
        />
        <div className={styles.heroScrim} aria-hidden="true" />

        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>
            <CiEthiopianStarIcon size={16} />
            Ethiopia&apos;s driving school hub
          </p>
          <h1 className={styles.heroTitle}>
            Learn to drive.
            <br />
            <span className={styles.heroAccent}>All in one place.</span>
          </h1>

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
            <Stat
              value={schoolCount > 0 ? schoolCount : FALLBACK_SCHOOL_COUNT}
              suffix="+"
              label="Verified schools"
            />
            <Stat
              value={STUDENTS_ENROLLED}
              suffix="+"
              label="Students enrolled"
            />
            <Stat value={AVG_RATING} decimals={1} label="Avg. school rating" />
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
          <button type="submit" className={styles.searchSubmit}>
            Search
          </button>
        </form>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionEyebrow}>Why choose us</p>
          <h2 className={styles.sectionTitle}>
            Everything you need to become a licensed driver.
          </h2>
          <div className={styles.featureList}>
            {FEATURES.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
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
                    <span className={styles.ratingChip}>
                      <Star size={14} />
                      {school.rating.toFixed(1)}
                    </span>
                    <span className={styles.locationChip}>
                      <MapPin size={14} />
                      Addis Ababa
                    </span>
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
          <div className={styles.ctaGlowOne} aria-hidden="true" />
          <div className={styles.ctaGlowTwo} aria-hidden="true" />
          <div className={styles.ctaCopy}>
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
