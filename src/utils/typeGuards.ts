import {
  Role,
  ApplicationMode,
  PaymentType,
  type Role as RoleType,
  type ApplicationMode as ApplicationModeType,
  type PaymentType as PaymentTypeValue,
} from "../types/common.types.ts";

const roleValues = new Set<string>(Object.values(Role));
const applicationModeValues = new Set<string>(Object.values(ApplicationMode));
const paymentTypeValues = new Set<string>(Object.values(PaymentType));

export function isRole(value: string): value is RoleType {
  return roleValues.has(value);
}

export function parseRole(
  value: string | undefined,
  fallback: RoleType,
): RoleType {
  if (value && isRole(value)) {
    return value;
  }
  return fallback;
}

export function isApplicationMode(value: string): value is ApplicationModeType {
  return applicationModeValues.has(value);
}

export function parseApplicationMode(
  value: string,
  fallback: ApplicationModeType,
): ApplicationModeType {
  if (isApplicationMode(value)) {
    return value;
  }
  return fallback;
}

export function isPaymentType(value: string): value is PaymentTypeValue {
  return paymentTypeValues.has(value);
}

export function parsePaymentType(
  value: string,
  fallback: PaymentTypeValue,
): PaymentTypeValue {
  if (isPaymentType(value)) {
    return value;
  }
  return fallback;
}
