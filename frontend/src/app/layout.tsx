import type { Metadata } from "next";
import "./globals.css";
import "./feature-overrides.css";
import "./registration-reference.css";
export const metadata: Metadata = { title: "Memberly | Membership management" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
