import type { Metadata } from "next";
import "./globals.css";
import "./feature-overrides.css";
import "./registration-reference.css";
import "./sidebar-collapse.css";
import "./camera-capture.css";
import "./kiosk/kiosk.css";
import "./kiosk/kiosk-full-width.css";
import "./kiosk/result-reference.css";
import "./kiosk/showcase-reference.css";
import "./kiosk/showcase-responsive.css";
import "./kiosk/showcase-collision-fix.css";
import "./kiosk/desktop-reference.css";
import "./kiosk/showcase-compact.css";
import "./kiosk/health-card-compact.css";
import "./kiosk/health-card-width.css";
import "./enrollments/enrollments.css";
export const metadata: Metadata = { title: "Memberly | Membership management" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
