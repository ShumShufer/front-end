import type { IPaymentService } from './interfaces/IPaymentService.ts';
import type { Payment } from '../types/payment.types.ts';
import type { PaginatedData } from '../types/common.types.ts';
import { PaymentType, PaymentStatus } from '../types/common.types.ts';
import { mockPayments } from './mockData.ts';
import { parsePaymentType } from '../utils/typeGuards.ts';
// import httpClient from './api/httpClient.ts';

const delay = <T>(ms: number, value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

class PaymentService implements IPaymentService {
  async getPayments(params?: { userId?: string; status?: string }): Promise<PaginatedData<Payment>> {
    // return httpClient.get('/payments', { params });
    let filtered = mockPayments;
    if (params?.userId) filtered = filtered.filter(p => p.userId === params.userId);
    if (params?.status) filtered = filtered.filter(p => p.status === params.status);

    return delay(500, {
      data: filtered,
      meta: { page: 1, pageSize: 10, total: filtered.length },
    });
  }

  async getPaymentById(id: string): Promise<Payment> {
    // return httpClient.get(`/payments/${id}`);
    const payment = mockPayments.find(p => p.id === id);
    if (!payment) throw new Error('Payment not found');
    return delay(400, payment);
  }

  async initiatePayment(
    type: string,
    amount: number,
    relatedEntityId?: string,
  ): Promise<{ checkoutUrl: string; payment: Payment }> {
    // return httpClient.post('/payments/initiate', { type, amount, relatedEntityId });
    const payment: Payment = {
      id: `payment-${Date.now()}`,
      userId: 'user-2', // mocked active user
      type: parsePaymentType(type, PaymentType.ENROLLMENT),
      amount,
      commission: amount * 0.1,
      status: PaymentStatus.PENDING,
      relatedEntityId: relatedEntityId ?? null,
      chapaTxRef: `TX-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    mockPayments.push(payment);
    return delay(800, {
      checkoutUrl: 'https://checkout.chapa.co/checkout/mock-url',
      payment,
    });
  }
}

export const paymentService = new PaymentService();
