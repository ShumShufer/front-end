import type { Notification, NotificationRecipient } from '../../types/notification.types.ts';
import type { PaginatedData } from '../../types/common.types.ts';

export interface INotificationService {
  getNotifications(params?: { unreadOnly?: boolean }): Promise<PaginatedData<Notification & NotificationRecipient>>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
}
