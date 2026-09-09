export function getUserFacingError(error: unknown, fallback = "We couldn't complete the request. Please try again.") {
  const detail = error instanceof Error
    ? error.message
    : typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : "";

  if (detail) console.error(detail);

  const normalized = detail.toLowerCase();
  if (normalized.includes("duplicate key") || normalized.includes("members_member_id_key")) {
    return "This member ID is already registered. Please use a different member ID.";
  }
  if (normalized.includes("photo upload") || normalized.includes("storage policy")) {
    return "We couldn't save the member photo. Please try again.";
  }
  if (normalized.includes("rls") || normalized.includes("row-level security") || normalized.includes("policy")) {
    return "You don't have permission to complete this action. Please sign in again or contact an administrator.";
  }
  if (normalized.includes("invalid login") || normalized.includes("invalid credentials") || normalized.includes("invalid email or password")) {
    return "The email or password is incorrect. Please try again.";
  }
  return fallback;
}
