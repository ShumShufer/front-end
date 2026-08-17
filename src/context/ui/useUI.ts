import { useContext } from "react";
import { UIContext, type UIContextType } from "./UIContext";

export function useUI(): UIContextType  {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
