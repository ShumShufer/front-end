import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { Input } from "../../../components/Form/Input.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useSchedule } from "../../../context/schedule/useSchedule.ts";
import { canManageEvent } from "../../../utils/permissions.ts";
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
    updateEvent,
    deleteEvent,
    loadSchoolEvents,
    loadClassroomEvents,
  } = useSchedule();
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

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
    const payload = {
      title: String(form.get("title") || ""),
      startTime: new Date(String(form.get("start") || "")).toISOString(),
      endTime: new Date(String(form.get("end") || "")).toISOString(),
      location: String(form.get("location") || "") || null,
    };
    if (editingEvent) {
      await updateEvent(editingEvent.id, role, payload);
      setEditingEvent(null);
      event.currentTarget.reset();
      return;
    }
    await createEvent({
      schoolId,
      classroomId: classroomId || null,
      scope: classroomId
        ? ("CLASSROOM" as ScheduleScope)
        : ("SCHOOL" as ScheduleScope),
      createdByRole: role,
      ...payload,
    });
    event.currentTarget.reset();
  };
  const openEdit = (event: ScheduleEvent) => {
    setSelectedDate(new Date(event.startTime));
    setEditingEvent(event);
    setIsDayDialogOpen(true);
  };
  const remove = async (id: string) => {
    if (!window.confirm("Delete this calendar event?")) return;
    try {
      await deleteEvent(id, role);
    } catch {
      // Context records the failure; the inline error explains the lock.
    }
  };
  const closeDialog = () => {
    setIsDayDialogOpen(false);
    setEditingEvent(null);
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
              <span className={styles.eventDots} aria-hidden="true">
                {dayEvents.slice(0, 3).map((event) => (
                  <span key={event.id} className={styles.eventDot} />
                ))}
              </span>
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
          canManage={(event) => editable && canManageEvent(role, event.createdByRole)}
          onEdit={openEdit}
          onDelete={(id) => void remove(id)}
        />{" "}
        <EventList
          title={`Events in ${visibleMonth.toLocaleDateString(undefined, { month: "long" })}`}
          events={monthEvents}
          emptyTitle="No events this month"
          emptyDescription="New events will be displayed in this calendar month."
          canManage={(event) => editable && canManageEvent(role, event.createdByRole)}
          onEdit={openEdit}
          onDelete={(id) => void remove(id)}
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
                onClick={closeDialog}
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
              canManage={(event) => editable && canManageEvent(role, event.createdByRole)}
              onEdit={openEdit}
              onDelete={(id) => void remove(id)}
            />
            {editable && (
              <form
                key={editingEvent?.id ?? "new-event"}
                className={styles.eventForm}
                onSubmit={(event) => void submit(event)}
              >
                <h3>{editingEvent ? "Edit event" : "Add an event"}</h3>
                {editingEvent ? (
                  <p className={styles.editingNote}>
                    Editing “{editingEvent.title}”
                  </p>
                ) : null}
                <Input
                  name="title"
                  label="Event title"
                  required
                  defaultValue={editingEvent?.title ?? ""}
                />
                <Input
                  name="start"
                  label="Starts"
                  type="datetime-local"
                  defaultValue={
                    editingEvent
                      ? datetimeInput(new Date(editingEvent.startTime))
                      : datetimeInput(selectedDate)
                  }
                  required
                />
                <Input
                  name="end"
                  label="Ends"
                  type="datetime-local"
                  defaultValue={
                    editingEvent
                      ? datetimeInput(new Date(editingEvent.endTime))
                      : datetimeInput(
                          new Date(selectedDate.getTime() + 60 * 60 * 1000),
                        )
                  }
                  required
                />
                <Input
                  name="location"
                  label="Location"
                  defaultValue={editingEvent?.location ?? ""}
                />
                <div className={styles.formActions}>
                  <Button type="submit">
                    {editingEvent ? (
                      "Save changes"
                    ) : (
                      <>
                        <Plus size={16} /> Add to calendar
                      </>
                    )}
                  </Button>
                  {editingEvent ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setEditingEvent(null)}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
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
  canManage,
  onEdit,
  onDelete,
}: {
  title: string;
  events: ScheduleEvent[];
  emptyTitle: string;
  emptyDescription: string;
  compact?: boolean;
  canManage?: (event: ScheduleEvent) => boolean;
  onEdit?: (event: ScheduleEvent) => void;
  onDelete?: (id: string) => void;
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
          {events.map((event) => {
            const manageable = canManage?.(event) ?? false;
            return (
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
                {manageable ? (
                  <div className={styles.eventActions}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      aria-label={`Edit ${event.title}`}
                      onClick={() => onEdit?.(event)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className={[styles.iconBtn, styles.iconBtnDanger].join(" ")}
                      aria-label={`Delete ${event.title}`}
                      onClick={() => onDelete?.(event.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </section>
  );
}
