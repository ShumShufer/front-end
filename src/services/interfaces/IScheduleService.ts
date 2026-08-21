import type { ScheduleEvent } from "../../types/classroom.types.ts";
import type { Role } from "../../types/common.types.ts";

export interface IScheduleService {
  getSchoolEvents(schoolId: string): Promise<ScheduleEvent[]>;
  getClassroomEvents(classroomId: string): Promise<ScheduleEvent[]>;
  createEvent(data: Omit<ScheduleEvent, "id">): Promise<ScheduleEvent>;
  updateEvent(
    id: string,
    role: Role,
    data: Partial<ScheduleEvent>,
  ): Promise<ScheduleEvent>;
  deleteEvent(id: string, role: Role): Promise<void>;
}
