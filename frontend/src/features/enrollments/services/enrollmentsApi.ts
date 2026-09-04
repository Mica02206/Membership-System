import type { MemberStatus } from "@/features/check-in/types/status";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function fetchMembers(): Promise<MemberStatus[]> {
  const response = await fetch(`${API_URL}/members`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message ?? "Unable to load members directory");
  }
  return response.json();
}

export async function fetchMemberStatus(memberId: string): Promise<MemberStatus> {
  const response = await fetch(`${API_URL}/members/${encodeURIComponent(memberId)}/status`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message ?? `Unable to fetch status for ${memberId}`);
  }
  return response.json();
}

export async function renewMemberPass(memberId: string, days?: number): Promise<MemberStatus> {
  const response = await fetch(`${API_URL}/members/${encodeURIComponent(memberId)}/renew`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ days }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message ?? `Unable to renew pass for ${memberId}`);
  }
  return response.json();
}

export async function uploadMemberPictureApi(memberId: string, picture: File): Promise<MemberStatus> {
  const formData = new FormData();
  formData.append("picture", picture);
  const response = await fetch(`${API_URL}/members/${encodeURIComponent(memberId)}/picture`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message ?? `Unable to update photo for ${memberId}`);
  }
  return response.json();
}

