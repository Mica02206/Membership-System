import type { MemberStatus } from "../types/status";
export async function checkMember(memberId: string): Promise<MemberStatus> {
  const { fetchMemberStatusDirect } = await import("@/lib/memberData");
  return fetchMemberStatusDirect(memberId);
}

export async function recordMemberActivity(memberId: string, action: "check-in" | "check-out"): Promise<MemberStatus> {
  const { recordMemberActivityDirect } = await import("@/lib/memberData");
  return recordMemberActivityDirect(memberId, action);
}
