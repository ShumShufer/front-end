import type { IPaymentService } from "./interfaces/IPaymentService.ts";
import type { Payment } from "../types/payment.types.ts";
import type { PaginatedData } from "../types/common.types.ts";
import httpClient from "./api/httpClient.ts";

type PaymentsResponse = { payments?: Payment[]; meta?: PaginatedData<Payment>["meta"] } | Payment[];

class PaymentService implements IPaymentService {
  async getPayments(params?: { userId?: string; status?: string }): Promise<PaginatedData<Payment>> {
    const response = await httpClient.get<PaymentsResponse, PaymentsResponse>("/payments", { params });
    // Interceptor unwraps envelope → data is a raw array
    if (Array.isArray(response)) {
      return { data: response, meta: { total: response.length, page: 1, pageSize: response.length } };
    }
    const r = response as { payments?: Payment[]; meta?: { total?: number; page?: number; limit?: number; pageSize?: number } };
    return {
      data: r.payments ?? [],
      meta: {
        total: r.meta?.total ?? 0,
        page: r.meta?.page ?? 1,
        pageSize: r.meta?.pageSize ?? r.meta?.limit ?? 20,
      },
    };
  }
  async getPaymentById(id: string): Promise<Payment> { return httpClient.get<Payment, Payment>(`/payments/${id}`); }
  async initiatePayment(type: string, amount: number, relatedEntityId?: string): Promise<{ checkoutUrl: string; payment: Payment }> {
    return httpClient.post<{ checkoutUrl: string; payment: Payment }, { checkoutUrl: string; payment: Payment }>("/payments/initiate", { type, amount, relatedEntityId });
  }
  async verifyPayment(txRef: string): Promise<Payment> {
    return httpClient.get<Payment, Payment>(`/payments/verify/${txRef}`);
  }
}

export const paymentService = new PaymentService();
