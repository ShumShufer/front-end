import React, { useReducer, useCallback } from 'react';
import { SchoolContext, type SchoolState } from './SchoolContext.tsx';
import { schoolService } from '../../services/index.ts';
import type { School, Branch, StaffApplication, StaffApplicationPost } from '../../types/school.types.ts';
import type { Classroom, ClassroomMentor } from '../../types/classroom.types.ts';
import type { ApplicationStatus, Role } from '../../types/common.types.ts';
import type { PaginatedData } from '../../types/common.types.ts';
import { getErrorMessage } from '../../utils/errors.ts';

type SchoolAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SCHOOLS_SUCCESS'; payload: PaginatedData<School> }
  | { type: 'FETCH_ACTIVE_SCHOOL_SUCCESS'; payload: School }
  | { type: 'FETCH_BRANCHES_SUCCESS'; payload: Branch[] }
  | { type: 'UPDATE_SCHOOL_SUCCESS'; payload: School }
  | { type: 'ADD_BRANCH_SUCCESS'; payload: Branch }
  | { type: 'UPDATE_BRANCH_SUCCESS'; payload: Branch }
  | { type: 'REMOVE_BRANCH_SUCCESS'; payload: string }
  | { type: 'FETCH_CLASSROOMS_SUCCESS'; payload: Classroom[] }
  | { type: 'ADD_CLASSROOM_SUCCESS'; payload: Classroom }
  | { type: 'REMOVE_CLASSROOM_SUCCESS'; payload: string }
  | { type: 'FETCH_CLASSROOM_MENTORS_SUCCESS'; payload: { classroomId: string; mentors: ClassroomMentor[] } }
  | { type: 'ASSIGN_CLASSROOM_MENTOR_SUCCESS'; payload: ClassroomMentor }
  | { type: 'REMOVE_CLASSROOM_MENTOR_SUCCESS'; payload: ClassroomMentor }
  | { type: 'FETCH_STAFF_POSTS_SUCCESS'; payload: StaffApplicationPost[] }
  | { type: 'ADD_STAFF_POST_SUCCESS'; payload: StaffApplicationPost }
  | { type: 'UPDATE_STAFF_POST_SUCCESS'; payload: StaffApplicationPost }
  | { type: 'REMOVE_STAFF_POST_SUCCESS'; payload: string }
  | { type: 'FETCH_STAFF_APPLICATIONS_SUCCESS'; payload: StaffApplication[] }
  | { type: 'UPDATE_STAFF_APPLICATION_SUCCESS'; payload: StaffApplication }
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
    case 'UPDATE_BRANCH_SUCCESS':
      return { ...state, isLoading: false, branches: state.branches.map((branch) => branch.id === action.payload.id ? action.payload : branch) };
    case 'REMOVE_BRANCH_SUCCESS':
      return { ...state, isLoading: false, branches: state.branches.filter((branch) => branch.id !== action.payload) };
    case 'FETCH_CLASSROOMS_SUCCESS':
      return { ...state, isLoading: false, classrooms: action.payload };
    case 'ADD_CLASSROOM_SUCCESS':
      return { ...state, isLoading: false, classrooms: [...state.classrooms, action.payload] };
    case 'REMOVE_CLASSROOM_SUCCESS':
      return { ...state, isLoading: false, classrooms: state.classrooms.filter((classroom) => classroom.id !== action.payload), classroomMentors: state.classroomMentors.filter((link) => link.classroomId !== action.payload) };
    case 'FETCH_CLASSROOM_MENTORS_SUCCESS':
      return { ...state, isLoading: false, classroomMentors: [...state.classroomMentors.filter((link) => link.classroomId !== action.payload.classroomId), ...action.payload.mentors] };
    case 'ASSIGN_CLASSROOM_MENTOR_SUCCESS':
      return { ...state, isLoading: false, classroomMentors: state.classroomMentors.some((link) => link.classroomId === action.payload.classroomId && link.mentorId === action.payload.mentorId) ? state.classroomMentors : [...state.classroomMentors, action.payload] };
    case 'REMOVE_CLASSROOM_MENTOR_SUCCESS':
      return { ...state, isLoading: false, classroomMentors: state.classroomMentors.filter((link) => link.classroomId !== action.payload.classroomId || link.mentorId !== action.payload.mentorId) };
    case 'FETCH_STAFF_POSTS_SUCCESS':
      return { ...state, isLoading: false, staffPosts: action.payload };
    case 'ADD_STAFF_POST_SUCCESS':
      return { ...state, isLoading: false, staffPosts: [...state.staffPosts, action.payload] };
    case 'UPDATE_STAFF_POST_SUCCESS':
      return { ...state, isLoading: false, staffPosts: state.staffPosts.map((post) => post.id === action.payload.id ? action.payload : post) };
    case 'REMOVE_STAFF_POST_SUCCESS':
      return { ...state, isLoading: false, staffPosts: state.staffPosts.filter((post) => post.id !== action.payload) };
    case 'FETCH_STAFF_APPLICATIONS_SUCCESS':
      return { ...state, isLoading: false, staffApplications: action.payload };
    case 'UPDATE_STAFF_APPLICATION_SUCCESS':
      return { ...state, isLoading: false, staffApplications: state.staffApplications.map((application) => application.id === action.payload.id ? action.payload : application) };
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
    classrooms: [],
    classroomMentors: [],
    staffPosts: [],
    staffApplications: [],
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

  const loadBranches = useCallback(async (schoolId?: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const branches = schoolId
        ? await schoolService.getBranches(schoolId)
        : await schoolService.getAllBranches();
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

  const editBranch = useCallback(async (id: string, data: Partial<Branch>) => {
    dispatch({ type: 'FETCH_START' });
    try { dispatch({ type: 'UPDATE_BRANCH_SUCCESS', payload: await schoolService.updateBranch(id, data) }); }
    catch (error: unknown) { dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to update branch') }); throw error; }
  }, []);

  const removeBranch = useCallback(async (id: string) => {
    dispatch({ type: 'FETCH_START' });
    try { await schoolService.deleteBranch(id); dispatch({ type: 'REMOVE_BRANCH_SUCCESS', payload: id }); }
    catch (error: unknown) { dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to delete branch') }); throw error; }
  }, []);

  const loadClassrooms = useCallback(async (schoolId: string) => {
    dispatch({ type: 'FETCH_START' });
    try { dispatch({ type: 'FETCH_CLASSROOMS_SUCCESS', payload: await schoolService.getClassrooms(schoolId) }); }
    catch (error: unknown) { dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to load classrooms') }); }
  }, []);

  const addClassroom = useCallback(async (schoolId: string, name: string) => {
    dispatch({ type: 'FETCH_START' });
    try { dispatch({ type: 'ADD_CLASSROOM_SUCCESS', payload: await schoolService.createClassroom(schoolId, { name }) }); }
    catch (error: unknown) { dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to create classroom') }); throw error; }
  }, []);

  const removeClassroom = useCallback(async (id: string) => {
    dispatch({ type: 'FETCH_START' });
    try { await schoolService.deleteClassroom(id); dispatch({ type: 'REMOVE_CLASSROOM_SUCCESS', payload: id }); }
    catch (error: unknown) { dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to delete classroom') }); throw error; }
  }, []);

  const loadClassroomMentors = useCallback(async (classroomId: string) => {
    dispatch({ type: 'FETCH_START' });
    try { dispatch({ type: 'FETCH_CLASSROOM_MENTORS_SUCCESS', payload: { classroomId, mentors: await schoolService.getClassroomMentors(classroomId) } }); }
    catch (error: unknown) { dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to load classroom mentors') }); }
  }, []);

  const assignClassroomMentor = useCallback(async (classroomId: string, mentorId: string) => {
    dispatch({ type: 'FETCH_START' });
    try { dispatch({ type: 'ASSIGN_CLASSROOM_MENTOR_SUCCESS', payload: await schoolService.assignMentor(classroomId, mentorId) }); }
    catch (error: unknown) { dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to assign mentor') }); throw error; }
  }, []);

  const removeClassroomMentor = useCallback(async (classroomId: string, mentorId: string) => {
    dispatch({ type: 'FETCH_START' });
    try { await schoolService.removeMentor(classroomId, mentorId); dispatch({ type: 'REMOVE_CLASSROOM_MENTOR_SUCCESS', payload: { classroomId, mentorId } }); }
    catch (error: unknown) { dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to remove mentor') }); throw error; }
  }, []);

  const loadStaffPosts = useCallback(async (schoolId: string) => {
    dispatch({ type: 'FETCH_START' });
    try { dispatch({ type: 'FETCH_STAFF_POSTS_SUCCESS', payload: await schoolService.getStaffPosts(schoolId) }); }
    catch (error: unknown) { dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to load job posts') }); }
  }, []);

  const addStaffPost = useCallback(async (schoolId: string, role: Role, description: string) => {
    dispatch({ type: 'FETCH_START' });
    try { dispatch({ type: 'ADD_STAFF_POST_SUCCESS', payload: await schoolService.createStaffPost(schoolId, { role, description }) }); }
    catch (error: unknown) { dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to create job post') }); throw error; }
  }, []);

  const updateStaffPost = useCallback(async (id: string, data: Partial<StaffApplicationPost>) => {
    dispatch({ type: 'FETCH_START' });
    try { dispatch({ type: 'UPDATE_STAFF_POST_SUCCESS', payload: await schoolService.updateStaffPost(id, data) }); }
    catch (error: unknown) { dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to update job post') }); throw error; }
  }, []);

  const removeStaffPost = useCallback(async (id: string) => {
    dispatch({ type: 'FETCH_START' });
    try { await schoolService.deleteStaffPost(id); dispatch({ type: 'REMOVE_STAFF_POST_SUCCESS', payload: id }); }
    catch (error: unknown) { dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to remove job post') }); throw error; }
  }, []);

  const loadStaffApplications = useCallback(async (schoolId: string) => {
    dispatch({ type: 'FETCH_START' });
    try { dispatch({ type: 'FETCH_STAFF_APPLICATIONS_SUCCESS', payload: await schoolService.getStaffApplications(schoolId) }); }
    catch (error: unknown) { dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to load staff applications') }); }
  }, []);

  const updateStaffApplication = useCallback(async (id: string, status: ApplicationStatus) => {
    dispatch({ type: 'FETCH_START' });
    try { dispatch({ type: 'UPDATE_STAFF_APPLICATION_SUCCESS', payload: await schoolService.updateStaffApplicationStatus(id, status) }); }
    catch (error: unknown) { dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to update staff application') }); throw error; }
  }, []);

  const assignEducationHead = useCallback(async (schoolId: string, userId: string) => {
    dispatch({ type: 'FETCH_START' });
    try { await schoolService.assignEducationHead(schoolId, userId); dispatch({ type: 'FETCH_CLASSROOMS_SUCCESS', payload: state.classrooms }); }
    catch (error: unknown) { dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to assign education head') }); throw error; }
  }, [state.classrooms]);

  const removeEducationHead = useCallback(async (schoolId: string, userId: string) => {
    dispatch({ type: 'FETCH_START' });
    try { await schoolService.removeEducationHead(schoolId, userId); dispatch({ type: 'FETCH_CLASSROOMS_SUCCESS', payload: state.classrooms }); }
    catch (error: unknown) { dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to remove education head') }); throw error; }
  }, [state.classrooms]);

  return (
    <SchoolContext.Provider
      value={{
        ...state,
        loadSchools,
        loadSchoolById,
        loadBranches,
        updateSchoolInfo,
        addBranch,
        editBranch,
        removeBranch,
        loadClassrooms,
        addClassroom,
        removeClassroom,
        loadClassroomMentors,
        assignClassroomMentor,
        removeClassroomMentor,
        loadStaffPosts,
        addStaffPost,
        updateStaffPost,
        removeStaffPost,
        loadStaffApplications,
        updateStaffApplication,
        assignEducationHead,
        removeEducationHead,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};
