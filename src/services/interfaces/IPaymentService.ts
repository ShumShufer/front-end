import { Payment, BillingHistory } from '../../types/payment.types';

export interface IPaymentService {
  initiatePayment(amount: number, description: string): Promise<any>;
  getPaymentStatus(transactionId: string): Promise<Payment>;
  getBillingHistory(studentId: string): Promise<BillingHistory[]>;
  getPaymentHistory(studentId: string): Promise<Payment[]>;
}
