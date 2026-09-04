"use client";
import { useState } from "react";
import { checkMember } from "../services/checkInApi";
import type { MemberStatus } from "../types/status";
export function useCheckIn() { const [result, setResult] = useState<MemberStatus | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(memberId: string) { setLoading(true); setError(""); setResult(null); try { setResult(await checkMember(memberId)); } catch (e) { setError(e instanceof Error ? e.message : "Unable to check in"); } finally { setLoading(false); } }
  function reset() { setResult(null); setError(""); }
  return { result, error, loading, submit, reset }; }
