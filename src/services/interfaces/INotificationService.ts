import { Notification } from '../../types/notification.types';

export interface INotificationService {
  getUnread(userId: string): Promise<Notification[]>;
  getAll(userId: string): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  subscribe(userId: string, callback: (notification: Notification) => void): () => void;
}
