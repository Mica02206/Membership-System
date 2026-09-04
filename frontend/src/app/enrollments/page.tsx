"use client";

import {
  Bell,
  BadgeCheck,
  Camera,
  ChevronLeft,
  ChevronRight,
  CircleGauge,
  ContactRound,
  Cpu,
  Eye,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Upload,
  UserRoundPlus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { MemberStatus } from "@/features/check-in/types/status";
import {
  fetchMembers,
  fetchMemberStatus,
  renewMemberPass,
  uploadMemberPictureApi,
} from "@/features/enrollments/services/enrollmentsApi";
import { ThemeToggle } from "@/shared/components/ThemeToggle";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const PAGE_SIZE = 6;
const PACKAGE_OPTIONS = [
  "Individual Student",
  "Individual Professional",
  "Walk-in",
  "Barkada Group of 3 Professional",
  "Barkada Group of 3 Student",
  "Barkada Group of 5 Professional",
  "Barkada Group of 5 Student",
  "Barkada Group 6+ Professional",
  "Barkada Group 6+ Student",
];
const PACKAGE_PRICES: Record<string, string> = {
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
const PACKAGE_BENEFITS: Record<string, string[]> = {
  "Individual Student": ["Free Trainer Assistance", "Experienced Coaches", "Clean & Safe Facility", "Top-Notch Equipment"],
  "Individual Professional": ["Free Trainer Assistance", "Experienced Coaches", "Clean & Safe Facility", "Top-Notch Equipment"],
  "Walk-in": ["Single session access", "Clean & Safe Facility", "Top-Notch Equipment"],
  "Barkada Group of 3 Professional": ["Free Body Fat Assessment", "Free Trainer Assistance", "Free Workout Program", "Unlimited Gym Access", "No Lock-in", "No Hidden Fees"],
  "Barkada Group of 3 Student": ["Free Body Fat Assessment", "Free Trainer Assistance", "Free Workout Program", "Unlimited Gym Access", "No Lock-in", "No Hidden Fees"],
  "Barkada Group of 5 Professional": ["Free Body Fat Assessment", "Free Trainer Assistance", "Free Workout Program", "Unlimited Gym Access", "No Lock-in", "No Hidden Fees"],
  "Barkada Group of 5 Student": ["Free Body Fat Assessment", "Free Trainer Assistance", "Free Workout Program", "Unlimited Gym Access", "No Lock-in", "No Hidden Fees"],
  "Barkada Group 6+ Professional": ["Free Body Fat Assessment", "Free Trainer Assistance", "Free Workout Program", "Unlimited Gym Access", "No Lock-in", "No Hidden Fees"],
  "Barkada Group 6+ Student": ["Free Body Fat Assessment", "Free Trainer Assistance", "Free Workout Program", "Unlimited Gym Access", "No Lock-in", "No Hidden Fees"],
};
const getPictureUrl = (pictureUrl?: string) =>
  pictureUrl
    ? pictureUrl.startsWith("http")
      ? pictureUrl
      : `${API_URL.replace(/\/api\/?$/, "")}${pictureUrl}`
    : "";
const getExpiryDate = (member: MemberStatus["member"]) => {
  const expiry = new Date(member.startedAt);
  expiry.setDate(expiry.getDate() + member.packageDays);
  return expiry.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function EnrollmentsPage() {
  const [members, setMembers] = useState<MemberStatus[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [packageFilter, setPackageFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const loadMembers = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const data = await fetchMembers();
      setMembers(data);
      setSelectedId((current) => current || data[0]?.member.memberId || "");
    } catch (loadError) {
      if (showLoading) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load members",
        );
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers(true);
    const interval = setInterval(() => {
      loadMembers(false);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRenewPass = async (memberId: string) => {
    setRenewingId(memberId);
    setActionMessage(null);
    try {
      const updated = await renewMemberPass(memberId);
      setMembers((prev) =>
        prev.map((item) =>
          item.member.memberId === memberId ? updated : item,
        ),
      );
      setActionMessage({
        text: `Pass successfully renewed for ${updated.member.fullName}`,
        type: "success",
      });
    } catch (renewErr) {
      setActionMessage({
        text: renewErr instanceof Error ? renewErr.message : "Failed to renew pass",
        type: "error",
      });
    } finally {
      setRenewingId(null);
    }
  };

  const handleRefreshMember = async (memberId: string) => {
    setRefreshingId(memberId);
    setActionMessage(null);
    try {
      const updated = await fetchMemberStatus(memberId);
      setMembers((prev) =>
        prev.map((item) =>
          item.member.memberId === memberId ? updated : item,
        ),
      );
      setActionMessage({
        text: `Member status updated for ${updated.member.fullName}`,
        type: "success",
      });
    } catch (refreshErr) {
      setActionMessage({
        text: refreshErr instanceof Error ? refreshErr.message : "Failed to refresh member",
        type: "error",
      });
    } finally {
      setRefreshingId(null);
    }
  };

  const handleUpdatePhoto = async (memberId: string, file: File) => {
    setActionMessage(null);
    try {
      const updated = await uploadMemberPictureApi(memberId, file);
      setMembers((prev) =>
        prev.map((item) =>
          item.member.memberId === memberId ? updated : item,
        ),
      );
      setActionMessage({
        text: `Photo updated successfully for ${updated.member.fullName}`,
        type: "success",
      });
    } catch (err) {
      setActionMessage({
        text: err instanceof Error ? err.message : "Failed to update photo",
        type: "error",
      });
    }
  };

  const filteredMembers = useMemo(
    () =>
      members.filter((item) => {
        const searchable =
          `${item.member.fullName} ${item.member.memberId} ${item.member.contact} ${item.member.packageName}`.toLowerCase();
        return (
          (!query || searchable.includes(query.toLowerCase())) &&
          (packageFilter === "ALL" ||
            item.member.packageName === packageFilter) &&
          (statusFilter === "ALL" || item.status === statusFilter)
        );
      }),
    [members, packageFilter, query, statusFilter],
  );
  const pageCount = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const visibleMembers = filteredMembers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const selected =
    members.find((item) => item.member.memberId === selectedId) ??
    visibleMembers[0];
  const setFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <main
      className={`directory-shell ${sidebarCollapsed ? "directory-collapsed" : ""}`}
    >
      <aside
        className={`sidebar ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
      >
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed((current) => !current)}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen size={17} />
          ) : (
            <PanelLeftClose size={17} />
          )}
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
            <a href="/">
              <UserRoundPlus size={18} /> Admin Registration
            </a>
            <a className="active" href="/enrollments">
              <ContactRound size={18} /> All Enrollments
            </a>
            <a href="/kiosk">
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
      <div className="directory-content">
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
        <section className="directory-main">
          <div className="directory-heading">
            <div>
              <div className="directory-eyebrow">
                <BadgeCheck size={15} /> AuraMember Database Core
              </div>
              <h1>All Enrollments &amp; Members Directory</h1>
              <p>
                Browse, search, filter, and inspect active member records and
                package terms.
              </p>
            </div>
            <div className="directory-actions">
              <button type="button" onClick={() => loadMembers(true)} disabled={loading}>
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> {loading ? "Syncing..." : "Refresh"}
              </button>
              <a href="/">
                {" "}
                <UserRoundPlus size={15} /> New Registration
              </a>
            </div>
          </div>
          {actionMessage && (
            <div
              style={{
                padding: "10px 14px",
                marginBottom: "16px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                backgroundColor:
                  actionMessage.type === "success" ? "#dcfce7" : "#fee2e2",
                color: actionMessage.type === "success" ? "#15803d" : "#b91c1c",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{actionMessage.text}</span>
              <button
                type="button"
                onClick={() => setActionMessage(null)}
                style={{
                  background: "none",
                  border: 0,
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginLeft: "auto",
                  color: "inherit",
                }}
              >
                ✕
              </button>
            </div>
          )}
          <div className="directory-stats">
            <div>
              <span>Total Enrolled</span>
              <strong>{members.length}</strong>
              <small>Live member records</small>
            </div>
            <div>
              <span>Active Passes</span>
              <strong>
                {members.filter((item) => item.status === "active").length}
              </strong>
              <small>Currently valid</small>
            </div>
            <div>
              <span>Expired</span>
              <strong>
                {members.filter((item) => item.status === "expired").length}
              </strong>
              <small>Needs renewal</small>
            </div>
            <div>
              <span>Packages</span>
              <strong>{PACKAGE_OPTIONS.length}</strong>
              <small>Available plans</small>
            </div>
          </div>
          <div className="directory-toolbar">
            <input
              value={query}
              onChange={(event) => setFilter(setQuery, event.target.value)}
              placeholder="Search by Member ID, name, phone, or package..."
            />
            <select
              value={packageFilter}
              onChange={(event) =>
                setFilter(setPackageFilter, event.target.value)
              }
            >
              <option value="ALL">All Packages</option>
              {PACKAGE_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) =>
                setFilter(setStatusFilter, event.target.value)
              }
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setPackageFilter("ALL");
                setStatusFilter("ALL");
                setPage(1);
              }}
            >
              <RefreshCw size={15} />
            </button>
          </div>
          <div className="directory-grid">
            <section className="roster-table">
              <div className="roster-table-heading">
                <strong>Member Roster</strong>
                <span>{filteredMembers.length} Records Loaded</span>
              </div>
              {loading ? (
                <div className="directory-empty">Loading members...</div>
              ) : error ? (
                <div className="directory-empty error-text">{error}</div>
              ) : visibleMembers.length === 0 ? (
                <div className="directory-empty">
                  No matching enrollments found.
                </div>
              ) : (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Package &amp; Dues</th>
                        <th>Contact &amp; Branch</th>
                        <th>Validity</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleMembers.map((item) => (
                        <tr
                          key={item.member.memberId}
                          className={
                            selected?.member.memberId === item.member.memberId
                              ? "selected-row"
                              : ""
                          }
                          onClick={() => setSelectedId(item.member.memberId)}
                        >
                          <td>
                            <div className="roster-member-cell">
                              {getPictureUrl(item.member.pictureUrl) ? (
                                <img
                                  src={getPictureUrl(item.member.pictureUrl)}
                                  alt=""
                                />
                              ) : (
                                <span>
                                  {item.member.fullName
                                    .split(" ")
                                    .map((part) => part[0])
                                    .join("")}
                                </span>
                              )}
                              <div>
                                <strong>{item.member.fullName}</strong>
                                <small>{item.member.memberId}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <strong>{item.member.packageName}</strong>
                            <small>{item.member.packageDays} days</small>
                          </td>
                          <td>
                            <strong>{item.member.contact}</strong>
                            <small>{item.member.address}</small>
                          </td>
                          <td>
                            <strong>
                              {item.daysLeft > 0
                                ? `${item.daysLeft} days left`
                                : "Pass inactive"}
                            </strong>
                            <small>
                              {new Date(
                                item.member.startedAt,
                              ).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            <span className={`directory-status ${item.status}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              title="Inspect member"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedId(item.member.memberId);
                              }}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              title="Refresh member"
                              disabled={refreshingId === item.member.memberId}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleRefreshMember(item.member.memberId);
                              }}
                            >
                              <RefreshCw
                                size={14}
                                className={
                                  refreshingId === item.member.memberId
                                    ? "animate-spin"
                                    : ""
                                }
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="directory-pagination">
                <span>
                  Showing{" "}
                  {visibleMembers.length ? (page - 1) * PAGE_SIZE + 1 : 0} to{" "}
                  {Math.min(page * PAGE_SIZE, filteredMembers.length)} of{" "}
                  {filteredMembers.length}
                </span>
                <div>
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <b>
                    {page} / {pageCount}
                  </b>
                  <button
                    type="button"
                    disabled={page >= pageCount}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </section>
            
            <aside className="member-inspector">
              {selected ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.8125rem' }}>
                      <ContactRound size={15} className="text-amber-600" /> Member Inspector
                    </span>
                  </div>

                  {/* Member Card */}
                  <div style={{ backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '0.875rem', display: 'flex', gap: '0.875rem', marginBottom: '0.875rem', alignItems: 'center' }}>
                    <div style={{ flexShrink: 0, position: "relative" }}>
                      {getPictureUrl(selected.member.pictureUrl) ? (
                        <img 
                          src={getPictureUrl(selected.member.pictureUrl)} 
                          alt={`${selected.member.fullName} profile`} 
                          style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #f59e0b', display: 'block' }}
                        />
                      ) : (
                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', border: '2px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', fontSize: '1.25rem', fontWeight: 'bold', color: '#64748b' }}>
                          {selected.member.fullName.split(" ").map(part => part[0]).join("")}
                        </div>
                      )}
                      <label
                        title="Upload or change member photo"
                        style={{
                          position: "absolute",
                          bottom: "-6px",
                          right: "-6px",
                          backgroundColor: "#f59e0b",
                          color: "#4b3000",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          cursor: "pointer",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                        }}
                      >
                        <Camera size={13} />
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpdatePhoto(selected.member.memberId, file);
                          }}
                        />
                      </label>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', justifyContent: 'center' }}>
                      <h2 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '4px', color: '#0f172a', lineHeight: 1.2 }}>
                        {selected.member.fullName}
                        <BadgeCheck size={13} style={{ color: '#d97706', flexShrink: 0 }} />
                      </h2>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                        <span style={{ backgroundColor: '#f59e0b', color: '#fff', fontSize: '0.6rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', lineHeight: 1.2 }}>
                          {selected.member.memberId}
                        </span>
                        <span style={{ backgroundColor: '#1e293b', color: '#fff', fontSize: '0.6rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', lineHeight: 1.2 }}>
                          {selected.member.packageName.includes('Student') ? 'Student Pass' : 'Pro Pass'}
                        </span>
                      </div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                        <Phone size={11} /> {selected.member.contact}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#64748b', marginTop: '1px' }}>
                        <MapPin size={11} /> {selected.member.address}
                      </span>
                    </div>
                  </div>

                  {/* Subscription Card */}
                  <div style={{ backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '0.875rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', width: '100%' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        Active Subscription
                      </span>
                      <span 
                        style={{ 
                          backgroundColor: selected.daysLeft <= 7 ? '#fee2e2' : '#dcfce7', 
                          color: selected.daysLeft <= 7 ? '#b91c1c' : '#15803d',
                          padding: '2px 8px', 
                          borderRadius: '999px', 
                          fontSize: '0.6rem', 
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          lineHeight: 1.2
                        }}
                      >
                        {selected.daysLeft <= 7 && selected.daysLeft > 0 ? "Expiring" : selected.status}
                      </span>
                    </div>
                    
                    <strong style={{ fontSize: '0.875rem', color: '#0f172a', display: 'block', marginBottom: '0.6rem', lineHeight: 1.2 }}>
                      {selected.member.packageName}
                    </strong>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '1rem', height: 'auto', background: 'transparent' }}>
                      <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#92400e', lineHeight: 0.9 }}>
                        {PACKAGE_PRICES[selected.member.packageName] ?? ""}
                      </span> 
                      <span style={{ color: '#64748b', fontWeight: 600, fontSize: '0.65rem', paddingBottom: '2px' }}>
                        {selected.member.packageDays === 1 ? "/ session" : "/ month (Auto-Renew)"}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.7rem', marginBottom: '5px', width: '100%', background: 'transparent' }}>
                      <span style={{ color: '#64748b', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', whiteSpace: 'nowrap', paddingRight: '1rem' }}>
                        Cycle Validity
                      </span>
                      <strong style={{ color: '#0f172a', textAlign: 'right', lineHeight: 1.2, fontSize: '0.7rem' }}>
                        {selected.daysLeft} Days Left (Valid till {getExpiryDate(selected.member)})
                      </strong>
                    </div>
                    
                    <div style={{ height: '5px', width: '100%', backgroundColor: '#cbd5e1', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          backgroundColor: selected.daysLeft <= 7 ? '#dc2626' : '#22c55e',
                          width: `${Math.min(100, Math.max(0, (selected.daysLeft / selected.member.packageDays) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="inspector-perks">
                    <small>Included Tier Perks</small>
                    <div className="inspector-perk-grid">
                      {(PACKAGE_BENEFITS[selected.member.packageName] ?? []).map(benefit => (
                        <span key={benefit}><ShieldCheck size={14} /> {benefit}</span>
                      ))}
                    </div>
                  </div>
                  <div className="inspector-activity">
                    <div>
                      <small>Recent Turnstile Activity</small>
                      <ShieldCheck size={15} />
                    </div>
                    <strong>Kiosk Station #04</strong>
                    <span>Member activity is tracked at check-in.</span>
                  </div>
                  <div className="inspector-actions">
                    <button
                      type="button"
                      disabled={renewingId === selected.member.memberId}
                      onClick={() => handleRenewPass(selected.member.memberId)}
                    >
                      <RefreshCw
                        size={15}
                        className={
                          renewingId === selected.member.memberId
                            ? "animate-spin"
                            : ""
                        }
                      />{" "}
                      {renewingId === selected.member.memberId
                        ? "Renewing..."
                        : "Renew Pass"}
                    </button>
                    <button type="button"><Eye size={15} /> Calculate Body Fat</button>
                  </div>
                </>
              ) : (
                <div className="directory-empty">
                  Select a member to inspect.
                </div>
              )}
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}