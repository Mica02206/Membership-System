"use client";

import {
  BadgeCheck,
  Check,
  Clock3,
  Delete,
  KeyRound,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCheckIn } from "@/features/check-in/hooks/useCheckIn";
import type { MemberStatus } from "@/features/check-in/types/status";

const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "CLR"];
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const FLOOR_CAPACITY = 50;
const packageBenefits: Record<string, string[]> = {
  "Individual Student": [
    "Free Trainer Assistance",
    "Experienced Coaches",
    "Clean & Safe Facility",
    "Top-Notch Equipment",
  ],
  "Individual Professional": [
    "Free Trainer Assistance",
    "Experienced Coaches",
    "Clean & Safe Facility",
    "Top-Notch Equipment",
  ],
  "Walk-in": [
    "Single session access",
    "Clean & Safe Facility",
    "Top-Notch Equipment",
  ],
  "Barkada Group of 3 Professional": [
    "Free Body Fat Assessment",
    "Free Trainer Assistance",
    "Free Workout Program",
    "Unlimited Gym Access",
    "No Lock-in",
    "No Hidden Fees",
  ],
  "Barkada Group of 3 Student": [
    "Free Body Fat Assessment",
    "Free Trainer Assistance",
    "Free Workout Program",
    "Unlimited Gym Access",
    "No Lock-in",
    "No Hidden Fees",
  ],
  "Barkada Group of 5 Professional": [
    "Free Body Fat Assessment",
    "Free Trainer Assistance",
    "Free Workout Program",
    "Unlimited Gym Access",
    "No Lock-in",
    "No Hidden Fees",
  ],
  "Barkada Group of 5 Student": [
    "Free Body Fat Assessment",
    "Free Trainer Assistance",
    "Free Workout Program",
    "Unlimited Gym Access",
    "No Lock-in",
    "No Hidden Fees",
  ],
  "Barkada Group 6+ Professional": [
    "Free Body Fat Assessment",
    "Free Trainer Assistance",
    "Free Workout Program",
    "Unlimited Gym Access",
    "No Lock-in",
    "No Hidden Fees",
  ],
  "Barkada Group 6+ Student": [
    "Free Body Fat Assessment",
    "Free Trainer Assistance",
    "Free Workout Program",
    "Unlimited Gym Access",
    "No Lock-in",
    "No Hidden Fees",
  ],
};
const packagePrices: Record<string, string> = {
  "Individual Student": "₱850",
  "Individual Professional": "₱999",
  "Walk-in": "₱199",
  "Barkada Group of 3 Professional": "₱2,697",
  "Barkada Group of 3 Student": "₱2,250",
  "Barkada Group of 5 Professional": "₱3,995",
  "Barkada Group of 5 Student": "₱3,250",
  "Barkada Group 6+ Professional": "₱4,194",
  "Barkada Group 6+ Student": "₱3,600",
};

