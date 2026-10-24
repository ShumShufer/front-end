import type {
  Notification,
  NotificationRecipient,
} from "../../types/notification.types.ts";
import type {
  NotificationTopic,
  PaginatedData,
} from "../../types/common.types.ts";

export interface CreateNotificationInput {
  topic: NotificationTopic;
  title: string;
  body: string;
  recipientIds: string[];
  relatedEntityId?: string | null;
}

export interface INotificationService {
  getNotifications(params?: {
    unreadOnly?: boolean;
  }): Promise<PaginatedData<Notification & NotificationRecipient>>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  create(input: CreateNotificationInput): Promise<void>;
}
