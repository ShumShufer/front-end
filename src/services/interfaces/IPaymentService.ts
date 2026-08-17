import type { Payment } from '../../types/payment.types.ts';
import type { PaginatedData } from '../../types/common.types.ts';

export interface IPaymentService {
  getPayments(params?: { userId?: string; status?: string }): Promise<PaginatedData<Payment>>;
  getPaymentById(id: string): Promise<Payment>;
  initiatePayment(type: string, amount: number, relatedEntityId?: string): Promise<{ checkoutUrl: string; payment: Payment }>;
}
