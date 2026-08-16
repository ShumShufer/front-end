import { INotificationService } from '../interfaces/INotificationService';
import { Notification } from '../../types/notification.types';

export const mockNotificationService: INotificationService = {
  async getUnread(userId: string): Promise<Notification[]> {
    return [];
  },

  async getAll(userId: string): Promise<Notification[]> {
    return [];
  },

  async markAsRead(notificationId: string): Promise<void> {
    // Mock implementation
  },

  async markAllAsRead(userId: string): Promise<void> {
    // Mock implementation
  },

  subscribe(userId: string, callback: (notification: Notification) => void) {
    return () => {
      // Unsubscribe function
    };
  },
};
