import type { RegistrationForm } from "../types/registration";
export async function registerMember(form: RegistrationForm) {
  const { createMemberDirect } = await import("@/lib/memberData");
  return createMemberDirect(form);
}
