"use client";
import { useState } from "react";
import { registerMember } from "../services/registrationApi";
import type { RegistrationForm } from "../types/registration";
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
      const message = error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "Something went wrong";
      setMessage(message);
      return null;
    } finally {
      setLoading(false);
    }
  }
  return { loading, message, submit };
}
