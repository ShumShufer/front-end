import React, { useReducer, useEffect, useCallback } from "react";
import { AuthContext, type AuthState } from "./AuthContext.tsx";
import { authService } from "../../services/index.ts";
import type {
  LoginCredentials,
  RegisterPayload,
  AuthResponse,
} from "../../services/interfaces/IAuthService.ts";
import type { User } from "../../types/user.types.ts";
import { getErrorMessage } from "../../utils/errors.ts";

type AuthAction =
  | { type: "INIT_START" }
  | { type: "INIT_SUCCESS"; payload: AuthResponse }
  | { type: "INIT_ERROR" }
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: AuthResponse }
  | { type: "LOGIN_ERROR"; payload: string }
  | { type: "PROFILE_SUCCESS"; payload: User }
  | { type: "LOGOUT" };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "INIT_START":
    case "LOGIN_START":
      return { ...state, isLoading: true, error: null };
    case "INIT_SUCCESS":
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        isInitialized: true,
      };
    case "INIT_ERROR":
      return { ...state, isLoading: false, isInitialized: true };
    case "LOGIN_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "PROFILE_SUCCESS":
      return { ...state, isLoading: false, error: null, user: action.payload };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isLoading: true,
    error: null,
    isInitialized: false,
  });

  useEffect(() => {
    const initAuth = async () => {
      dispatch({ type: "INIT_START" });
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const user = await authService.getCurrentUser();
          dispatch({ type: "INIT_SUCCESS", payload: { user, token } });
        } catch {
          localStorage.removeItem("token");
          dispatch({ type: "INIT_ERROR" });
        }
      } else {
        dispatch({ type: "INIT_ERROR" });
      }
    };
    initAuth();
  }, []);

  const persistSession = (response: AuthResponse) => {
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await authService.login(credentials);
      persistSession(response);
      dispatch({ type: "LOGIN_SUCCESS", payload: response });
    } catch (error: unknown) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: getErrorMessage(error, "Login failed"),
      });
      throw error;
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await authService.register(payload);
      persistSession(response);
      dispatch({ type: "LOGIN_SUCCESS", payload: response });
    } catch (error: unknown) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: getErrorMessage(error, "Registration failed"),
      });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    await authService.requestPasswordReset(email);
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    await authService.resetPassword(token, password);
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      if (!state.user)
        throw new Error("You must be signed in to update your profile");
      dispatch({ type: "LOGIN_START" });
      try {
        const user = await authService.updateCurrentUser(state.user.id, data);
        dispatch({ type: "PROFILE_SUCCESS", payload: user });
      } catch (error: unknown) {
        dispatch({
          type: "LOGIN_ERROR",
          payload: getErrorMessage(error, "Failed to update profile"),
        });
        throw error;
      }
    },
    [state.user],
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        requestPasswordReset,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
