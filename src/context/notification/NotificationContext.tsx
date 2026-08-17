import { createContext } from 'react';
import type { Notification, NotificationRecipient } from '../../types/notification.types.ts';
import type { PaginatedData } from '../../types/common.types.ts';

export type NotificationWithRecipient = Notification & NotificationRecipient;

export interface NotificationState {
  notifications: PaginatedData<NotificationWithRecipient> | null;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationContextType extends NotificationState {
  loadNotifications: (params?: { unreadOnly?: boolean }) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | null>(null);
