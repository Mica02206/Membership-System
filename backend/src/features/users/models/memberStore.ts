import { randomUUID } from "node:crypto";
import type { Member } from "../types/user.js";

const members = new Map<string, Member>([
  ["MBR-2048", { id: randomUUID(), fullName: "Avery Johnson", memberId: "MBR-2048", contact: "+1 202 555 0148", address: "18 Mercer Street", packageName: "Unlimited 30", packageDays: 30, startedAt: new Date(Date.now() - 6 * 86400000).toISOString() }],
  ["MBR-1182", { id: randomUUID(), fullName: "Jordan Lee", memberId: "MBR-1182", contact: "+1 202 555 0191", address: "42 King Avenue", packageName: "Starter 7", packageDays: 7, startedAt: new Date(Date.now() - 2 * 86400000).toISOString() }]
]);

export const memberStore = {
  all: () => [...members.values()],
  findByMemberId: (memberId: string) => members.get(memberId.toUpperCase()),
  create: (input: Omit<Member, "id" | "startedAt">) => {
    const member: Member = { ...input, id: randomUUID(), startedAt: new Date().toISOString() };
    members.set(member.memberId.toUpperCase(), member);
    return member;
  }
};
