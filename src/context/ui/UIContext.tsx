import { createContext } from "react";

export interface UIState {
  theme: "light" | "dark";
  isLoading: boolean;
  toast: { message: string; type: "success" | "error" | "info" } | null;
}

export interface UIContextType extends UIState {
  setTheme: (theme: "light" | "dark") => void;
  setLoading: (isLoading: boolean) => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  hideToast: () => void;
}

export const UIContext = createContext<UIContextType | null>(null);
