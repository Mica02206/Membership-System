import type { Request, Response } from "express";
import { memberStore } from "../models/memberStore.js";
import { registerMember, toStatus } from "../services/memberService.js";

export function listMembers(_request: Request, response: Response) { response.json(memberStore.all().map(toStatus)); }
export function checkMember(request: Request, response: Response) {
  const member = memberStore.findByMemberId(request.params.memberId);
  if (!member) return response.status(404).json({ message: "Member not found" });
  return response.json(toStatus(member));
}
export function createMember(request: Request, response: Response) {
  try {
    const { fullName, memberId, contact, address, packageName, packageDays } = request.body;
    if (!fullName || !memberId || !contact || !address || !packageName || !Number(packageDays)) return response.status(400).json({ message: "All registration fields are required" });
    const member = registerMember({ fullName, memberId, contact, address, packageName, packageDays: Number(packageDays), pictureUrl: request.file ? `/uploads/${request.file.filename}` : undefined });
    return response.status(201).json(toStatus(member));
  } catch (error) { return response.status(409).json({ message: error instanceof Error ? error.message : "Unable to register member" }); }
}
