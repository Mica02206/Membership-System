import type { Member } from "../types/user.js";
import { memberStore } from "../models/memberStore.js";

export function toStatus(member: Member) {
  const elapsed = Math.floor((Date.now() - new Date(member.startedAt).getTime()) / 86400000);
  const daysLeft = Math.max(0, member.packageDays - elapsed);
  return { member: { fullName: member.fullName, memberId: member.memberId, packageName: member.packageName }, status: daysLeft > 0 ? "active" : "expired", daysLeft };
}

export function registerMember(input: Omit<Member, "id" | "startedAt">) {
  if (memberStore.findByMemberId(input.memberId)) throw new Error("A member with that ID already exists");
  return memberStore.create(input);
}
