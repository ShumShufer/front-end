import { IPaymentService } from '../interfaces/IPaymentService';
import { Payment, BillingHistory, PaymentStatus } from '../../types/payment.types';

export const mockPaymentService: IPaymentService = {
  async initiatePayment(amount: number, description: string): Promise<any> {
    return {
      transactionId: '1',
      status: 'PENDING',
      amount,
      description,
    };
  },

  async getPaymentStatus(transactionId: string): Promise<Payment> {
    return {
      id: transactionId,
      studentId: '1',
      amount: 0,
      currency: 'ETB',
      status: PaymentStatus.PENDING,
      description: '',
      createdAt: new Date(),
    };
  },

  async getBillingHistory(_studentId: string): Promise<BillingHistory[]> {
    return [];
  },

  async getPaymentHistory(_studentId: string): Promise<Payment[]> {
    return [];
  },
};
