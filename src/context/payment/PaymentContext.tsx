import { createContext } from 'react';
import type { Payment } from '../../types/payment.types.ts';
import type { PaginatedData } from '../../types/common.types.ts';

export interface PaymentState {
  payments: PaginatedData<Payment> | null;
  activePayment: Payment | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface PaymentContextType extends PaymentState {
  loadPayments: (params?: { userId?: string; status?: string }) => Promise<void>;
  loadPaymentById: (id: string) => Promise<void>;
  initiatePayment: (type: string, amount: number, relatedEntityId?: string) => Promise<void>;
}

export const PaymentContext = createContext<PaymentContextType | null>(null);
