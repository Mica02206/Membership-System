import type { RegistrationForm } from "../types/registration";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
export async function registerMember(form: RegistrationForm) {
  const data = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (value !== undefined && value !== null && (value as unknown) !== "") {
      const val = value as unknown;
      if (val instanceof File || val instanceof Blob) {
        data.append(key, val, val instanceof File ? val.name : "webcam-snapshot.jpg");
      } else {
        data.append(key, String(value));
      }
    }
  });
  const response = await fetch(`${API_URL}/members`, { method: "POST", body: data });
  if (!response.ok) throw new Error((await response.json()).message ?? "Could not register member");
  return response.json();
}
