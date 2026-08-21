import { useContext } from "react";
import {
  ClassroomContext,
  type ClassroomContextType,
} from "./ClassroomContext.tsx";

export function useClassroom(): ClassroomContextType {
  const context = useContext(ClassroomContext);
  if (!context) {
    throw new Error("useClassroom must be used within a ClassroomProvider");
  }
  return context;
}
