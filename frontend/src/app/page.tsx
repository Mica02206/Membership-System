"use client";

import {
  BadgeCheck,
  Bell,
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
import { useCallback, useEffect, useState } from "react";
import { RegistrationForm } from "@/features/registration/components/RegistrationForm";
import type { RegistrationForm as RegistrationFormData } from "@/features/registration/types/registration";
import { ThemeToggle } from "@/shared/components/ThemeToggle";

type RecentMember = { fullName: string; memberId: string; packageName: string; pictureUrl?: string };

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [recentMembers, setRecentMembers] = useState<RecentMember[]>([]);
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
  const handleRegistered = useCallback((form: RegistrationFormData) => {
    const pictureUrl = form.picture ? URL.createObjectURL(form.picture) : undefined;
    setRecentMembers((current) => [
      {
        fullName: form.fullName,
        memberId: form.memberId,
        packageName: form.packageName,
        pictureUrl,
      },
      ...current,
    ]);
  }, []);
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
            <span className="aura-mark">A</span>
            <div>
              <strong>AuraMember</strong>
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
              <CircleGauge size={15} /> 10:42 AM UTC
            </span>
            <i />
            <span className="cluster-dot" /> Cluster North-1
          </div>
          <div className="header-actions">
            <Bell size={17} />
            <ThemeToggle />
            <div className="header-divider" />
            <div className="profile">
              <div>
                <strong>Sarah Jenkins</strong>
                <small>Super Administrator</small>
              </div>
              <span>SJ</span>
            </div>
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
                    42 <em>members</em>
                  </strong>
                </span>
              </div>
              <div>
                <ShieldCheck size={22} />
                <span>
                  <small>Total members</small>
                  <strong>
                    318 <em>members</em>
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
                      <b>A</b> AuraPass
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
            <span>© 2026 AuraMember</span>
            <span>
              <i /> Secure membership management
            </span>
          </footer>
        </section>
      </div>
    </main>
  );
}
