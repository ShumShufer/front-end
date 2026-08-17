import React, { useReducer, useCallback } from 'react';
import { TaskContext, type TaskState } from './TaskContext.tsx';
import { taskService } from '../../services/index.ts';
import type { Task, Submission } from '../../types/task.types.ts';
import { getErrorMessage } from '../../utils/errors.ts';

type TaskAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_TASKS_SUCCESS'; payload: Task[] }
  | { type: 'FETCH_TASK_SUCCESS'; payload: Task }
  | { type: 'FETCH_SUBMISSIONS_SUCCESS'; payload: Submission[] }
  | { type: 'ACTION_SUCCESS' }
  | { type: 'FETCH_ERROR'; payload: string };

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_TASKS_SUCCESS':
      return { ...state, isLoading: false, tasks: action.payload };
    case 'FETCH_TASK_SUCCESS':
      return { ...state, isLoading: false, activeTask: action.payload };
    case 'FETCH_SUBMISSIONS_SUCCESS':
      return { ...state, isLoading: false, submissions: action.payload };
    case 'ACTION_SUCCESS':
      return { ...state, isLoading: false, error: null };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    activeTask: null,
    submissions: [],
    isLoading: false,
    error: null,
  });

  const loadTasks = useCallback(async (classroomId: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await taskService.getTasksByClassroom(classroomId);
      dispatch({ type: 'FETCH_TASKS_SUCCESS', payload: data });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to load tasks') });
    }
  }, []);

  const loadTaskById = useCallback(async (id: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await taskService.getTaskById(id);
      dispatch({ type: 'FETCH_TASK_SUCCESS', payload: data });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to load task') });
    }
  }, []);

  const createTask = useCallback(async (classroomId: string, data: Partial<Task>) => {
    dispatch({ type: 'FETCH_START' });
    try {
      await taskService.createTask(classroomId, data);
      dispatch({ type: 'ACTION_SUCCESS' });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to create task') });
      throw error;
    }
  }, []);

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    dispatch({ type: 'FETCH_START' });
    try {
      await taskService.updateTask(id, data);
      dispatch({ type: 'ACTION_SUCCESS' });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to update task') });
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      await taskService.deleteTask(id);
      dispatch({ type: 'ACTION_SUCCESS' });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to delete task') });
      throw error;
    }
  }, []);

  const loadSubmissions = useCallback(async (taskId: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const submissions = await taskService.getSubmissions(taskId);
      dispatch({ type: 'FETCH_SUBMISSIONS_SUCCESS', payload: submissions });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to load submissions') });
    }
  }, []);

  const submitTask = useCallback(async (taskId: string, studentId: string, attachments: string[]) => {
    dispatch({ type: 'FETCH_START' });
    try {
      await taskService.submitTask(taskId, studentId, attachments);
      dispatch({ type: 'ACTION_SUCCESS' });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to submit task') });
      throw error;
    }
  }, []);

  const gradeSubmission = useCallback(async (submissionId: string, grade: number, feedback: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      await taskService.gradeSubmission(submissionId, grade, feedback);
      dispatch({ type: 'ACTION_SUCCESS' });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to grade submission') });
      throw error;
    }
  }, []);

  return (
    <TaskContext.Provider
      value={{
        ...state,
        loadTasks,
        loadTaskById,
        createTask,
        updateTask,
        deleteTask,
        loadSubmissions,
        submitTask,
        gradeSubmission,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
