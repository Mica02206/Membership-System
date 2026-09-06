import fs from "node:fs";
import path from "node:path";
import type { Request, Response } from "express";
import { memberStore } from "../models/memberStore.js";
import { registerMember, renewMemberPass, updateMemberPicture, updateMember, deleteMember, toStatus, recordMemberActivity } from "../services/memberService.js";

function savePictureFromRequest(request: Request): string | undefined {
  if (request.file) {
    return `/uploads/${request.file.filename}`;
  }
  const rawDataUrl = request.body?.pictureDataUrl || request.body?.picture;
  if (typeof rawDataUrl === "string" && rawDataUrl.startsWith("data:image")) {
    try {
      const match = rawDataUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      const ext = match ? `.${match[1] === "jpeg" ? "jpg" : match[1]}` : ".jpg";
      const base64Data = match ? match[2] : rawDataUrl.split(",")[1];
      if (base64Data) {
        const filename = `picture-${Date.now()}-${Math.floor(Math.random() * 1e9)}${ext}`;
        const filePath = path.resolve("uploads", filename);
        fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
        return `/uploads/${filename}`;
      }
    } catch {}
  }
  return undefined;
}

export function listMembers(_request: Request, response: Response) { response.json(memberStore.all().map(toStatus)); }
export function checkMember(request: Request, response: Response) {
  const memberId = Array.isArray(request.params.memberId) ? request.params.memberId[0] : request.params.memberId;
  const member = memberStore.findByMemberId(memberId);
  if (!member) return response.status(404).json({ message: "Member not found" });
  return response.json(toStatus(member));
}
export function recordActivity(request: Request, response: Response) {
  try {
    const memberId = Array.isArray(request.params.memberId) ? request.params.memberId[0] : request.params.memberId;
    const action = request.body?.action;
    if (action !== "check-in" && action !== "check-out") return response.status(400).json({ message: "Activity must be check-in or check-out" });
    return response.json(recordMemberActivity(memberId, action));
  } catch (error) {
    return response.status(404).json({ message: error instanceof Error ? error.message : "Unable to record member activity" });
  }
}
export function createMember(request: Request, response: Response) {
  try {
    const { fullName, memberId, contact, address, packageName, packageDays } = request.body;
    if (!fullName || !memberId || !contact || !address || !packageName || !Number(packageDays)) return response.status(400).json({ message: "All registration fields are required" });
    const pictureUrl = savePictureFromRequest(request);
    const member = registerMember({ fullName, memberId, contact, address, packageName, packageDays: Number(packageDays), pictureUrl });
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
    const pictureUrl = savePictureFromRequest(request);
    if (!pictureUrl) return response.status(400).json({ message: "No picture file provided" });
    const member = updateMemberPicture(memberId, pictureUrl);
    return response.json(toStatus(member));
  } catch (error) {
    return response.status(404).json({ message: error instanceof Error ? error.message : "Unable to update member photo" });
  }
}
export function editMember(request: Request, response: Response) {
  try {
    const memberId = Array.isArray(request.params.memberId) ? request.params.memberId[0] : request.params.memberId;
    const { fullName, contact, address, packageName, packageDays, startedAt } = request.body;
    const updated = updateMember(memberId, { fullName, contact, address, packageName, packageDays: packageDays ? Number(packageDays) : undefined, startedAt });
    return response.json(toStatus(updated));
  } catch (error) {
    return response.status(404).json({ message: error instanceof Error ? error.message : "Unable to update member" });
  }
}
export function removeMember(request: Request, response: Response) {
  try {
    const memberId = Array.isArray(request.params.memberId) ? request.params.memberId[0] : request.params.memberId;
    const ok = deleteMember(memberId);
    if (!ok) return response.status(404).json({ message: "Member not found" });
    return response.json({ success: true });
  } catch (error) {
    return response.status(500).json({ message: error instanceof Error ? error.message : "Unable to delete member" });
  }
}


