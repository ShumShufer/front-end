import React, { useReducer, useEffect, useCallback } from 'react';
import { AuthContext, type AuthState } from './AuthContext.tsx';
import { authService } from '../../services/index.ts';
import type { LoginCredentials, RegisterPayload, AuthResponse } from '../../services/interfaces/IAuthService.ts';
import { getErrorMessage } from '../../utils/errors.ts';

type AuthAction =
  | { type: 'INIT_START' }
  | { type: 'INIT_SUCCESS'; payload: AuthResponse }
  | { type: 'INIT_ERROR' }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthResponse }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INIT_START':
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'INIT_SUCCESS':
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        isInitialized: true,
      };
    case 'INIT_ERROR':
      return { ...state, isLoading: false, isInitialized: true };
    case 'LOGIN_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, token: null, isLoading: false, error: null };
    default:
      return state;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isLoading: true,
    error: null,
    isInitialized: false,
  });

  useEffect(() => {
    const initAuth = async () => {
      dispatch({ type: 'INIT_START' });
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = await authService.getCurrentUser();
          dispatch({ type: 'INIT_SUCCESS', payload: { user, token } });
        } catch {
          localStorage.removeItem('token');
          dispatch({ type: 'INIT_ERROR' });
        }
      } else {
        dispatch({ type: 'INIT_ERROR' });
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response });
    } catch (error: unknown) {
      dispatch({ type: 'LOGIN_ERROR', payload: getErrorMessage(error, 'Login failed') });
      throw error;
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.register(payload);
      localStorage.setItem('token', response.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response });
    } catch (error: unknown) {
      dispatch({ type: 'LOGIN_ERROR', payload: getErrorMessage(error, 'Registration failed') });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
