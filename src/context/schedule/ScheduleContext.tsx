import { createContext } from "react";
import type { ScheduleEvent } from "../../types/classroom.types.ts";
import type { Role } from "../../types/common.types.ts";
export interface ScheduleContextType {
  schoolEvents: ScheduleEvent[];
  classroomEvents: ScheduleEvent[];
  isLoading: boolean;
  error: string | null;
  loadSchoolEvents: (schoolId: string) => Promise<void>;
  loadClassroomEvents: (classroomId: string) => Promise<void>;
  createEvent: (data: Omit<ScheduleEvent, "id">) => Promise<void>;
  updateEvent: (
    id: string,
    role: Role,
    data: Partial<ScheduleEvent>,
  ) => Promise<void>;
  deleteEvent: (id: string, role: Role) => Promise<void>;
}
export const ScheduleContext = createContext<ScheduleContextType | null>(null);
