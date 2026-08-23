import { type ReactNode, useCallback, useReducer } from "react";
import { scheduleService } from "../../services/scheduleService.ts";
import type { ScheduleEvent } from "../../types/classroom.types.ts";
import type { Role } from "../../types/common.types.ts";
import { getErrorMessage } from "../../utils/errors.ts";
import { ScheduleContext } from "./ScheduleContext.tsx";
type State = {
  schoolEvents: ScheduleEvent[];
  classroomEvents: ScheduleEvent[];
  isLoading: boolean;
  error: string | null;
};
type Action =
  | { type: "start" }
  | { type: "school"; events: ScheduleEvent[] }
  | { type: "classroom"; events: ScheduleEvent[] }
  | { type: "add"; event: ScheduleEvent }
  | { type: "update"; event: ScheduleEvent }
  | { type: "remove"; id: string }
  | { type: "error"; error: string };
function reducer(state: State, action: Action): State {
  if (action.type === "start")
    return { ...state, isLoading: true, error: null };
  if (action.type === "school")
    return { ...state, isLoading: false, schoolEvents: action.events };
  if (action.type === "classroom")
    return { ...state, isLoading: false, classroomEvents: action.events };
  if (action.type === "add")
    return {
      ...state,
      isLoading: false,
      schoolEvents: action.event.schoolId
        ? [...state.schoolEvents, action.event]
        : state.schoolEvents,
      classroomEvents: action.event.classroomId
        ? [...state.classroomEvents, action.event]
        : state.classroomEvents,
    };
  if (action.type === "update")
    return {
      ...state,
      isLoading: false,
      schoolEvents: state.schoolEvents.map((item) =>
        item.id === action.event.id ? action.event : item,
      ),
      classroomEvents: state.classroomEvents.map((item) =>
        item.id === action.event.id ? action.event : item,
      ),
    };
  if (action.type === "remove")
    return {
      ...state,
      isLoading: false,
      schoolEvents: state.schoolEvents.filter((item) => item.id !== action.id),
      classroomEvents: state.classroomEvents.filter(
        (item) => item.id !== action.id,
      ),
    };
  return { ...state, isLoading: false, error: action.error };
}
export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    schoolEvents: [],
    classroomEvents: [],
    isLoading: false,
    error: null,
  });
  const run = useCallback(async (operation: () => Promise<void>) => {
    dispatch({ type: "start" });
    try {
      await operation();
    } catch (error) {
      dispatch({
        type: "error",
        error: getErrorMessage(error, "Schedule action failed"),
      });
      throw error;
    }
  }, []);
  const loadSchoolEvents = useCallback(
    (schoolId: string) =>
      run(async () =>
        dispatch({
          type: "school",
          events: await scheduleService.getSchoolEvents(schoolId),
        }),
      ),
    [run],
  );
  const loadClassroomEvents = useCallback(
    (classroomId: string) =>
      run(async () =>
        dispatch({
          type: "classroom",
          events: await scheduleService.getClassroomEvents(classroomId),
        }),
      ),
    [run],
  );
  const createEvent = useCallback(
    (data: Omit<ScheduleEvent, "id">) =>
      run(async () =>
        dispatch({
          type: "add",
          event: await scheduleService.createEvent(data),
        }),
      ),
    [run],
  );
  const updateEvent = useCallback(
    (id: string, role: Role, data: Partial<ScheduleEvent>) =>
      run(async () =>
        dispatch({
          type: "update",
          event: await scheduleService.updateEvent(id, role, data),
        }),
      ),
    [run],
  );
  const deleteEvent = useCallback(
    (id: string, role: Role) =>
      run(async () => {
        await scheduleService.deleteEvent(id, role);
        dispatch({ type: "remove", id });
      }),
    [run],
  );
  return (
    <ScheduleContext.Provider
      value={{
        ...state,
        loadSchoolEvents,
        loadClassroomEvents,
        createEvent,
        updateEvent,
        deleteEvent,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}
