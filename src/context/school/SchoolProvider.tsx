import React, { useReducer, useCallback } from 'react';
import { SchoolContext, type SchoolState } from './SchoolContext.tsx';
import { schoolService } from '../../services/index.ts';
import type { School, Branch } from '../../types/school.types.ts';
import type { PaginatedData } from '../../types/common.types.ts';
import { getErrorMessage } from '../../utils/errors.ts';

type SchoolAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SCHOOLS_SUCCESS'; payload: PaginatedData<School> }
  | { type: 'FETCH_ACTIVE_SCHOOL_SUCCESS'; payload: School }
  | { type: 'FETCH_BRANCHES_SUCCESS'; payload: Branch[] }
  | { type: 'UPDATE_SCHOOL_SUCCESS'; payload: School }
  | { type: 'ADD_BRANCH_SUCCESS'; payload: Branch }
  | { type: 'FETCH_ERROR'; payload: string };

function schoolReducer(state: SchoolState, action: SchoolAction): SchoolState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SCHOOLS_SUCCESS':
      return { ...state, isLoading: false, schools: action.payload };
    case 'FETCH_ACTIVE_SCHOOL_SUCCESS':
      return { ...state, isLoading: false, activeSchool: action.payload };
    case 'FETCH_BRANCHES_SUCCESS':
      return { ...state, isLoading: false, branches: action.payload };
    case 'UPDATE_SCHOOL_SUCCESS':
      return { ...state, isLoading: false, activeSchool: action.payload };
    case 'ADD_BRANCH_SUCCESS':
      return { ...state, isLoading: false, branches: [...state.branches, action.payload] };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(schoolReducer, {
    schools: null,
    activeSchool: null,
    branches: [],
    isLoading: false,
    error: null,
  });

  const loadSchools = useCallback(async (params?: { search?: string; status?: string }) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await schoolService.getSchools(params);
      dispatch({ type: 'FETCH_SCHOOLS_SUCCESS', payload: data });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to load schools') });
    }
  }, []);

  const loadSchoolById = useCallback(async (id: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await schoolService.getSchoolById(id);
      dispatch({ type: 'FETCH_ACTIVE_SCHOOL_SUCCESS', payload: data });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to load school details') });
    }
  }, []);

  const loadBranches = useCallback(async (schoolId: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const branches = await schoolService.getBranches(schoolId);
      dispatch({ type: 'FETCH_BRANCHES_SUCCESS', payload: branches });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to load branches') });
    }
  }, []);

  const updateSchoolInfo = useCallback(async (id: string, data: Partial<School>) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const updated = await schoolService.updateSchool(id, data);
      dispatch({ type: 'UPDATE_SCHOOL_SUCCESS', payload: updated });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to update school') });
      throw error;
    }
  }, []);

  const addBranch = useCallback(async (schoolId: string, data: Partial<Branch>) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const newBranch = await schoolService.createBranch(schoolId, data);
      dispatch({ type: 'ADD_BRANCH_SUCCESS', payload: newBranch });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to create branch') });
      throw error;
    }
  }, []);

  return (
    <SchoolContext.Provider
      value={{
        ...state,
        loadSchools,
        loadSchoolById,
        loadBranches,
        updateSchoolInfo,
        addBranch,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};
