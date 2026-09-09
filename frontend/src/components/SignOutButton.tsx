"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function SignOutButton() {
  const router = useRouter();
  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return <button type="button" className="sign-out-button" onClick={signOut}><LogOut size={14} /> Sign out</button>;
}
