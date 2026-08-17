import React, { useReducer, useCallback } from 'react';
import { ClassroomContext, type ClassroomState } from './ClassroomContext.tsx';
import { classroomService } from '../../services/index.ts';
import type { Classroom, Announcement, ScheduleEvent, AttendanceRecord } from '../../types/classroom.types.ts';
import { getErrorMessage } from '../../utils/errors.ts';

type ClassroomAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_CLASSROOMS_SUCCESS'; payload: Classroom[] }
  | { type: 'FETCH_ACTIVE_CLASSROOM_SUCCESS'; payload: Classroom }
  | { type: 'POST_ANNOUNCEMENT_SUCCESS'; payload: Announcement }
  | { type: 'FETCH_SCHEDULES_SUCCESS'; payload: ScheduleEvent[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ACTION_SUCCESS' };

function classroomReducer(state: ClassroomState, action: ClassroomAction): ClassroomState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_CLASSROOMS_SUCCESS':
      return { ...state, isLoading: false, classrooms: action.payload };
    case 'FETCH_ACTIVE_CLASSROOM_SUCCESS':
      return { ...state, isLoading: false, activeClassroom: action.payload };
    case 'POST_ANNOUNCEMENT_SUCCESS':
      return { ...state, isLoading: false, announcements: [action.payload, ...state.announcements] };
    case 'FETCH_SCHEDULES_SUCCESS':
      return { ...state, isLoading: false, schedules: action.payload };
    case 'ACTION_SUCCESS':
      return { ...state, isLoading: false };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

export const ClassroomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(classroomReducer, {
    classrooms: [],
    activeClassroom: null,
    announcements: [],
    schedules: [],
    isLoading: false,
    error: null,
  });

  const loadMentorClassrooms = useCallback(async (mentorId: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await classroomService.listForMentor(mentorId);
      dispatch({ type: 'FETCH_CLASSROOMS_SUCCESS', payload: data });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to load classrooms') });
    }
  }, []);

  const loadStudentClassrooms = useCallback(async (studentId: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await classroomService.listForStudent(studentId);
      dispatch({ type: 'FETCH_CLASSROOMS_SUCCESS', payload: data });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to load classrooms') });
    }
  }, []);

  const loadClassroomById = useCallback(async (id: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await classroomService.getById(id);
      dispatch({ type: 'FETCH_ACTIVE_CLASSROOM_SUCCESS', payload: data });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to load classroom details') });
    }
  }, []);

  const postAnnouncement = useCallback(async (classroomId: string, data: Partial<Announcement>) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const newAnn = await classroomService.createAnnouncement(classroomId, data);
      dispatch({ type: 'POST_ANNOUNCEMENT_SUCCESS', payload: newAnn });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to post announcement') });
      throw error;
    }
  }, []);

  const loadSchedules = useCallback(async (classroomId: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const schedules = await classroomService.getSchedule(classroomId);
      dispatch({ type: 'FETCH_SCHEDULES_SUCCESS', payload: schedules });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to load schedules') });
    }
  }, []);

  const submitAttendance = useCallback(async (classroomId: string, sessionId: string, records: AttendanceRecord[]) => {
    dispatch({ type: 'FETCH_START' });
    try {
      await classroomService.markAttendance(classroomId, sessionId, records);
      dispatch({ type: 'ACTION_SUCCESS' });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to submit attendance') });
      throw error;
    }
  }, []);

  const reportIssue = useCallback(async (classroomId: string, studentId: string, note: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      await classroomService.reportStudent(classroomId, studentId, note);
      dispatch({ type: 'ACTION_SUCCESS' });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to report issue') });
      throw error;
    }
  }, []);

  return (
    <ClassroomContext.Provider
      value={{
        ...state,
        loadMentorClassrooms,
        loadStudentClassrooms,
        loadClassroomById,
        postAnnouncement,
        loadSchedules,
        submitAttendance,
        reportIssue,
      }}
    >
      {children}
    </ClassroomContext.Provider>
  );
};
