import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, Star, Search, Filter, BadgeCheck, Users } from "lucide-react";
import { useSchool } from "../../../context/school/useSchool.ts";
import { Button } from "../../../components/Button/Button.tsx";
import { SchoolsMap } from "../../../components/Map/SchoolsMap.tsx";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./DiscoverSchoolsPage.module.css";

interface FilterState {
  searchQuery: string;
  sortBy: "rating" | "name" | "newest";
}

export function DiscoverSchoolsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { schools, branches, loadSchools, loadBranches, isLoading } =
    useSchool();
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: searchParams.get("search") || "",
    sortBy: "rating",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    void loadSchools();
    void loadBranches();
  }, [loadSchools, loadBranches]);

  useEffect(() => {
    if (filters.searchQuery) {
      void loadSchools({ search: filters.searchQuery });
    } else {
      void loadSchools();
    }
  }, [filters.searchQuery, loadSchools]);

  const sortedSchools = useMemo(() => {
    if (!schools?.data) return [];
    const data = [...schools.data];

    switch (filters.sortBy) {
      case "rating":
        return data.sort((a, b) => b.rating - a.rating);
      case "name":
        return data.sort((a, b) => a.name.localeCompare(b.name));
      case "newest":
        return data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      default:
        return data;
    }
  }, [schools?.data, filters.sortBy]);

  const handleSchoolClick = (schoolId: string) => {
    navigate(ROUTES.public.schoolProfile(schoolId));
  };

  const handleFilterChange = (
    key: keyof FilterState,
    value: string | boolean,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={styles.page}>
      {/* Header Section */}
      <section className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Find Your Driving School</h1>
            <p className={styles.subtitle}>
              Discover verified driving schools in Addis Ababa. Compare ratings,
              locations, and book your lessons today.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className={styles.searchBar}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by school name or location..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
            className={styles.searchInput}
          />
          <button
            className={styles.filterButton}
            onClick={() => setShowFilters(!showFilters)}
            title="Toggle filters"
          >
            <Filter size={20} />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Sort by</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className={styles.filterSelect}
              >
                <option value="rating">Highest Rating</option>
                <option value="name">School Name</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        )}
      </section>

      {/* Main Content */}
      <section className={styles.content}>
        <div className={styles.contentGrid}>
          {/* Schools List */}
          <div className={styles.schoolsList}>
            {isLoading ? (
              <div className={styles.loadingState}>Loading schools...</div>
            ) : sortedSchools.length === 0 ? (
              <div className={styles.emptyState}>
                <MapPin size={48} />
                <h3>No schools found</h3>
                <p>Try adjusting your search filters</p>
              </div>
            ) : (
              <div className={styles.schoolsGrid}>
                {sortedSchools.map((school) => (
                  <div key={school.id} className={styles.schoolCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.schoolTitle}>
                        <h3>{school.name}</h3>
                        {school.status === "ACTIVE" && (
                          <span aria-label="Verified school">
                            <BadgeCheck
                              size={16}
                              className={styles.verifiedBadge}
                            />
                          </span>
                        )}
                      </div>
                      <div className={styles.rating}>
                        <Star size={18} className={styles.starIcon} />
                        <span>{school.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <p className={styles.description}>{school.description}</p>

                    <div className={styles.cardMeta}>
                      <div className={styles.metaItem}>
                        <MapPin size={16} />
                        <span>
                          {branches?.filter((b) => b.schoolId === school.id)
                            .length || 0}{" "}
                          branches
                        </span>
                      </div>
                      <div className={styles.metaItem}>
                        <Users size={16} />
                        <span>Est. 500+ students</span>
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      <Button
                        variant="primary"
                        size="sm"
                        block
                        onClick={() => handleSchoolClick(school.id)}
                      >
                        View Details
                      </Button>
                      <Button variant="secondary" size="sm" block>
                        Enroll Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map Sidebar */}
          <div className={styles.mapSidebar}>
            <div className={styles.mapContainer}>
              <SchoolsMap schools={sortedSchools} branches={branches || []} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
