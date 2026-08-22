export function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (code === "NETWORK_ERROR") return "We could not reach the service. Check your connection and try again.";
    if (code === "TOKEN_EXPIRED" || code === "INVALID_TOKEN") return "Your session has ended. Please sign in again.";
    if (code === "UNAUTHORIZED" || code === "FORBIDDEN") return "You do not have permission to complete that action.";
    if (code === "NOT_FOUND") return "The requested item is no longer available.";
    if (code === "VALIDATION_ERROR") return "Please review the highlighted information and try again.";
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
