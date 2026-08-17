import { useContext } from 'react';
import { EnrollmentContext, type EnrollmentContextType } from './EnrollmentContext.tsx';

export function useEnrollment(): EnrollmentContextType {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error('useEnrollment must be used within an EnrollmentProvider');
  }
  return context;
};
