import type {
  CreateNotificationInput,
  INotificationService,
} from "./interfaces/INotificationService.ts";
import type {
  Notification,
  NotificationRecipient,
} from "../types/notification.types.ts";
import type { PaginatedData } from "../types/common.types.ts";
import { mockNotifications } from "./mockData.ts";
import { getSessionUser } from "../utils/session.ts";
// import httpClient from './api/httpClient.ts';

const delay = <T>(ms: number, value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

function getSessionUserId(): string | null {
  return getSessionUser()?.id ?? null;
}

class NotificationService implements INotificationService {
  async getNotifications(params?: {
    unreadOnly?: boolean;
  }): Promise<PaginatedData<Notification & NotificationRecipient>> {
    // return httpClient.get('/notifications', { params });
    const sessionUserId = getSessionUserId();
    let filtered = mockNotifications.filter(
      // Guests have no inbox; each user only sees their own copies.
      (n) => !sessionUserId || n.userId === sessionUserId,
    );
    if (params?.unreadOnly) {
      filtered = filtered.filter((n) => !n.read);
    }
    return delay(400, {
      data: filtered,
      meta: { page: 1, pageSize: 10, total: filtered.length },
    });
  }

  async markAsRead(id: string): Promise<void> {
    // return httpClient.patch(`/notifications/${id}/read`);
    const notification = mockNotifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
    return delay(300, undefined);
  }

  async markAllAsRead(): Promise<void> {
    // return httpClient.patch('/notifications/read-all');
    const sessionUserId = getSessionUserId();
    for (const notification of mockNotifications) {
      if (!sessionUserId || notification.userId === sessionUserId) {
        notification.read = true;
      }
    }
    return delay(500, undefined);
  }

  async create(input: CreateNotificationInput): Promise<void> {
    // return httpClient.post('/notifications', input);
    // In production the backend fans this out to every recipient; the mock
    // writes one joined row per recipient into the shared store.
    if (!input.recipientIds.length) return;
    const createdAt = new Date().toISOString();
    input.recipientIds.forEach((recipientId, index) => {
      const notificationId = `n-${Date.now()}-${index}`;
      mockNotifications.push({
        id: `notif-${notificationId}-${recipientId}`,
        notificationId,
        userId: recipientId,
        read: false,
        topic: input.topic,
        title: input.title,
        body: input.body,
        relatedEntityId: input.relatedEntityId ?? null,
        createdAt,
      });
    });
    return delay(200, undefined);
  }
}

export const notificationService = new NotificationService();
