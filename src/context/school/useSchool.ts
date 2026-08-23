import { useContext } from "react";
import { SchoolContext, type SchoolContextType } from "./SchoolContext.tsx";

export function useSchool(): SchoolContextType {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error("useSchool must be used within a SchoolProvider");
  }
  return context;
}
