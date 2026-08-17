import { useContext } from 'react';
import { CourseContext, type CourseContextType } from './CourseContext.tsx';

export function useCourse(): CourseContextType {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};