const getExpiryDate = (member: { startedAt: string; packageDays: number }) => {
  const expiry = new Date(member.startedAt);
  expiry.setDate(expiry.getDate() + member.packageDays);
  return expiry.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getPictureUrl = (pictureUrl?: string) => {
  if (!pictureUrl) return "";
  if (pictureUrl.startsWith("http") || pictureUrl.startsWith("data:")) return pictureUrl;
  return `${API_URL.replace(/\/api\/?$/, "")}${pictureUrl}`;
};

export default function KioskPage() {
  const [memberId, setMemberId] = useState("");
  const [mode, setMode] = useState<"check-in" | "check-out">("check-in");
  const [action, setAction] = useState<"ready" | "checked-in" | "checked-out">(
    "ready",
  );
  const [countdown, setCountdown] = useState(0);
  const [activeMemberCount, setActiveMemberCount] = useState(0);
  const { result, error, loading, submit, reset } = useCheckIn();

  useEffect(() => {
    let mounted = true;
    const loadCapacity = async () => {
      try {
        const response = await fetch(`${API_URL}/members`);
        if (!response.ok) return;
        const members = (await response.json()) as MemberStatus[];
        if (mounted) {
          setActiveMemberCount(members.filter((member) => member.status === "active").length);
        }
      } catch {
        // Keep the last known capacity when the API is temporarily unavailable.
      }
    };
    loadCapacity();
    const interval = window.setInterval(loadCapacity, 10000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const floorCapacity = Math.min(100, Math.round((activeMemberCount / FLOOR_CAPACITY) * 100));
  const floorFlow = floorCapacity >= 75 ? "Busy flow" : floorCapacity >= 35 ? "Moderate flow" : "Light flow";

  const appendKey = (key: string) => {
    if (key === "CLR") {
      setMemberId("");
    } else {
      setMemberId((current) => `${current}${key}`);
    }
  };

  const removeLast = () => setMemberId((current) => current.slice(0, -1));
  const submitMember = (event: React.FormEvent) => {
    event.preventDefault();
    if (memberId.trim()) submit(memberId.trim(), mode);
  };
  const submitMode = (selectedMode: "check-in" | "check-out") => {
    setMode(selectedMode);
    if (memberId.trim() && !loading) {
      setAction(selectedMode === "check-in" ? "checked-in" : "checked-out");
      setCountdown(8);
      submit(memberId.trim(), selectedMode);
    }
  };
  useEffect(() => {
    if (!countdown) return;
    const timer = window.setInterval(
      () => setCountdown((current) => (current <= 1 ? 0 : current - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [countdown]);
  useEffect(() => {
    if (action !== "ready" && countdown === 0) {
      setMemberId("");
      setAction("ready");
      reset();
    }
  }, [action, countdown, reset]);
  const resetKiosk = () => {
    setMemberId("");
    setAction("ready");
    setCountdown(0);
    reset();
  };

  return (
    <main className="kiosk-shell">
      <div className="kiosk-workspace">
        <header className="kiosk-header">
          <div className="kiosk-brand">
            <a
              className="kiosk-brand-mark"
              href="/"
              aria-label="Return to admin console"
              title="Return to admin console"
              style={{ width: 72, height: 48, background: "transparent" }}
            >
              <img
                src="/sams-slim-gym-logo.png"
                alt="Sam's Slim Gym"
                style={{ width: 72, height: 48, objectFit: "contain", borderRadius: 0 }}
              />
            </a>
            <span>
              <small>Sam's Gym Access</small>
              <strong>Member Kiosk</strong>
            </span>
          </div>
          <div className="kiosk-station" style={{ display: "none" }}>
            <span>●</span> Station #04
          </div>
          <div className="kiosk-clock">
            <Clock3 size={17} />
            <span>
              <strong>
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
              <small>
                {new Date().toLocaleDateString([], {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}
              </small>
            </span>
          </div>
        </header>

        <div className="kiosk-body">
          <section className="kiosk-auth-panel">
            <div className="kiosk-section-label">Authentication</div>
            <div className="kiosk-auth-title">
              <div>
                <h1>Identify Member</h1>
                <p>Enter your member ID to continue.</p>
              </div>
            </div>
            <form onSubmit={submitMember}>
              <div className="kiosk-input-heading">
                <label htmlFor="member-id">Member ID</label>
                <button type="button" onClick={() => setMemberId("MBR-2048")}>
                  Use Demo ID
                </button>
              </div>
              <div className="kiosk-input-wrap">
                <KeyRound size={19} />
                <input
                  id="member-id"
                  value={memberId}
                  onChange={(event) =>
                    setMemberId(event.target.value.toUpperCase())
                  }
                  placeholder="Enter member ID"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={removeLast}
                  aria-label="Delete last character"
                >
                  <Delete size={17} />
                </button>
              </div>
              <div className="kiosk-mode-actions">
                <button
                  type="button"
                  disabled={loading || !memberId.trim()}
                  className={mode === "check-in" ? "selected" : ""}
                  onClick={() => submitMode("check-in")}
                >
                  Check In
                </button>
                <button
                  type="button"
                  disabled={loading || !memberId.trim()}
                  className={
                    mode === "check-out" ? "selected checkout" : "checkout"
                  }
                  onClick={() => submitMode("check-out")}
                >
                  Check Out
                </button>
              </div>
            </form>
            <div className="kiosk-keypad">
              <div className="kiosk-keypad-heading">
                <span>Touch keypad</span>
                <small>Tap to type</small>
              </div>
              <div className="keypad-grid">
                {keypad.map((key) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => appendKey(key)}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
            <div className="kiosk-capacity">
              <ShieldCheck size={19} />
              <span>
                <strong>Club Floor Capacity</strong>
                <small>Currently at {floorCapacity}% capacity · {floorFlow}</small>
              </span>
              <i aria-label={`${floorCapacity}% floor capacity`}>
                <b style={{ width: `${floorCapacity}%` }} />
              </i>
            </div>
          </section>

          <section className="kiosk-result-panel">
            <div className="kiosk-ready-bar">
              <div className="ready-icon">
                <Check size={22} />
              </div>
              <div>
                <strong>
                  {action === "checked-in"
                    ? "Successfully Checked In"
                    : action === "checked-out"
                      ? "Successfully Checked Out"
                      : result
                        ? result.status === "active"
                          ? "Access Approved"
                          : "Membership Expired"
                        : "Ready For Next Member"}
                </strong>
                <small>
                  {action === "checked-in"
                    ? "Access granted for this member."
                    : action === "checked-out"
                      ? "Session finished successfully."
                      : result
                        ? "Member record found"
                        : "Enter a member ID to view access details."}
                </small>
              </div>
              <div className="terminal-reset">
                <small>Terminal reset</small>
                <strong>
                  {countdown
                    ? `${String(countdown).padStart(2, "0")}s`
                    : "Ready"}
                </strong>
                <button type="button" onClick={resetKiosk}>
                  Done
                </button>
              </div>
            </div>
            {result ? (
              <div className={`member-result ${result.status}`}>
                <div className="member-overview">
                  <div className="member-avatar">
                    {getPictureUrl(result.member.pictureUrl) ? (
                      <img
                        src={getPictureUrl(result.member.pictureUrl)}
                        alt={`${result.member.fullName} profile`}
                      />
                    ) : (
                      result.member.fullName
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                    )}
                  </div>
                  <div className="member-identity">
                    <h2>{result.member.fullName}</h2>
                    <span className="member-status">
                      <BadgeCheck size={13} />{" "}
                      {result.status === "active" ? "Active" : "Expired"} ·{" "}
                      {result.member.packageName}
                    </span>
                    <small>#{result.member.memberId}</small>
                    <p>⌖ Sam's Slim Gym</p>
                  </div>
                  <div className="subscription-health-card">
                    <div className="subscription-health-heading">
                      <span>Active Subscription</span>
                      <b className={result.status === "active" ? "active" : "expired"}>
                        {result.status}
                      </b>
                    </div>
                    <strong className="subscription-health-package">{result.member.packageName}</strong>
                    <div className="subscription-health-price">
                      <strong>{packagePrices[result.member.packageName] ?? ""}</strong>
                      <span>{result.member.packageDays === 1 ? "/ session" : "/ month (Auto-Renew)"}</span>
                    </div>
                    <div className="subscription-health-validity">
                      <span>Cycle Validity</span>
                      <strong>{result.daysLeft} Days Left (Valid till {getExpiryDate(result.member)})</strong>
                    </div>
                    <div className="subscription-health-progress">
                      <i style={{ width: `${Math.min(100, Math.max(0, (result.daysLeft / result.member.packageDays) * 100))}%` }} />
                    </div>
                  </div>
                </div>
                <div className="member-details">
                  <div>
                    <Phone size={18} />
                    <span>
                      <small>Primary phone</small>
                      <strong>{result.member.contact}</strong>
                      <small>Emergency contact linked</small>
                    </span>
                  </div>
                  <div>
                    <MapPin size={18} />
                    <span>
                      <small>Registered residence</small>
                      <strong>{result.member.address}</strong>
                      <small>Member record verified</small>
                    </span>
                  </div>
                </div>
                <div className="benefits-panel">
                  <div className="benefits-title">
                    <span>
                      <ShieldCheck size={16} /> Package included benefits
                    </span>
                    <b>{result.member.packageName}</b>
                  </div>
                  <div className="benefit-grid">
                    {(packageBenefits[result.member.packageName] ?? []).map(
                      (benefit) => (
                        <span key={benefit}>
                          <Check size={14} /> {benefit}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="kiosk-empty">
                <KeyRound size={44} />
                <h2>Enter a member ID</h2>
                <p>
                  The member profile, package health, and access details will
                  appear here.
                </p>
              </div>
            )}
            {error && <p className="kiosk-error">{error}</p>}
          </section>
        </div>
      </div>
    </main>
  );
}
