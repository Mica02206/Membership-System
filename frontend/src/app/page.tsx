"use client";

import {
  BadgeCheck,
  ClipboardList,
  CircleGauge,
  ContactRound,
  Cpu,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  UserRoundPlus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RegistrationForm } from "@/features/registration/components/RegistrationForm";
import type { RegistrationForm as RegistrationFormData } from "@/features/registration/types/registration";
import { ThemeToggle } from "@/shared/components/ThemeToggle";

import type { MemberStatus } from "@/features/check-in/types/status";

type RecentMember = { fullName: string; memberId: string; packageName: string; pictureUrl?: string; registeredAt?: string };
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const getPictureUrl = (pictureUrl?: string) => {
  if (!pictureUrl) return "";
  if (pictureUrl.startsWith("http") || pictureUrl.startsWith("data:")) return pictureUrl;
  return `${API_URL.replace(/\/api\/?$/, "")}${pictureUrl}`;
};

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [recentMembers, setRecentMembers] = useState<RecentMember[]>([]);
  const [dbMembers, setDbMembers] = useState<MemberStatus[]>([]);
  const [preview, setPreview] = useState<{
    form: RegistrationFormData;
    expiry: string;
  }>({
    form: {
      fullName: "",
      memberId: "",
      contact: "",
      address: "",
      packageName: "Individual Student",
      packageDays: "30",
    },
    expiry: "",
  });
  const [previewPictureUrl, setPreviewPictureUrl] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/members`);
      if (res.ok) {
        const data = (await res.json()) as MemberStatus[];
        setDbMembers(data);
        const today = new Date().toDateString();
        setRecentMembers(
          data
            .filter((item) => item.member.registeredAt && new Date(item.member.registeredAt).toDateString() === today)
            .map((item) => ({
              fullName: item.member.fullName,
              memberId: item.member.memberId,
              packageName: item.member.packageName,
              pictureUrl: getPictureUrl(item.member.pictureUrl),
              registeredAt: item.member.registeredAt,
            })),
        );
      }
    } catch {}
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const totalMembersCount = dbMembers.length;
  const newMembersCount = useMemo(() => {
    const todayStr = new Date().toDateString();
    return dbMembers.filter(
      (m) => new Date(m.member.registeredAt ?? m.member.startedAt).toDateString() === todayStr
    ).length;
  }, [dbMembers]);

  const handlePreviewChange = useCallback(
    (form: RegistrationFormData, expiry: string) =>
      setPreview({ form, expiry }),
    [],
  );
  useEffect(() => {
    if (!preview.form.picture) {
      setPreviewPictureUrl("");
      return;
    }
    const pictureUrl = URL.createObjectURL(preview.form.picture);
    setPreviewPictureUrl(pictureUrl);
    return () => URL.revokeObjectURL(pictureUrl);
  }, [preview.form.picture]);
  const handleRegistered = useCallback(
    (_form: RegistrationFormData, _created?: any) => {
      fetchStats();
    },
    [fetchStats],
  );
  return (
    <main className={`console-shell ${sidebarCollapsed ? "sidebar-is-collapsed" : ""}`}>
      <aside className={`sidebar ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed((current) => !current)}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
        <div>
          <div className="side-brand">
            <img className="aura-mark" src="/sams-slim-gym-logo.png" alt="Sam's Slim Gym" style={{ width: 58, height: 38, objectFit: "contain", borderRadius: 0, background: "transparent" }} />
            <div>
              <strong>Sam's Slim Gym</strong>
              <small>Management Core</small>
            </div>
          </div>
          <div className="system-card">
            <span>
              <i /> System Live
            </span>
            <b>v2.4</b>
          </div>
          <nav className="side-nav">
            <a className="active" title="Admin Registration">
              <UserRoundPlus size={18} /> Admin Registration
            </a>
            <a href="/enrollments" title="All Enrollments">
              <ContactRound size={18} /> All Enrollments
            </a>
            <a href="/kiosk" title="User Kiosk">
              <Monitor size={18} /> User Kiosk
            </a>
          </nav>
        </div>
        <div className="side-footer">
          <span className="sync-line">
            <Cpu size={14} /> Auto-Sync Mode <b>Active</b>
          </span>
        </div>
      </aside>
      <div className="console-content">
        <header className="console-header">
          <div className="header-meta">
            <span>
              <CircleGauge size={15} /> {currentTime.toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
            <i />
            <span className="cluster-dot" /> 17 BS Aquino Drive, Bacolod
          </div>
          <div className="header-actions">
            <ThemeToggle />
          </div>
        </header>
        <section className="console-main">
          <div className="page-intro">
            <div>
              <h1>Member Registration</h1>
              <p>
                Enroll new members, configure package durations, and issue
                authenticated digital credentials.
              </p>
            </div>
            <div className="quick-stats">
              <div>
                <BadgeCheck size={22} />
                <span>
                  <small>New members</small>
                  <strong>
                    {newMembersCount} <em>members</em>
                  </strong>
                </span>
              </div>
              <div>
                <ShieldCheck size={22} />
                <span>
                  <small>Total members</small>
                  <strong>
                    {totalMembersCount} <em>members</em>
                  </strong>
                </span>
              </div>
            </div>
          </div>
          <div className="registration-layout">
            <div className="registration-column">
              <RegistrationForm
                onPreviewChange={handlePreviewChange}
                onRegistered={handleRegistered}
              />
            </div>
            <aside className="context-column">
              <div className="preview-card">
                <div className="preview-title">
                  <span>Live Credential Card</span>
                  <BadgeCheck size={18} />
                </div>
                <div className="credential">
                  <div className="credential-top">
                    <span className="credential-brand">
                      <img src="/sams-slim-gym-logo.png" alt="" style={{ width: 30, height: 26, objectFit: "contain", borderRadius: 4, background: "transparent" }} /> Sam's Pass
                    </span>
                    <strong>{preview.form.packageName}</strong>
                  </div>
                  <div className="credential-person">
                    <div className="credential-avatar">
                      {previewPictureUrl ? (
                        <img src={previewPictureUrl} alt="Member profile preview" />
                      ) : (
                        preview.form.fullName
                          .split(" ")
                          .map((part) => part[0])
                          .join("") || "--"
                      )}
                    </div>
                    <div>
                      <strong>{preview.form.fullName || "Member name"}</strong>
                      <small>ID: {preview.form.memberId || "Member ID"}</small>
                    </div>
                  </div>
                  <div className="credential-bottom">
                    <span>
                      Valid Thru: <b>{preview.expiry || "Not set"}</b>
                    </span>
                    <span>◉ READY</span>
                  </div>
                </div>
              </div>
              <div className="roster-card">
                <div className="roster-heading">
                  <h3>
                    <ClipboardList size={18} /> Recent Enrollments
                  </h3>
                  <span>Today ({recentMembers.length})</span>
                </div>
                {recentMembers.length === 0 ? (
                  <div className="roster-empty">No enrollments yet</div>
                ) : (
                  recentMembers.map((member, index) => (
                    <div
                      className={`roster-row ${index === 0 ? "new-row" : ""}`}
                      key={`${member.memberId}-${member.packageName}`}
                    >
                      <div className="roster-avatar">
                        {member.pictureUrl ? (
                          <img
                            src={member.pictureUrl}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          member.fullName
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                        )}
                      </div>
                      <div className="roster-name">
                        <strong>{member.fullName}</strong>
                        <small>
                          {member.memberId} · {member.packageName}
                        </small>
                      </div>
                      <b className="added-pill">Just Added</b>
                    </div>
                  ))
                )}
                <div className="terminal-sync">
                  <span>Terminal Sync Status</span>
                  <b>
                    <i /> Synchronized
                  </b>
                </div>
              </div>
            </aside>
          </div>
          <footer>
            <span>© 2026 Sam's Slim Gym</span>
            <span>
              <i /> Secure membership management
            </span>
          </footer>
        </section>
      </div>
    </main>
  );
}
