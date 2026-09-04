import type { MemberStatus } from "../types/status";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
export async function checkMember(memberId: string): Promise<MemberStatus> {
  const response = await fetch(`${API_URL}/members/${encodeURIComponent(memberId)}/status`);
  if (!response.ok) throw new Error("We couldn't find that member ID");
  return response.json();
}
