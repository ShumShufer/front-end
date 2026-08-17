import type { NotificationTopic } from './common.types.ts';

export interface Notification {
  id: string;
  topic: NotificationTopic;
  title: string;
  body: string;
  relatedEntityId?: string | null;
  createdAt: string;
}

export interface NotificationRecipient {
  id: string;
  notificationId: string;
  userId: string;
  read: boolean;
}
