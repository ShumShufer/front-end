import type { PaymentType, PaymentStatus } from './common.types.ts';

export interface Payment {
  id: string;
  userId: string;
  type: PaymentType;
  amount: number;
  commission: number;
  status: PaymentStatus;
  chapaTxRef?: string | null;
  relatedEntityId?: string | null;
  createdAt: string;
}
