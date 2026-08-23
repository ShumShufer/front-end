interface ApiErrorLike {
  code?: unknown;
  message?: unknown;
}

/**
 * Codes whose server-provided message is safe and useful to show verbatim
 * (the backend curates these strings, e.g. "Invalid email/phone or password").
 */
const SERVER_MESSAGE_CODES = new Set([
  "UNAUTHORIZED",
  "REQUEST_FAILED",
  "UNKNOWN_ERROR",
]);

export function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const { code, message } = error as ApiErrorLike;
    if (code === "NETWORK_ERROR") return "We could not reach the service. Check your connection and try again.";
    if (code === "TOKEN_EXPIRED" || code === "INVALID_TOKEN") return "Your session has ended. Please sign in again.";
    if (code === "FORBIDDEN") return "You do not have permission to complete that action.";
    if (code === "NOT_FOUND") return "The requested item is no longer available.";
    if (code === "VALIDATION_ERROR") return "Please review the highlighted information and try again.";

    // Structured API errors carry user-facing messages from our backend.
    // Prefer them so flows like login show the real reason ("Invalid
    // email/phone or password") instead of a generic permission line.
    if (
      typeof code === "string" &&
      SERVER_MESSAGE_CODES.has(code) &&
      typeof message === "string" &&
      message.trim()
    ) {
      return message;
    }
  }

  if (error instanceof Error) {
    return fallback;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string") {
      // API messages can contain implementation details. Only use the
      // caller-supplied, user-safe fallback for unclassified failures.
      return fallback;
    }
  }

  return fallback;
}
