import React, { useReducer, useCallback } from "react";
import { ClassroomContext, type ClassroomState } from "./ClassroomContext.tsx";
import { classroomService } from "../../services/index.ts";
import type {
  Classroom,
  Announcement,
  Resource,
  ScheduleEvent,
  AttendanceRecord,
} from "../../types/classroom.types.ts";
import type { User } from "../../types/user.types.ts";
import { getErrorMessage } from "../../utils/errors.ts";

type ClassroomAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_CLASSROOMS_SUCCESS"; payload: Classroom[] }
  | { type: "FETCH_ACTIVE_CLASSROOM_SUCCESS"; payload: Classroom }
  | { type: "FETCH_STUDENTS_SUCCESS"; payload: User[] }
  | { type: "POST_ANNOUNCEMENT_SUCCESS"; payload: Announcement }
  | { type: "FETCH_ANNOUNCEMENTS_SUCCESS"; payload: Announcement[] }
  | { type: "FETCH_RESOURCES_SUCCESS"; payload: Resource[] }
  | { type: "UPLOAD_RESOURCE_SUCCESS"; payload: Resource }
  | { type: "FETCH_SCHEDULES_SUCCESS"; payload: ScheduleEvent[] }
  | {
      type: "FETCH_ATTENDANCE_SUCCESS";
      payload: { sessions: ClassroomState["attendanceSessions"]; records: AttendanceRecord[] };
    }
  | { type: "OPEN_SESSION_SUCCESS"; payload: ClassroomState["attendanceSessions"] }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "ACTION_SUCCESS" };

function classroomReducer(
  state: ClassroomState,
  action: ClassroomAction,
): ClassroomState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_CLASSROOMS_SUCCESS":
      return { ...state, isLoading: false, classrooms: action.payload };
    case "FETCH_ACTIVE_CLASSROOM_SUCCESS":
      return { ...state, isLoading: false, activeClassroom: action.payload };
    case "FETCH_STUDENTS_SUCCESS":
      return { ...state, isLoading: false, students: action.payload };
    case "POST_ANNOUNCEMENT_SUCCESS":
      return {
        ...state,
        isLoading: false,
        announcements: [action.payload, ...state.announcements],
      };
    case "FETCH_ANNOUNCEMENTS_SUCCESS":
      return { ...state, isLoading: false, announcements: action.payload };
    case "FETCH_RESOURCES_SUCCESS":
      return { ...state, isLoading: false, resources: action.payload };
    case "UPLOAD_RESOURCE_SUCCESS":
      return {
        ...state,
        isLoading: false,
        resources: [...state.resources, action.payload],
      };
    case "FETCH_SCHEDULES_SUCCESS":
      return { ...state, isLoading: false, schedules: action.payload };
    case "FETCH_ATTENDANCE_SUCCESS":
      return {
        ...state,
        isLoading: false,
        attendanceSessions: action.payload.sessions,
        attendanceRecords: action.payload.records,
      };
    case "OPEN_SESSION_SUCCESS":
      return { ...state, isLoading: false, attendanceSessions: action.payload };
    case "ACTION_SUCCESS":
      return { ...state, isLoading: false };
    case "FETCH_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

