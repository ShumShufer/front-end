import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  X,
} from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { Input } from "../../../components/Form/Input.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useSchedule } from "../../../context/schedule/useSchedule.ts";
import type { ScheduleEvent } from "../../../types/classroom.types.ts";
import type { Role, ScheduleScope } from "../../../types/common.types.ts";
import styles from "./SchoolCalendar.module.css";

const dateKey = (date: Date) => date.toLocaleDateString("en-CA");
const datetimeInput = (date: Date) =>
  `${dateKey(date)}T${date.toTimeString().slice(0, 5)}`;

export function SchoolCalendar({
  schoolId,
  classroomId,
  role,
  editable = false,
}: {
  schoolId: string;
  classroomId?: string;
  role: Role;
  editable?: boolean;
}) {
  const {
    schoolEvents,
    classroomEvents,
    isLoading,
    error,
    createEvent,
    loadSchoolEvents,
    loadClassroomEvents,
  } = useSchedule();
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false);

  useEffect(() => {
    void loadSchoolEvents(schoolId);
    if (classroomId) void loadClassroomEvents(classroomId);
  }, [schoolId, classroomId, loadSchoolEvents, loadClassroomEvents]);
  const events = useMemo(
    () =>
      [...schoolEvents, ...classroomEvents].sort((first, second) =>
        first.startTime.localeCompare(second.startTime),
      ),
    [schoolEvents, classroomEvents],
  );
  const firstDay = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1,
  );
  const lastDay = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  );
  const cells = Array.from(
    { length: firstDay.getDay() + lastDay.getDate() },
    (_, index) => index - firstDay.getDay() + 1,
  );
  const selectedEvents = events.filter(
    (event) => dateKey(new Date(event.startTime)) === dateKey(selectedDate),
  );
  const monthEvents = events.filter((event) => {
    const date = new Date(event.startTime);
    return (
      date.getFullYear() === visibleMonth.getFullYear() &&
      date.getMonth() === visibleMonth.getMonth()
    );
  });

  const selectDay = (day: number) => {
    const date = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      day,
    );
    setSelectedDate(date);
    setIsDayDialogOpen(true);
  };
  const moveMonth = (direction: number) => {
    const month = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + direction,
      1,
    );
    setVisibleMonth(month);
    setSelectedDate(month);
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await createEvent({
      schoolId,
      classroomId: classroomId || null,
      scope: classroomId
        ? ("CLASSROOM" as ScheduleScope)
        : ("SCHOOL" as ScheduleScope),
      createdByRole: role,
      title: String(form.get("title") || ""),
      startTime: new Date(String(form.get("start") || "")).toISOString(),
      endTime: new Date(String(form.get("end") || "")).toISOString(),
      location: String(form.get("location") || "") || null,
    });
    event.currentTarget.reset();
  };

  if (isLoading) return <PageSkeleton variant="calendar" />;
  return (
    <section className={styles.calendarShell}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>School calendar</p>
          <h1>
            <CalendarDays size={22} />{" "}
            {visibleMonth.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </h1>
        </div>
        <div className={styles.controls}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => moveMonth(-1)}
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setVisibleMonth(
                new Date(today.getFullYear(), today.getMonth(), 1),
              );
              setSelectedDate(today);
            }}
          >
            Today
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => moveMonth(1)}
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </header>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.weekdays}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className={styles.grid}>
        {cells.map((day, index) => {
          if (day < 1)
            return <span className={styles.blankCell} key={`blank-${index}`} />;
          const date = new Date(
            visibleMonth.getFullYear(),
            visibleMonth.getMonth(),
            day,
          );
          const dayEvents = events.filter(
            (event) => dateKey(new Date(event.startTime)) === dateKey(date),
          );
          const isToday = dateKey(date) === dateKey(today);
          const isSelected = dateKey(date) === dateKey(selectedDate);
          return (
            <button
              key={dateKey(date)}
              className={[
                styles.dayCell,
                isToday ? styles.today : "",
                isSelected ? styles.selected : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => selectDay(day)}
            >
              <span className={styles.dayNumber}>{day}</span>
              {dayEvents.slice(0, 3).map((event) => (
                <span key={event.id} className={styles.eventChip}>
                  {event.title}
                </span>
              ))}
              {dayEvents.length > 3 && (
                <span className={styles.moreEvents}>
                  +{dayEvents.length - 3} more
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className={styles.lists}>
        <EventList
          title={`Events on ${selectedDate.toLocaleDateString(undefined, { month: "long", day: "numeric" })}`}
          events={selectedEvents}
          emptyTitle="No events on this day"
          emptyDescription="Choose another date or add a schedule event."
        />{" "}
        <EventList
          title={`Events in ${visibleMonth.toLocaleDateString(undefined, { month: "long" })}`}
          events={monthEvents}
          emptyTitle="No events this month"
          emptyDescription="New events will be displayed in this calendar month."
        />
      </div>
      {isDayDialogOpen && (
        <div
          className={styles.modalLayer}
          role="dialog"
          aria-modal="true"
          aria-label="Day details"
        >
          <section className={styles.modal}>
            <div className={styles.modalHead}>
              <div>
                <p className={styles.kicker}>Day details</p>
                <h2>
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
              </div>
              <button
                className={styles.close}
                onClick={() => setIsDayDialogOpen(false)}
                aria-label="Close day details"
              >
                <X size={18} />
              </button>
            </div>
            <EventList
              title="Scheduled events"
              events={selectedEvents}
              emptyTitle="The day is clear"
              emptyDescription="There are no schedule events on this date."
              compact
            />
            {editable && (
              <form
                className={styles.eventForm}
                onSubmit={(event) => void submit(event)}
              >
                <h3>Add an event</h3>
                <Input name="title" label="Event title" required />
                <Input
                  name="start"
                  label="Starts"
                  type="datetime-local"
                  defaultValue={datetimeInput(selectedDate)}
                  required
                />
                <Input
                  name="end"
                  label="Ends"
                  type="datetime-local"
                  defaultValue={datetimeInput(
                    new Date(selectedDate.getTime() + 60 * 60 * 1000),
                  )}
                  required
                />
                <Input name="location" label="Location" />
                <Button type="submit">
                  <Plus size={16} /> Add to calendar
                </Button>
              </form>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

function EventList({
  title,
  events,
  emptyTitle,
  emptyDescription,
  compact = false,
}: {
  title: string;
  events: ScheduleEvent[];
  emptyTitle: string;
  emptyDescription: string;
  compact?: boolean;
}) {
  return (
    <section
      className={[styles.eventList, compact ? styles.compact : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <h2>{title}</h2>
      {events.length ? (
        <div>
          {events.map((event) => (
            <article className={styles.eventRow} key={event.id}>
              <Clock3 size={16} />
              <div>
                <strong>{event.title}</strong>
                <span>
                  {new Date(event.startTime).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </section>
  );
}
