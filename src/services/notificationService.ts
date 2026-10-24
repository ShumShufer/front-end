import type { INotificationService, CreateNotificationInput } from "./interfaces/INotificationService.ts";
import type { Notification, NotificationRecipient } from "../types/notification.types.ts";
import type { PaginatedData } from "../types/common.types.ts";
import httpClient from "./api/httpClient.ts";

type NotificationItem = { recipientId: string; read: boolean; notification: Notification };
type NotificationResponse = { notifications: NotificationItem[]; meta: PaginatedData<Notification & NotificationRecipient>["meta"] };

class NotificationService implements INotificationService {
  async getNotifications(params?: { unreadOnly?: boolean }): Promise<PaginatedData<Notification & NotificationRecipient>> {
    const response = await httpClient.get<
      NotificationItem[] | NotificationResponse,
      NotificationItem[] | NotificationResponse
    >("/notifications", { params: { unreadOnly: params?.unreadOnly?.toString() } });
    const list: NotificationItem[] = Array.isArray(response)
      ? response
      : (response.notifications ?? []);
    return {
      data: list.map(({ recipientId, read, notification }) => ({
        ...notification,
        id: recipientId,
        notificationId: notification.id,
        userId: "",
        read,
      })),
      meta: Array.isArray(response)
        ? { page: 1, pageSize: list.length, total: list.length }
        : response.meta ?? { page: 1, pageSize: list.length, total: list.length },
    };
  }
  async markAsRead(id: string): Promise<void> { await httpClient.patch<void, void>(`/notifications/${id}/read`); }
  async markAllAsRead(): Promise<void> { await httpClient.patch<void, void>("/notifications/read-all"); }
  async create(input: CreateNotificationInput): Promise<void> { await httpClient.post<void, void>("/notifications", { ...input, recipientUserIds: input.recipientIds }); }
}

export const notificationService = new NotificationService();
