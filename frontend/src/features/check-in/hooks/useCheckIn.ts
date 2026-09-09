"use client";
import { useState } from "react";
import { checkMember, recordMemberActivity } from "../services/checkInApi";
import type { MemberStatus } from "../types/status";
import { getUserFacingError } from "@/lib/userFacingError";
export function useCheckIn() { const [result, setResult] = useState<MemberStatus | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(memberId: string, action: "check-in" | "check-out" = "check-in"): Promise<MemberStatus | null> { setLoading(true); setError(""); setResult(null); try { const member = await checkMember(memberId); if (member.status === "expired") { setResult(member); setError("Membership expired. Check-in and check-out are unavailable."); return member; } const activity = await recordMemberActivity(memberId, action); setResult(activity); return activity; } catch (e) { setError(getUserFacingError(e, "We couldn't record this activity. Please try again.")); return null; } finally { setLoading(false); } }
  function reset() { setResult(null); setError(""); }
  return { result, error, loading, submit, reset }; }
