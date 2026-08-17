import React, { useReducer, useCallback } from 'react';
import { NotificationContext, type NotificationState, type NotificationWithRecipient } from './NotificationContext.tsx';
import { notificationService } from '../../services/index.ts';
import type { PaginatedData } from '../../types/common.types.ts';
import { getErrorMessage } from '../../utils/errors.ts';

type NotificationAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: PaginatedData<NotificationWithRecipient> }
  | { type: 'MARK_READ_SUCCESS'; payload: string }
  | { type: 'MARK_ALL_READ_SUCCESS' }
  | { type: 'FETCH_ERROR'; payload: string };

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        notifications: action.payload,
        unreadCount: action.payload.data.filter((n) => !n.read).length,
      };
    case 'MARK_READ_SUCCESS':
      return {
        ...state,
        isLoading: false,
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_READ_SUCCESS':
      return { ...state, isLoading: false, unreadCount: 0 };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: null,
    unreadCount: 0,
    isLoading: false,
    error: null,
  });

  const loadNotifications = useCallback(async (params?: { unreadOnly?: boolean }) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await notificationService.getNotifications(params);
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to load notifications') });
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      await notificationService.markAsRead(id);
      dispatch({ type: 'MARK_READ_SUCCESS', payload: id });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to mark as read') });
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      await notificationService.markAllAsRead();
      dispatch({ type: 'MARK_ALL_READ_SUCCESS' });
    } catch (error: unknown) {
      dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(error, 'Failed to mark all as read') });
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        ...state,
        loadNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
