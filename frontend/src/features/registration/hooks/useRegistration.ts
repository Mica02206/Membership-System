"use client";
import { useState } from "react";
import { registerMember } from "../services/registrationApi";
import type { RegistrationForm } from "../types/registration";
export function useRegistration() {
  const [loading, setLoading] = useState(false); const [message, setMessage] = useState("");
  async function submit(form: RegistrationForm) { setLoading(true); setMessage(""); try { await registerMember(form); setMessage("Member profile created"); return true; } catch (error) { setMessage(error instanceof Error ? error.message : "Something went wrong"); return false; } finally { setLoading(false); } }
  return { loading, message, submit };
}
