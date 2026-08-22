import type { ScheduleEvent } from "../types/classroom.types.ts";
import type { Role } from "../types/common.types.ts";
import type { IScheduleService } from "./interfaces/IScheduleService.ts";
import { mockScheduleEvents } from "./mockData.ts";
import { ROLE_PRIORITY } from "../utils/permissions.ts";

const delay = <T>(value: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), 350));
// Single source of truth for the schedule priority ladder lives in
// utils/permissions.ts so the UI can mirror these server-side checks.
const priority = ROLE_PRIORITY;

class ScheduleService implements IScheduleService {
  async getSchoolEvents(schoolId: string) {
    return delay(
      mockScheduleEvents.filter((event) => event.schoolId === schoolId),
    );
  }
  async getClassroomEvents(classroomId: string) {
    return delay(
      mockScheduleEvents.filter((event) => event.classroomId === classroomId),
    );
  }
  async createEvent(data: Omit<ScheduleEvent, "id">) {
    const starts = new Date(data.startTime).getTime();
    const ends = new Date(data.endTime).getTime();
    const conflicting = mockScheduleEvents.find(
      (event) =>
        event.schoolId === data.schoolId &&
        (event.classroomId === null ||
          event.classroomId === data.classroomId) &&
        starts < new Date(event.endTime).getTime() &&
        ends > new Date(event.startTime).getTime() &&
        priority[event.createdByRole] > priority[data.createdByRole],
    );
    if (conflicting)
      throw new Error(
        `This time is reserved by a higher-priority ${conflicting.createdByRole.replace("_", " ").toLowerCase()} event`,
      );
    const event = { ...data, id: `event-${Date.now()}` };
    mockScheduleEvents.push(event);
    return delay(event);
  }
  async updateEvent(id: string, role: Role, data: Partial<ScheduleEvent>) {
    const index = mockScheduleEvents.findIndex((event) => event.id === id);
    if (index < 0) throw new Error("Schedule event not found");
    if (priority[role] < priority[mockScheduleEvents[index].createdByRole])
      throw new Error(
        "This event is locked by a higher-priority schedule owner",
      );
    mockScheduleEvents[index] = { ...mockScheduleEvents[index], ...data };
    return delay(mockScheduleEvents[index]);
  }
  async deleteEvent(id: string, role: Role) {
    const index = mockScheduleEvents.findIndex((event) => event.id === id);
    if (index < 0) throw new Error("Schedule event not found");
    if (priority[role] < priority[mockScheduleEvents[index].createdByRole])
      throw new Error(
        "This event is locked by a higher-priority schedule owner",
      );
    mockScheduleEvents.splice(index, 1);
    return delay(undefined);
  }
}
export const scheduleService = new ScheduleService();
