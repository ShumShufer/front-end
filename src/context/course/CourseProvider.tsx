import React, { useReducer, useCallback } from "react";
import { CourseContext, type CourseState } from "./CourseContext.tsx";
import { courseService } from "../../services/index.ts";
import type {
  Course,
  Topic,
  CourseResult,
  ClassroomCourseLink,
} from "../../types/course.types.ts";
import { getErrorMessage } from "../../utils/errors.ts";

type CourseAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_COURSES_SUCCESS"; payload: Course[] }
  | { type: "FETCH_COURSE_SUCCESS"; payload: Course }
  | { type: "FETCH_TOPICS_SUCCESS"; payload: Topic[] }
  | {
      type: "FETCH_CLASSROOM_COURSES_SUCCESS";
      payload: ClassroomCourseLink[];
    }
  | { type: "FETCH_PROGRESS_SUCCESS"; payload: CourseResult[] }
  | { type: "ACTION_SUCCESS" }
  | { type: "FETCH_ERROR"; payload: string };

function courseReducer(state: CourseState, action: CourseAction): CourseState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_COURSES_SUCCESS":
      return { ...state, isLoading: false, courses: action.payload };
    case "FETCH_COURSE_SUCCESS":
      return { ...state, isLoading: false, activeCourse: action.payload };
    case "FETCH_TOPICS_SUCCESS":
      return { ...state, isLoading: false, topics: action.payload };
    case "FETCH_CLASSROOM_COURSES_SUCCESS":
      return { ...state, isLoading: false, classroomCourses: action.payload };
    case "FETCH_PROGRESS_SUCCESS":
      return { ...state, isLoading: false, progress: action.payload };
    case "ACTION_SUCCESS":
      return { ...state, isLoading: false, error: null };
    case "FETCH_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(courseReducer, {
    courses: [],
    activeCourse: null,
    topics: [],
    classroomCourses: [],
    progress: [],
    isLoading: false,
    error: null,
  });

  const loadCourses = useCallback(async (params?: { schoolId?: string }) => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await courseService.getCourses(params);
      dispatch({ type: "FETCH_COURSES_SUCCESS", payload: data });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to load courses"),
      });
    }
  }, []);

  const loadCourseById = useCallback(async (id: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await courseService.getCourseById(id);
      dispatch({ type: "FETCH_COURSE_SUCCESS", payload: data });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to load course"),
      });
    }
  }, []);

  const createCourse = useCallback(async (data: Partial<Course>) => {
    dispatch({ type: "FETCH_START" });
    try {
      await courseService.createCourse(data);
      dispatch({ type: "ACTION_SUCCESS" });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to create course"),
      });
      throw error;
    }
  }, []);

  const updateCourse = useCallback(
    async (id: string, data: Partial<Course>) => {
      dispatch({ type: "FETCH_START" });
      try {
        await courseService.updateCourse(id, data);
        dispatch({ type: "ACTION_SUCCESS" });
      } catch (error: unknown) {
        dispatch({
          type: "FETCH_ERROR",
          payload: getErrorMessage(error, "Failed to update course"),
        });
        throw error;
      }
    },
    [],
  );

  const deleteCourse = useCallback(async (id: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      await courseService.deleteCourse(id);
      dispatch({ type: "ACTION_SUCCESS" });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to delete course"),
      });
      throw error;
    }
  }, []);

  const loadTopics = useCallback(async (courseId: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      const topics = await courseService.getTopics(courseId);
      dispatch({ type: "FETCH_TOPICS_SUCCESS", payload: topics });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to load topics"),
      });
    }
  }, []);

  const createTopic = useCallback(
    async (courseId: string, data: Partial<Topic>) => {
      dispatch({ type: "FETCH_START" });
      try {
        await courseService.createTopic(courseId, data);
        dispatch({ type: "ACTION_SUCCESS" });
      } catch (error: unknown) {
        dispatch({
          type: "FETCH_ERROR",
          payload: getErrorMessage(error, "Failed to create topic"),
        });
        throw error;
      }
    },
    [],
  );

  const updateTopic = useCallback(async (id: string, data: Partial<Topic>) => {
    dispatch({ type: "FETCH_START" });
    try {
      await courseService.updateTopic(id, data);
      dispatch({ type: "ACTION_SUCCESS" });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to update topic"),
      });
      throw error;
    }
  }, []);

  const loadClassroomCourses = useCallback(async (classroomId: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      const links = await courseService.getClassroomCourses(classroomId);
      dispatch({ type: "FETCH_CLASSROOM_COURSES_SUCCESS", payload: links });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to load classroom courses"),
      });
    }
  }, []);

  const loadStudentProgress = useCallback(async (studentId: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      const progress = await courseService.getStudentProgress(studentId);
      dispatch({ type: "FETCH_PROGRESS_SUCCESS", payload: progress });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to load progress"),
      });
    }
  }, []);

  const submitFinalExam = useCallback(
    async (
      courseId: string,
      studentId: string,
      classroomId: string,
      score: number,
      passScore: number,
    ) => {
      dispatch({ type: "FETCH_START" });
      try {
        await courseService.submitFinalExam(
          courseId,
          studentId,
          classroomId,
          score,
          passScore,
        );
        const progress = await courseService.getStudentProgress(studentId);
        dispatch({ type: "FETCH_PROGRESS_SUCCESS", payload: progress });
      } catch (error: unknown) {
        dispatch({
          type: "FETCH_ERROR",
          payload: getErrorMessage(error, "Failed to submit exam"),
        });
        throw error;
      }
    },
    [],
  );

  const publishResult = useCallback(
    async (courseId: string, studentId: string, data: Partial<CourseResult>) => {
      dispatch({ type: "FETCH_START" });
      try {
        await courseService.publishResult(courseId, studentId, data);
        const progress = await courseService.getStudentProgress(studentId);
        dispatch({ type: "FETCH_PROGRESS_SUCCESS", payload: progress });
      } catch (error: unknown) {
        dispatch({
          type: "FETCH_ERROR",
          payload: getErrorMessage(error, "Failed to publish result"),
        });
        throw error;
      }
    },
    [],
  );

  return (
    <CourseContext.Provider
      value={{
        ...state,
        loadCourses,
        loadCourseById,
        createCourse,
        updateCourse,
        deleteCourse,
        loadTopics,
        createTopic,
        updateTopic,
        loadClassroomCourses,
        loadStudentProgress,
        submitFinalExam,
        publishResult,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};
