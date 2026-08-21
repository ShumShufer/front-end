import React, { useReducer, useCallback } from "react";
import { UserContext, type UserState } from "./UserContext.tsx";
import { userService } from "../../services/index.ts";
import type { User } from "../../types/user.types.ts";
import type { PaginatedData } from "../../types/common.types.ts";
import { getErrorMessage } from "../../utils/errors.ts";

type UserAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_USERS_SUCCESS"; payload: PaginatedData<User> }
  | { type: "FETCH_USER_SUCCESS"; payload: User }
  | { type: "ACTION_SUCCESS" }
  | { type: "FETCH_ERROR"; payload: string };

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_USERS_SUCCESS":
      return { ...state, isLoading: false, users: action.payload };
    case "FETCH_USER_SUCCESS":
      return { ...state, isLoading: false, activeUser: action.payload };
    case "ACTION_SUCCESS":
      return { ...state, isLoading: false, error: null };
    case "FETCH_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(userReducer, {
    users: null,
    activeUser: null,
    isLoading: false,
    error: null,
  });

  const loadUsers = useCallback(
    async (params?: { role?: string; search?: string }) => {
      dispatch({ type: "FETCH_START" });
      try {
        const data = await userService.getUsers(params);
        dispatch({ type: "FETCH_USERS_SUCCESS", payload: data });
      } catch (error: unknown) {
        dispatch({
          type: "FETCH_ERROR",
          payload: getErrorMessage(error, "Failed to load users"),
        });
      }
    },
    [],
  );

  const loadUserById = useCallback(async (id: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await userService.getUserById(id);
      dispatch({ type: "FETCH_USER_SUCCESS", payload: data });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to load user"),
      });
    }
  }, []);

  const updateUser = useCallback(async (id: string, data: Partial<User>) => {
    dispatch({ type: "FETCH_START" });
    try {
      await userService.updateUser(id, data);
      dispatch({ type: "ACTION_SUCCESS" });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to update user"),
      });
      throw error;
    }
  }, []);

  const suspendUser = useCallback(async (id: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      await userService.suspendUser(id);
      dispatch({ type: "ACTION_SUCCESS" });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to suspend user"),
      });
      throw error;
    }
  }, []);

  const assignRole = useCallback(async (id: string, role: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      await userService.assignRole(id, role);
      dispatch({ type: "ACTION_SUCCESS" });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to assign role"),
      });
      throw error;
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        ...state,
        loadUsers,
        loadUserById,
        updateUser,
        suspendUser,
        assignRole,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
