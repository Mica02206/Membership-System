"use client";
import { useState } from "react";
import { registerMember } from "../services/registrationApi";
import type { RegistrationForm } from "../types/registration";
import { getUserFacingError } from "@/lib/userFacingError";
export function useRegistration() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(form: RegistrationForm) {
    setLoading(true);
    setMessage("");
    try {
      const created = await registerMember(form);
      setMessage("Member profile created successfully");
      return created;
    } catch (error) {
      setMessage(getUserFacingError(error, "We couldn't register this member. Please check the details and try again."));
      return null;
    } finally {
      setLoading(false);
    }
  }
  return { loading, message, submit };
}
