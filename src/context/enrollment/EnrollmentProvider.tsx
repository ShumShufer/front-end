import React, { useReducer, useCallback } from "react";
import {
  EnrollmentContext,
  type EnrollmentState,
} from "./EnrollmentContext.tsx";
import { enrollmentService } from "../../services/index.ts";
import type {
  Enrollment,
  PracticeElsewhereRequest,
} from "../../types/enrollment.types.ts";
import type {
  ApplicationMode,
  PaginatedData,
} from "../../types/common.types.ts";
import { getErrorMessage } from "../../utils/errors.ts";

type EnrollmentAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_ENROLLMENTS_SUCCESS"; payload: PaginatedData<Enrollment> }
  | {
      type: "FETCH_PRACTICE_REQUESTS_SUCCESS";
      payload: PracticeElsewhereRequest[];
    }
  | { type: "SUBMIT_SUCCESS"; payload: Enrollment }
  | { type: "UPDATE_SUCCESS"; payload: Enrollment }
  | { type: "PRACTICE_SUBMIT_SUCCESS"; payload: PracticeElsewhereRequest }
  | { type: "PRACTICE_UPDATE_SUCCESS"; payload: PracticeElsewhereRequest }
  | { type: "FETCH_ERROR"; payload: string };

function enrollmentReducer(
  state: EnrollmentState,
  action: EnrollmentAction,
): EnrollmentState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_ENROLLMENTS_SUCCESS":
      return { ...state, isLoading: false, enrollments: action.payload };
    case "FETCH_PRACTICE_REQUESTS_SUCCESS":
      return { ...state, isLoading: false, practiceRequests: action.payload };
    case "SUBMIT_SUCCESS":
      return { ...state, isLoading: false, error: null };
    case "UPDATE_SUCCESS":
      return { ...state, isLoading: false, error: null };
    case "PRACTICE_SUBMIT_SUCCESS":
      return {
        ...state,
        isLoading: false,
        practiceRequests: [...state.practiceRequests, action.payload],
      };
    case "PRACTICE_UPDATE_SUCCESS":
      return { ...state, isLoading: false };
    case "FETCH_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

export const EnrollmentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(enrollmentReducer, {
    enrollments: null,
    practiceRequests: [],
    isLoading: false,
    error: null,
  });

  const loadEnrollments = useCallback(
    async (params?: {
      schoolId?: string;
      studentId?: string;
      status?: string;
    }) => {
      dispatch({ type: "FETCH_START" });
      try {
        const data = await enrollmentService.getEnrollments(params);
        dispatch({ type: "FETCH_ENROLLMENTS_SUCCESS", payload: data });
      } catch (error: unknown) {
        dispatch({
          type: "FETCH_ERROR",
          payload: getErrorMessage(error, "Failed to load enrollments"),
        });
      }
    },
    [],
  );

  const submitApplication = useCallback(
    async (
      schoolId: string,
      mode: ApplicationMode,
      formResponses: Record<string, unknown>,
    ) => {
      dispatch({ type: "FETCH_START" });
      try {
        const data = await enrollmentService.submitApplication(
          schoolId,
          mode,
          formResponses,
        );
        dispatch({ type: "SUBMIT_SUCCESS", payload: data });
      } catch (error: unknown) {
        dispatch({
          type: "FETCH_ERROR",
          payload: getErrorMessage(error, "Failed to submit application"),
        });
        throw error;
      }
    },
    [],
  );

  const acceptApplication = useCallback(async (id: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await enrollmentService.acceptApplication(id);
      dispatch({ type: "UPDATE_SUCCESS", payload: data });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to accept application"),
      });
      throw error;
    }
  }, []);

  const rejectApplication = useCallback(async (id: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await enrollmentService.rejectApplication(id);
      dispatch({ type: "UPDATE_SUCCESS", payload: data });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to reject application"),
      });
      throw error;
    }
  }, []);

  const loadPracticeRequests = useCallback(
    async (params?: { schoolId?: string; studentId?: string }) => {
      dispatch({ type: "FETCH_START" });
      try {
        const data = await enrollmentService.getPracticeRequests(params);
        dispatch({ type: "FETCH_PRACTICE_REQUESTS_SUCCESS", payload: data });
      } catch (error: unknown) {
        dispatch({
          type: "FETCH_ERROR",
          payload: getErrorMessage(error, "Failed to load practice requests"),
        });
      }
    },
    [],
  );

  const submitPracticeRequest = useCallback(
    async (homeSchoolId: string, hostSchoolId: string, fee: number) => {
      dispatch({ type: "FETCH_START" });
      try {
        const data = await enrollmentService.submitPracticeRequest(
          homeSchoolId,
          hostSchoolId,
          fee,
        );
        dispatch({ type: "PRACTICE_SUBMIT_SUCCESS", payload: data });
      } catch (error: unknown) {
        dispatch({
          type: "FETCH_ERROR",
          payload: getErrorMessage(error, "Failed to submit practice request"),
        });
        throw error;
      }
    },
    [],
  );

  const approvePracticeRequest = useCallback(async (id: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await enrollmentService.approvePracticeRequest(id);
      dispatch({ type: "PRACTICE_UPDATE_SUCCESS", payload: data });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to approve practice request"),
      });
      throw error;
    }
  }, []);

  return (
    <EnrollmentContext.Provider
      value={{
        ...state,
        loadEnrollments,
        submitApplication,
        acceptApplication,
        rejectApplication,
        loadPracticeRequests,
        submitPracticeRequest,
        approvePracticeRequest,
      }}
    >
      {children}
    </EnrollmentContext.Provider>
  );
};
