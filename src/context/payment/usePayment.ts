import { useContext } from "react";
import { PaymentContext, type PaymentContextType } from "./PaymentContext.tsx";

export function usePayment(): PaymentContextType {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
}
