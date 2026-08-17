import type { INotificationService } from './interfaces/INotificationService.ts';
import type { Notification, NotificationRecipient } from '../types/notification.types.ts';
import type { PaginatedData } from '../types/common.types.ts';
import { mockNotifications } from './mockData.ts';
// import httpClient from './api/httpClient.ts';

const delay = <T>(ms: number, value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

class NotificationService implements INotificationService {
  async getNotifications(
    params?: { unreadOnly?: boolean },
  ): Promise<PaginatedData<Notification & NotificationRecipient>> {
    // return httpClient.get('/notifications', { params });
    let filtered = mockNotifications;
    if (params?.unreadOnly) {
      filtered = filtered.filter(n => !n.read);
    }
    return delay(400, {
      data: filtered,
      meta: { page: 1, pageSize: 10, total: filtered.length },
    });
  }

  async markAsRead(id: string): Promise<void> {
    // return httpClient.patch(`/notifications/${id}/read`);
    const notification = mockNotifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
    return delay(300, undefined);
  }

  async markAllAsRead(): Promise<void> {
    // return httpClient.patch('/notifications/read-all');
    for (const notification of mockNotifications) {
      notification.read = true;
    }
    return delay(500, undefined);
  }
}

export const notificationService = new NotificationService();
