import { useState } from "react";
import { UIContext, type UIState } from "./UIContext";

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isLoading, setLoading] = useState(false);
  const [toast, setToast] = useState<UIState["toast"]>(null);

  function showToast(
    message: string,
    type: "success" | "error" | "info" = "info",
  ) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function hideToast() {
    setToast(null);
  }

  return (
    <UIContext.Provider
      value={{
        theme,
        isLoading,
        toast,
        setTheme,
        setLoading,
        showToast,
        hideToast,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};
