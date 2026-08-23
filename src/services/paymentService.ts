import type { IPaymentService } from "./interfaces/IPaymentService.ts";
import type { Payment } from "../types/payment.types.ts";
import type { PaginatedData } from "../types/common.types.ts";
import httpClient from "./api/httpClient.ts";

type PaymentsResponse = { payments: Payment[]; meta: PaginatedData<Payment>["meta"] };

class PaymentService implements IPaymentService {
  async getPayments(params?: { userId?: string; status?: string }): Promise<PaginatedData<Payment>> {
    const response = await httpClient.get<PaymentsResponse, PaymentsResponse>("/payments", { params });
    return { data: response.payments, meta: response.meta };
  }
  async getPaymentById(id: string): Promise<Payment> { return httpClient.get<Payment, Payment>(`/payments/${id}`); }
  async initiatePayment(type: string, amount: number, relatedEntityId?: string): Promise<{ checkoutUrl: string; payment: Payment }> {
    return httpClient.post<{ checkoutUrl: string; payment: Payment }, { checkoutUrl: string; payment: Payment }>("/payments/initiate", { type, amount, relatedEntityId });
  }
}

export const paymentService = new PaymentService();
