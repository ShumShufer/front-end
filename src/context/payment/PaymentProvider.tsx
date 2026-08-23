import React, { useReducer, useCallback } from "react";
import { PaymentContext, type PaymentState } from "./PaymentContext.tsx";
import { paymentService } from "../../services/index.ts";
import type { Payment } from "../../types/payment.types.ts";
import type { PaginatedData } from "../../types/common.types.ts";
import { getErrorMessage } from "../../utils/errors.ts";

type PaymentAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_PAYMENTS_SUCCESS"; payload: PaginatedData<Payment> }
  | { type: "FETCH_PAYMENT_SUCCESS"; payload: Payment }
  | {
      type: "INITIATE_PAYMENT_SUCCESS";
      payload: { checkoutUrl: string; payment: Payment };
    }
  | { type: "FETCH_ERROR"; payload: string };

function paymentReducer(
  state: PaymentState,
  action: PaymentAction,
): PaymentState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_PAYMENTS_SUCCESS":
      return { ...state, isLoading: false, payments: action.payload };
    case "FETCH_PAYMENT_SUCCESS":
      return { ...state, isLoading: false, activePayment: action.payload };
    case "INITIATE_PAYMENT_SUCCESS":
      return {
        ...state,
        isLoading: false,
        checkoutUrl: action.payload.checkoutUrl,
        activePayment: action.payload.payment,
      };
    case "FETCH_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(paymentReducer, {
    payments: null,
    activePayment: null,
    checkoutUrl: null,
    isLoading: false,
    error: null,
  });

  const loadPayments = useCallback(
    async (params?: { userId?: string; status?: string }) => {
      dispatch({ type: "FETCH_START" });
      try {
        const data = await paymentService.getPayments(params);
        dispatch({ type: "FETCH_PAYMENTS_SUCCESS", payload: data });
      } catch (error: unknown) {
        dispatch({
          type: "FETCH_ERROR",
          payload: getErrorMessage(error, "Failed to load payments"),
        });
      }
    },
    [],
  );

  const loadPaymentById = useCallback(async (id: string) => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await paymentService.getPaymentById(id);
      dispatch({ type: "FETCH_PAYMENT_SUCCESS", payload: data });
    } catch (error: unknown) {
      dispatch({
        type: "FETCH_ERROR",
        payload: getErrorMessage(error, "Failed to load payment"),
      });
    }
  }, []);

  const initiatePayment = useCallback(
    async (type: string, amount: number, relatedEntityId?: string) => {
      dispatch({ type: "FETCH_START" });
      try {
        const data = await paymentService.initiatePayment(
          type,
          amount,
          relatedEntityId,
        );
        dispatch({ type: "INITIATE_PAYMENT_SUCCESS", payload: data });
      } catch (error: unknown) {
        dispatch({
          type: "FETCH_ERROR",
          payload: getErrorMessage(error, "Failed to initiate payment"),
        });
        throw error;
      }
    },
    [],
  );

  return (
    <PaymentContext.Provider
      value={{
        ...state,
        loadPayments,
        loadPaymentById,
        initiatePayment,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};