export const ClassroomProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(classroomReducer, {
    classrooms: [],
    activeClassroom: null,
    students: [],
    announcements: [],
    resources: [],
    schedules: [],
    attendanceSessions: [],
    attendanceRecords: [],
    isLoading: false,
    error: null,
  });

  const loadMentorClassrooms = useCallback(async (mentorId: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await classroomService.listForMentor(mentorId);
      dispatch({ type: "FETCH_CLASSROOMS_SUCCESS", payload: data });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to load classrooms"),
      });
    }
  }, []);

  const loadStudentClassrooms = useCallback(async (studentId: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await classroomService.listForStudent(studentId);
      dispatch({ type: "FETCH_CLASSROOMS_SUCCESS", payload: data });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to load classrooms"),
      });
    }
  }, []);

  const loadClassroomById = useCallback(async (id: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await classroomService.getById(id);
      dispatch({ type: "FETCH_ACTIVE_CLASSROOM_SUCCESS", payload: data });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to load classroom details"),
      });
    }
  }, []);

  const loadStudents = useCallback(async (classroomId: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      const students = await classroomService.getStudents(classroomId);
      dispatch({ type: "FETCH_STUDENTS_SUCCESS", payload: students });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to load the student roster"),
      });
    }
  }, []);

  const postAnnouncement = useCallback(
    async (classroomId: string, data: Partial<Announcement>) => {
      dispatch({ type: "FETCH_START" });
      try {
        const newAnn = await classroomService.createAnnouncement(
          classroomId,
          data,
        );
        dispatch({ type: "POST_ANNOUNCEMENT_SUCCESS", payload: newAnn });
      } catch (error: unknown) {
        dispatch({
          type: "FETCH_ERROR",
          payload: getErrorMessage(error, "Failed to post announcement"),
        });
        throw error;
      }
    },
    [],
  );

  const loadAnnouncements = useCallback(async (classroomId: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      const announcements = await classroomService.getAnnouncements(classroomId);
      dispatch({
        type: "FETCH_ANNOUNCEMENTS_SUCCESS",
        payload: announcements.sort(
          (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
        ),
      });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to load announcements"),
      });
    }
  }, []);

  const loadSchoolAnnouncements = useCallback(async (schoolId: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      const announcements = await classroomService.getSchoolAnnouncements(
        schoolId,
      );
      dispatch({
        type: "FETCH_ANNOUNCEMENTS_SUCCESS",
        payload: announcements.sort(
          (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
        ),
      });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to load announcements"),
      });
    }
  }, []);

  const broadcastSchoolAnnouncement = useCallback(
    async (
      schoolId: string,
      data: { title: string; body: string; authorId: string },
    ) => {
      dispatch({ type: "FETCH_START" });
      try {
        await classroomService.broadcastSchoolAnnouncement(schoolId, data);
        const announcements = await classroomService.getSchoolAnnouncements(
          schoolId,
        );
        dispatch({ type: "FETCH_ANNOUNCEMENTS_SUCCESS", payload: announcements });
      } catch (error: unknown) {
        dispatch({
          type: "FETCH_ERROR",
          payload: getErrorMessage(error, "Failed to post the announcement"),
        });
        throw error;
      }
    },
    [],
  );

  const loadPlatformAnnouncements = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const announcements = await classroomService.getPlatformAnnouncements();
      dispatch({ type: "FETCH_ANNOUNCEMENTS_SUCCESS", payload: announcements });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to load announcements"),
      });
    }
  }, []);

  const broadcastPlatformAnnouncement = useCallback(
    async (data: { title: string; body: string; authorId: string }) => {
      dispatch({ type: "FETCH_START" });
      try {
        await classroomService.broadcastPlatformAnnouncement(data);
        const announcements = await classroomService.getPlatformAnnouncements();
        dispatch({
          type: "FETCH_ANNOUNCEMENTS_SUCCESS",
          payload: announcements,
        });
      } catch (error: unknown) {
        dispatch({
          type: "FETCH_ERROR",
          payload: getErrorMessage(error, "Failed to post the announcement"),
        });
        throw error;
      }
    },
    [],
  );

  const loadResources = useCallback(async (classroomId: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      const resources = await classroomService.getResources(classroomId);
      dispatch({ type: "FETCH_RESOURCES_SUCCESS", payload: resources });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to load resources"),
      });
    }
  }, []);

  const uploadResource = useCallback(
    async (classroomId: string, data: Partial<Resource>) => {
      dispatch({ type: "FETCH_START" });
      try {
        const resource = await classroomService.uploadResource(
          classroomId,
          data,
        );
        dispatch({ type: "UPLOAD_RESOURCE_SUCCESS", payload: resource });
      } catch (error: unknown) {
        dispatch({
          type: "FETCH_ERROR",
          payload: getErrorMessage(error, "Failed to upload resource"),
        });
        throw error;
      }
    },
    [],
  );

  const loadSchedules = useCallback(async (classroomId: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      const schedules = await classroomService.getSchedule(classroomId);
      dispatch({ type: "FETCH_SCHEDULES_SUCCESS", payload: schedules });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to load schedules"),
      });
    }
  }, []);

  const loadAttendance = useCallback(async (classroomId: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      const sheet = await classroomService.getAttendance(classroomId);
      dispatch({ type: "FETCH_ATTENDANCE_SUCCESS", payload: sheet });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to load attendance"),
      });
    }
  }, []);

  const openAttendanceSession = useCallback(
    async (classroomId: string, date: string) => {
      dispatch({ type: "FETCH_START" });
      try {
        await classroomService.createAttendanceSession(classroomId, date);
        const sheet = await classroomService.getAttendance(classroomId);
        dispatch({ type: "OPEN_SESSION_SUCCESS", payload: sheet.sessions });
      } catch (error: unknown) {
        dispatch({
          type: "FETCH_ERROR",
          payload: getErrorMessage(error, "Failed to open session"),
        });
        throw error;
      }
    },
    [],
  );

  const submitAttendance = useCallback(
    async (
      classroomId: string,
      sessionId: string,
      records: AttendanceRecord[],
    ) => {
      dispatch({ type: "FETCH_START" });
      try {
        await classroomService.markAttendance(classroomId, sessionId, records);
        dispatch({ type: "ACTION_SUCCESS" });
      } catch (error: unknown) {
        dispatch({
          type: "FETCH_ERROR",
          payload: getErrorMessage(error, "Failed to submit attendance"),
        });
        throw error;
      }
    },
    [],
  );

  const reportIssue = useCallback(
    async (classroomId: string, studentId: string, note: string) => {
      dispatch({ type: "FETCH_START" });
      try {
        await classroomService.reportStudent(classroomId, studentId, note);
        dispatch({ type: "ACTION_SUCCESS" });
      } catch (error: unknown) {
        dispatch({
          type: "FETCH_ERROR",
          payload: getErrorMessage(error, "Failed to report issue"),
        });
        throw error;
      }
    },
    [],
  );

  return (
    <ClassroomContext.Provider
      value={{
        ...state,
        loadMentorClassrooms,
        loadStudentClassrooms,
        loadClassroomById,
        loadStudents,
        postAnnouncement,
        loadAnnouncements,
        loadSchoolAnnouncements,
        broadcastSchoolAnnouncement,
        loadPlatformAnnouncements,
        broadcastPlatformAnnouncement,
        loadResources,
        uploadResource,
        loadSchedules,
        loadAttendance,
        openAttendanceSession,
        submitAttendance,
        reportIssue,
      }}
    >
      {children}
    </ClassroomContext.Provider>
  );
};
