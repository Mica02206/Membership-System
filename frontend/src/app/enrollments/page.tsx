"use client";

import { Bell, BadgeCheck, ChevronLeft, ChevronRight, CircleGauge, ContactRound, Cpu, Eye, Monitor, PanelLeftClose, PanelLeftOpen, RefreshCw, ShieldCheck, UserRoundPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { MemberStatus } from "@/features/check-in/types/status";
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

  const loadMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/members`);
      if (!response.ok) throw new Error("Unable to load members");
      const data = (await response.json()) as MemberStatus[];
      setMembers(data);
      setSelectedId(current => current || data[0]?.member.memberId || "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMembers(); }, []);

  const filteredMembers = useMemo(() => members.filter(item => {
    const searchable = `${item.member.fullName} ${item.member.memberId} ${item.member.contact} ${item.member.packageName}`.toLowerCase();
    return (!query || searchable.includes(query.toLowerCase())) && (packageFilter === "ALL" || item.member.packageName === packageFilter) && (statusFilter === "ALL" || item.status === statusFilter);
  }), [members, packageFilter, query, statusFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const visibleMembers = filteredMembers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = members.find(item => item.member.memberId === selectedId) ?? visibleMembers[0];
  const setFilter = (setter: (value: string) => void, value: string) => { setter(value); setPage(1); };

  return <main className={`directory-shell ${sidebarCollapsed ? "directory-collapsed" : ""}`}>
    <aside className={`sidebar ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <button type="button" className="sidebar-toggle" onClick={() => setSidebarCollapsed(current => !current)} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>{sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}</button>
      <div><div className="side-brand"><span className="aura-mark">A</span><div><strong>AuraMember</strong><small>Management Core</small></div></div><div className="system-card"><span><i /> System Live</span><b>v2.4</b></div><nav className="side-nav"><a href="/"><UserRoundPlus size={18} /> Admin Registration</a><a className="active" href="/enrollments"><ContactRound size={18} /> All Enrollments</a><a href="/kiosk"><Monitor size={18} /> User Kiosk</a></nav></div>
      <div className="side-footer"><span className="sync-line"><Cpu size={14} /> Auto-Sync Mode <b>Active</b></span></div>
    </aside>
    <div className="directory-content"><header className="console-header"><div className="header-meta"><span><CircleGauge size={15} /> 10:42 AM UTC</span><i /><span className="cluster-dot" /> Cluster North-1</div><div className="header-actions"><Bell size={17} /><ThemeToggle /><div className="header-divider" /><div className="profile"><div><strong>Sarah Jenkins</strong><small>Super Administrator</small></div><span>SJ</span></div></div></header>
      <section className="directory-main"><div className="directory-heading"><div><div className="directory-eyebrow"><BadgeCheck size={15} /> AuraMember Database Core</div><h1>All Enrollments &amp; Members Directory</h1><p>Browse, search, filter, and inspect active member records and package terms.</p></div><div className="directory-actions"><button type="button" onClick={loadMembers}><RefreshCw size={15} /> Refresh</button><a href="/"> <UserRoundPlus size={15} /> New Registration</a></div></div>
        <div className="directory-stats"><div><span>Total Enrolled</span><strong>{members.length}</strong><small>Live member records</small></div><div><span>Active Passes</span><strong>{members.filter(item => item.status === "active").length}</strong><small>Currently valid</small></div><div><span>Expired</span><strong>{members.filter(item => item.status === "expired").length}</strong><small>Needs renewal</small></div><div><span>Packages</span><strong>{PACKAGE_OPTIONS.length}</strong><small>Available plans</small></div></div>
        <div className="directory-toolbar"><input value={query} onChange={event => setFilter(setQuery, event.target.value)} placeholder="Search by Member ID, name, phone, or package..." /><select value={packageFilter} onChange={event => setFilter(setPackageFilter, event.target.value)}><option value="ALL">All Packages</option>{PACKAGE_OPTIONS.map(item => <option key={item} value={item}>{item}</option>)}</select><select value={statusFilter} onChange={event => setFilter(setStatusFilter, event.target.value)}><option value="ALL">All Statuses</option><option value="active">Active</option><option value="expired">Expired</option></select><button type="button" onClick={() => { setQuery(""); setPackageFilter("ALL"); setStatusFilter("ALL"); setPage(1); }}><RefreshCw size={15} /></button></div>
        <div className="directory-grid"><section className="roster-table"><div className="roster-table-heading"><strong>Member Roster</strong><span>{filteredMembers.length} Records Loaded</span></div>{loading ? <div className="directory-empty">Loading members...</div> : error ? <div className="directory-empty error-text">{error}</div> : visibleMembers.length === 0 ? <div className="directory-empty">No matching enrollments found.</div> : <div className="table-scroll"><table><thead><tr><th>Member</th><th>Package &amp; Dues</th><th>Contact &amp; Branch</th><th>Validity</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visibleMembers.map(item => <tr key={item.member.memberId} className={selected?.member.memberId === item.member.memberId ? "selected-row" : ""} onClick={() => setSelectedId(item.member.memberId)}><td><strong>{item.member.fullName}</strong><small>{item.member.memberId}</small></td><td><strong>{item.member.packageName}</strong><small>{item.member.packageDays} days</small></td><td><strong>{item.member.contact}</strong><small>{item.member.address}</small></td><td><strong>{item.daysLeft > 0 ? `${item.daysLeft} days left` : "Pass inactive"}</strong><small>{new Date(item.member.startedAt).toLocaleDateString()}</small></td><td><span className={`directory-status ${item.status}`}>{item.status}</span></td><td><button type="button" title="Inspect member" onClick={event => { event.stopPropagation(); setSelectedId(item.member.memberId); }}><Eye size={15} /></button></td></tr>)}</tbody></table></div>}<div className="directory-pagination"><span>Showing {visibleMembers.length ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, filteredMembers.length)} of {filteredMembers.length}</span><div><button type="button" disabled={page === 1} onClick={() => setPage(current => current - 1)}><ChevronLeft size={15} /></button><b>{page} / {pageCount}</b><button type="button" disabled={page >= pageCount} onClick={() => setPage(current => current + 1)}><ChevronRight size={15} /></button></div></div></section>
          <aside className="member-inspector">{selected ? <><div className="inspector-heading"><span><ContactRound size={17} /> Member Inspector</span><ShieldCheck size={17} /></div><div className="inspector-member"><div className="inspector-avatar"><UserRoundPlus size={25} /></div><div><h2>{selected.member.fullName}</h2><strong>{selected.member.memberId}</strong></div></div><div className="inspector-package"><small>Active Subscription</small><strong>{selected.member.packageName}</strong><b>{selected.daysLeft} days left</b><div><i style={{ width: `${Math.min(100, Math.max(0, selected.daysLeft / selected.member.packageDays * 100))}%` }} /></div></div><div className="inspector-details"><span><small>Contact</small><strong>{selected.member.contact}</strong></span><span><small>Address</small><strong>{selected.member.address}</strong></span></div><div className="inspector-perks"><small>Included Tier Perks</small><span><ShieldCheck size={14} /> Membership verified</span><span><ShieldCheck size={14} /> Package access enabled</span><span><ShieldCheck size={14} /> Entry status tracked</span></div></> : <div className="directory-empty">Select a member to inspect.</div>}</aside></div>
      </section></div>
  </main>;
}
