import type { Member } from "../types/user.js";
import { memberStore } from "../models/memberStore.js";

export function toStatus(member: Member) {
  const elapsed = Math.floor((Date.now() - new Date(member.startedAt).getTime()) / 86400000);
  const daysLeft = Math.min(member.packageDays, Math.max(0, member.packageDays - elapsed));
  return { member: { fullName: member.fullName, memberId: member.memberId, packageName: member.packageName, contact: member.contact, address: member.address, packageDays: member.packageDays, startedAt: member.startedAt, ...(member.pictureUrl ? { pictureUrl: member.pictureUrl } : {}) }, status: daysLeft > 0 ? "active" : "expired", daysLeft };
}

export function registerMember(input: Omit<Member, "id" | "startedAt">) {
  if (memberStore.findByMemberId(input.memberId)) throw new Error("A member with that ID already exists");
  return memberStore.create(input);
}

export function renewMemberPass(memberId: string, days?: number) {
  const member = memberStore.renew(memberId, days);
  if (!member) throw new Error("Member not found");
  return member;
}

export function updateMemberPicture(memberId: string, pictureUrl: string) {
  const member = memberStore.updatePicture(memberId, pictureUrl);
  if (!member) throw new Error("Member not found");
  return member;
}

export function updateMember(memberId: string, fields: Partial<Omit<import("../types/user.js").Member, "id" | "memberId">>) {
  const member = memberStore.update(memberId, fields);
  if (!member) throw new Error("Member not found");
  return member;
}

export function deleteMember(memberId: string): boolean {
  return memberStore.delete(memberId);
}

