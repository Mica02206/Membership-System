import type { MemberStatus } from "../types/status";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
export async function checkMember(memberId: string): Promise<MemberStatus> {
  const response = await fetch(`${API_URL}/members/${encodeURIComponent(memberId)}/status`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message ?? "We couldn't find that member ID");
  }
  return response.json();
}

export async function recordMemberActivity(memberId: string, action: "check-in" | "check-out"): Promise<MemberStatus> {
  const response = await fetch(`${API_URL}/members/${encodeURIComponent(memberId)}/activity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message ?? "We couldn't find that member ID");
  }
  return response.json();
}
