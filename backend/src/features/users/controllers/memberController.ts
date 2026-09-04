import type { Request, Response } from "express";
import { memberStore } from "../models/memberStore.js";
import { registerMember, renewMemberPass, updateMemberPicture, toStatus } from "../services/memberService.js";

export function listMembers(_request: Request, response: Response) { response.json(memberStore.all().map(toStatus)); }
export function checkMember(request: Request, response: Response) {
  const memberId = Array.isArray(request.params.memberId) ? request.params.memberId[0] : request.params.memberId;
  const member = memberStore.findByMemberId(memberId);
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
export function renewMember(request: Request, response: Response) {
  try {
    const memberId = Array.isArray(request.params.memberId) ? request.params.memberId[0] : request.params.memberId;
    const days = request.body?.days ? Number(request.body.days) : undefined;
    const member = renewMemberPass(memberId, days);
    return response.json(toStatus(member));
  } catch (error) {
    return response.status(404).json({ message: error instanceof Error ? error.message : "Unable to renew member pass" });
  }
}
export function uploadMemberPicture(request: Request, response: Response) {
  try {
    const memberId = Array.isArray(request.params.memberId) ? request.params.memberId[0] : request.params.memberId;
    if (!request.file) return response.status(400).json({ message: "No picture file provided" });
    const pictureUrl = `/uploads/${request.file.filename}`;
    const member = updateMemberPicture(memberId, pictureUrl);
    return response.json(toStatus(member));
  } catch (error) {
    return response.status(404).json({ message: error instanceof Error ? error.message : "Unable to update member photo" });
  }
}


