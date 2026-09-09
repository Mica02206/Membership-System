"use client";

import {
  BadgeCheck,
  Camera,
  ChevronLeft,
  ChevronRight,
  CircleGauge,
  ContactRound,
  Cpu,
  Download,
  Eye,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Phone,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  UserRoundPlus,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MemberActivity, MemberStatus } from "@/features/check-in/types/status";
import {
  fetchMembers,
  fetchMemberStatus,
  renewMemberPass,
  uploadMemberPictureApi,
  editMemberApi,
  deleteMemberApi,
} from "@/features/enrollments/services/enrollmentsApi";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { SignOutButton } from "@/components/SignOutButton";
import { getPictureUrl } from "@/lib/pictureUrl";
import { getUserFacingError } from "@/lib/userFacingError";
import { fetchMemberActivityHistory } from "@/lib/memberData";

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
const getExpiryDate = (member: MemberStatus["member"]) => {
  const expiry = new Date(member.startedAt);
  expiry.setDate(expiry.getDate() + member.packageDays);
  return expiry.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
const getActivityTime = (occurredAt: string) =>
  new Date(occurredAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

const csvCell = (value: string | number) => {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

// ── Edit Modal ────────────────────────────────────────────────────────────────
interface EditModalProps {
  item: MemberStatus;
  onClose: () => void;
  onSaved: (updated: MemberStatus) => void;
}
function EditModal({ item, onClose, onSaved }: EditModalProps) {
  const [form, setForm] = useState({
    fullName: item.member.fullName,
    contact: item.member.contact,
    address: item.member.address,
    packageName: item.member.packageName,
    packageDays: String(item.member.packageDays),
    startedAt: item.member.startedAt.slice(0, 10),
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const updated = await editMemberApi(item.member.memberId, {
        ...form,
        packageDays: Number(form.packageDays),
        startedAt: form.startedAt ? new Date(`${form.startedAt}T00:00:00`).toISOString() : undefined,
      });
      onSaved(updated);
    } catch (error) {
      setErr(getUserFacingError(error, "We couldn't save the member changes. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1.5px solid #e2e8f0",
    fontSize: "0.8125rem",
    outline: "none",
    fontFamily: "inherit",
    backgroundColor: "var(--bg, #fff)",
    color: "var(--fg, #0f172a)",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    display: "block",
    marginBottom: "4px",
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--card-bg, #fff)",
          borderRadius: "16px",
          padding: "2rem",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
          position: "relative",
          animation: "fadeUp 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
              <Pencil size={16} color="#f59e0b" />
              <strong style={{ fontSize: "1rem", color: "var(--fg, #0f172a)" }}>Edit Member</strong>
            </div>
            <small style={{ color: "#64748b", fontSize: "0.75rem" }}>
              {item.member.memberId} · {item.member.fullName}
            </small>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input style={fieldStyle} value={form.fullName} onChange={set("fullName")} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Contact</label>
              <input style={fieldStyle} value={form.contact} onChange={set("contact")} required />
            </div>
            <div>
              <label style={labelStyle}>Address</label>
              <input style={fieldStyle} value={form.address} onChange={set("address")} required />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Package</label>
              <select style={fieldStyle} value={form.packageName} onChange={set("packageName")}>
                {PACKAGE_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Duration (days)</label>
              <input style={fieldStyle} type="number" min="1" value={form.packageDays} onChange={set("packageDays")} required />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Registration / Start Date</label>
            <input style={fieldStyle} type="date" value={form.startedAt} onChange={set("startedAt")} required />
          </div>

          {err && (
            <div style={{ padding: "8px 12px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 600 }}>
              {err}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "9px 18px", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.8125rem", color: "#64748b" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: "9px 22px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "6px" }}
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <BadgeCheck size={14} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────────
interface DeleteConfirmProps {
  item: MemberStatus;
  onClose: () => void;
  onDeleted: (memberId: string) => void;
}
function DeleteConfirm({ item, onClose, onDeleted }: DeleteConfirmProps) {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setErr("");
    try {
      await deleteMemberApi(item.member.memberId);
      onDeleted(item.member.memberId);
    } catch (error) {
      setErr(getUserFacingError(error, "We couldn't remove this member. Please try again."));
      setDeleting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--card-bg, #fff)",
          borderRadius: "16px",
          padding: "2rem",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
          textAlign: "center",
          animation: "fadeUp 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
          <Trash2 size={22} color="#dc2626" />
        </div>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 8px", color: "var(--fg, #0f172a)" }}>Delete Member?</h2>
        <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
          This will permanently remove <strong>{item.member.fullName}</strong> ({item.member.memberId}) and their photo. This cannot be undone.
        </p>
        {err && (
          <div style={{ padding: "8px 12px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 600, marginBottom: "12px" }}>
            {err}
          </div>
        )}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: "9px 22px", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.8125rem", color: "#64748b" }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            style={{ padding: "9px 22px", borderRadius: "8px", border: "none", background: "#dc2626", color: "#fff", cursor: deleting ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "6px" }}
          >
            {deleting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {deleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BodyFatModal({ memberName, onClose }: { memberName: string; onClose: () => void }) {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(25);
  const [sex, setSex] = useState<"male" | "female">("male");
  const [result, setResult] = useState<{ bmi: number; bodyFat: number } | null>(null);

  const calculate = (event: React.FormEvent) => {
    event.preventDefault();
    const bmi = weight / ((height / 100) ** 2);
    const bodyFat = 1.2 * bmi + 0.23 * age - (sex === "male" ? 16.2 : 5.4);
    setResult({ bmi, bodyFat: Math.max(0, bodyFat) });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()} style={{ maxWidth: "460px" }}>
        <div className="modal-heading">
          <div><h2>Calculate Body Fat</h2><p>{memberName}</p></div>
          <button type="button" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form onSubmit={calculate} style={{ display: "grid", gap: "12px" }}>
          <label>Weight (kg)<input type="number" min="1" step="0.1" value={weight} onChange={(event) => setWeight(Number(event.target.value))} required /></label>
          <label>Height (cm)<input type="number" min="1" step="0.1" value={height} onChange={(event) => setHeight(Number(event.target.value))} required /></label>
          <label>Age<input type="number" min="1" max="120" value={age} onChange={(event) => setAge(Number(event.target.value))} required /></label>
          <label>Sex<select value={sex} onChange={(event) => setSex(event.target.value as "male" | "female")}><option value="male">Male</option><option value="female">Female</option></select></label>
          <button type="submit" className="primary-action">Calculate</button>
        </form>
        {result && <div style={{ marginTop: "16px", padding: "14px", borderRadius: "8px", background: "#eff6ff" }}><strong>Estimated results</strong><div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}><span>BMI</span><b>{result.bmi.toFixed(1)}</b></div><div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}><span>Estimated body fat</span><b>{result.bodyFat.toFixed(1)}%</b></div></div>}
        <p style={{ color: "#64748b", fontSize: "0.72rem", marginBottom: 0 }}>Estimate for reference only; not a clinical measurement.</p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function EnrollmentsPage() {
  const router = useRouter();
  const [members, setMembers] = useState<MemberStatus[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [packageFilter, setPackageFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [editTarget, setEditTarget] = useState<MemberStatus | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MemberStatus | null>(null);
  const [bodyFatOpen, setBodyFatOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [activityHistory, setActivityHistory] = useState<MemberActivity[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const loadMembers = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const data = await fetchMembers();
      setMembers(data);
      setSelectedId((current) => current || data[0]?.member.memberId || "");
    } catch (loadError) {
      if (showLoading) {
        setError(getUserFacingError(loadError, "We couldn't load the member list. Please refresh and try again."));
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    loadMembers(true);
    const interval = setInterval(() => { loadMembers(false); }, 10000);
    return () => {
      clearInterval(interval);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!selectedId) {
      setActivityHistory([]);
      return;
    }
    fetchMemberActivityHistory(selectedId)
      .then((history) => { if (!cancelled) setActivityHistory(history); })
      .catch(() => { if (!cancelled) setActivityHistory([]); });
    return () => { cancelled = true; };
  }, [selectedId]);

  const startCamera = async () => {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not available in this browser.");
      return;
    }
    try {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setCameraError("Camera access was blocked. Allow camera permission and try again.");
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const capturePhoto = async () => {
    const target = members.find((item) => item.member.memberId === selectedId);
    if (!videoRef.current || !target) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9),
    );
    if (!blob) return;
    const file = new File([blob], `webcam-${Date.now()}.jpg`, { type: "image/jpeg" });
    const memberId = target.member.memberId;
    closeCamera();
    await handleUpdatePhoto(memberId, file);
  };

  const handleRenewPass = async (memberId: string) => {
    setRenewingId(memberId);
    setActionMessage(null);
    try {
      const updated = await renewMemberPass(memberId);
      setMembers((prev) => prev.map((item) => item.member.memberId === memberId ? updated : item));
      setActionMessage({ text: `Pass successfully renewed for ${updated.member.fullName}`, type: "success" });
    } catch (renewErr) {
      setActionMessage({ text: renewErr instanceof Error ? renewErr.message : "Failed to renew pass", type: "error" });
    } finally {
      setRenewingId(null);
    }
  };

  const handleRefreshMember = async (memberId: string) => {
    setRefreshingId(memberId);
    setActionMessage(null);
    try {
      const updated = await fetchMemberStatus(memberId);
      setMembers((prev) => prev.map((item) => item.member.memberId === memberId ? updated : item));
      setActionMessage({ text: `Member status updated for ${updated.member.fullName}`, type: "success" });
    } catch (refreshErr) {
      setActionMessage({ text: refreshErr instanceof Error ? refreshErr.message : "Failed to refresh member", type: "error" });
    } finally {
      setRefreshingId(null);
    }
  };

  const handleUpdatePhoto = async (memberId: string, file: File) => {
    setActionMessage(null);
    try {
      const updated = await uploadMemberPictureApi(memberId, file);
      setMembers((prev) => prev.map((item) => item.member.memberId === memberId ? updated : item));
      setActionMessage({ text: `Photo updated successfully for ${updated.member.fullName}`, type: "success" });
    } catch (err) {
      setActionMessage({ text: err instanceof Error ? err.message : "Failed to update photo", type: "error" });
    }
  };

  const handleEditSaved = (updated: MemberStatus) => {
    setMembers((prev) => prev.map((item) => item.member.memberId === updated.member.memberId ? updated : item));
    setEditTarget(null);
    setActionMessage({ text: `${updated.member.fullName} updated successfully.`, type: "success" });
  };

  const handleDeleted = (memberId: string) => {
    const deleted = members.find((m) => m.member.memberId === memberId);
    setMembers((prev) => prev.filter((item) => item.member.memberId !== memberId));
    setDeleteTarget(null);
    if (selectedId === memberId) setSelectedId("");
    setActionMessage({ text: `${deleted?.member.fullName ?? "Member"} has been removed.`, type: "success" });
  };

  const filteredMembers = useMemo(
    () =>
      members.filter((item) => {
        const searchable = `${item.member.fullName} ${item.member.memberId} ${item.member.contact} ${item.member.packageName}`.toLowerCase();
        return (
          (!query || searchable.includes(query.toLowerCase())) &&
          (packageFilter === "ALL" || item.member.packageName === packageFilter) &&
          (statusFilter === "ALL" || item.status === statusFilter)
        );
      }),
    [members, packageFilter, query, statusFilter],
  );
  const pageCount = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const visibleMembers = filteredMembers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = members.find((item) => item.member.memberId === selectedId) ?? visibleMembers[0];
  const setFilter = (setter: (value: string) => void, value: string) => { setter(value); setPage(1); };

  const handleExportCsv = () => {
    if (filteredMembers.length === 0) {
      setActionMessage({ text: "There are no matching members to export.", type: "error" });
      return;
    }

    const headers = [
      "Member ID",
      "Full Name",
      "Contact",
      "Address",
      "Package",
      "Duration (Days)",
      "Status",
      "Days Left",
      "Start Date",
      "Expiry Date",
    ];
    const rows = filteredMembers.map(({ member, status, daysLeft }) => [
      member.memberId,
      member.fullName,
      member.contact,
      member.address,
      member.packageName,
      member.packageDays,
      status,
      daysLeft,
      new Date(member.startedAt).toLocaleDateString(),
      getExpiryDate(member),
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `auramember-enrollments-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setActionMessage({ text: `${filteredMembers.length} member record(s) exported to CSV.`, type: "success" });
  };

  return (
    <main className={`directory-shell ${sidebarCollapsed ? "directory-collapsed" : ""}`}>
      {/* Modals */}
      {editTarget && (
        <EditModal item={editTarget} onClose={() => setEditTarget(null)} onSaved={handleEditSaved} />
      )}
      {deleteTarget && (
        <DeleteConfirm item={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} />
      )}
      {cameraOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 10000,
            background: "rgba(15, 23, 42, 0.72)", display: "grid", placeItems: "center",
            padding: "1rem",
          }}
          onClick={closeCamera}
        >
          <div
            style={{ background: "var(--card-bg, #fff)", borderRadius: "16px", padding: "1rem", width: "min(440px, 100%)" }}
            onClick={(event) => event.stopPropagation()}
          >
            <strong style={{ display: "block", marginBottom: "0.75rem", color: "var(--fg, #0f172a)" }}>Take Member Photo</strong>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", borderRadius: "10px", background: "#0f172a" }} />
            {cameraError && <p style={{ color: "#b91c1c", fontSize: "0.75rem", margin: "0.75rem 0 0" }}>{cameraError}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.75rem" }}>
              <button type="button" onClick={closeCamera} style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "transparent", cursor: "pointer" }}>Cancel</button>
              <button type="button" onClick={capturePhoto} style={{ padding: "8px 14px", borderRadius: "8px", border: 0, background: "#f59e0b", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                <Camera size={14} style={{ verticalAlign: "-2px", marginRight: "5px" }} /> Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}

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
            <span><i /> System Live</span>
            <b>v2.4</b>
          </div>
          <nav className="side-nav">
            <a href="/"><UserRoundPlus size={18} /> Admin Registration</a>
            <a className="active" href="/enrollments"><ContactRound size={18} /> All Enrollments</a>
            <a href="/kiosk"><Monitor size={18} /> User Kiosk</a>
          </nav>
        </div>
        <div className="side-footer">
          <span className="sync-line"><Cpu size={14} /> Auto-Sync Mode <b>Active</b></span>
          <SignOutButton />
        </div>
      </aside>

      <div className="directory-content">
        <header className="console-header">
          <div className="header-meta">
            <span><CircleGauge size={15} /> {currentTime.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
            <i />
            <span className="cluster-dot" /> 17 BS Aquino Drive, Bacolod
          </div>
          <div className="header-actions">
            <ThemeToggle />
          </div>
        </header>

        <section className="directory-main">
          <div className="directory-heading">
            <div>
              <div className="directory-eyebrow"><BadgeCheck size={15} /> Sam's Slim Gym Database Core</div>
              <h1>All Enrollments &amp; Members Directory</h1>
              <p>Browse, search, filter, and inspect active member records and package terms.</p>
            </div>
            <div className="directory-actions">
              <button type="button" onClick={handleExportCsv} disabled={loading || filteredMembers.length === 0}>
                <Download size={15} /> Export CSV
              </button>
              <button type="button" onClick={() => loadMembers(true)} disabled={loading}>
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> {loading ? "Syncing..." : "Refresh"}
              </button>
              <a href="/"><UserRoundPlus size={15} /> New Registration</a>
            </div>
          </div>

          {actionMessage && (
            <div style={{
              padding: "10px 14px", marginBottom: "16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
              backgroundColor: actionMessage.type === "success" ? "#dcfce7" : "#fee2e2",
              color: actionMessage.type === "success" ? "#15803d" : "#b91c1c",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span>{actionMessage.text}</span>
              <button type="button" onClick={() => setActionMessage(null)} style={{ background: "none", border: 0, cursor: "pointer", fontWeight: "bold", marginLeft: "auto", color: "inherit" }}>✕</button>
            </div>
          )}

          <div className="directory-stats">
            <div><span>Total Enrolled</span><strong>{members.length}</strong><small>Live member records</small></div>
            <div><span>Active Passes</span><strong>{members.filter((item) => item.status === "active").length}</strong><small>Currently valid</small></div>
            <div><span>Expired</span><strong>{members.filter((item) => item.status === "expired").length}</strong><small>Needs renewal</small></div>
            <div><span>Packages</span><strong>{PACKAGE_OPTIONS.length}</strong><small>Available plans</small></div>
          </div>

          <div className="directory-toolbar">
            <input value={query} onChange={(event) => setFilter(setQuery, event.target.value)} placeholder="Search by Member ID, name, phone, or package..." />
            <select value={packageFilter} onChange={(event) => setFilter(setPackageFilter, event.target.value)}>
              <option value="ALL">All Packages</option>
              {PACKAGE_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setFilter(setStatusFilter, event.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
            <button type="button" onClick={() => { setQuery(""); setPackageFilter("ALL"); setStatusFilter("ALL"); setPage(1); }}>
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
                <div className="directory-empty">No matching enrollments found.</div>
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
                      </tr>
                    </thead>
                    <tbody>
                      {visibleMembers.map((item) => (
                        <tr
                          key={item.member.memberId}
                          className={selected?.member.memberId === item.member.memberId ? "selected-row" : ""}
                          onClick={() => setSelectedId(item.member.memberId)}
                        >
                          <td>
                            <div className="roster-member-cell">
                              {getPictureUrl(item.member.pictureUrl) ? (
                                <img src={getPictureUrl(item.member.pictureUrl)} alt="" />
                              ) : (
                                <span>{item.member.fullName.split(" ").map((part) => part[0]).join("")}</span>
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
                            <strong>{item.daysLeft > 0 ? `${item.daysLeft} days left` : "Pass inactive"}</strong>
                            <small>{new Date(item.member.startedAt).toLocaleDateString()}</small>
                          </td>
                          <td>
                            <span className={`directory-status ${item.status}`}>{item.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="directory-pagination">
                <span>Showing {visibleMembers.length ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, filteredMembers.length)} of {filteredMembers.length}</span>
                <div>
                  <button type="button" disabled={page === 1} onClick={() => setPage((c) => c - 1)}><ChevronLeft size={15} /></button>
                  <b>{page} / {pageCount}</b>
                  <button type="button" disabled={page >= pageCount} onClick={() => setPage((c) => c + 1)}><ChevronRight size={15} /></button>
                </div>
              </div>
            </section>

            <aside className="member-inspector">
              {selected ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "0.8125rem" }}>
                      <ContactRound size={15} className="text-amber-600" /> Member Inspector
                    </span>
                    {/* Edit & Delete in inspector header */}
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        title="Edit member"
                        onClick={() => setEditTarget(selected)}
                        style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", fontWeight: 600, color: "#2563eb" }}
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        type="button"
                        title="Delete member"
                        onClick={() => setDeleteTarget(selected)}
                        style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", fontWeight: 600, color: "#dc2626" }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Member Card */}
                  <div style={{ backgroundColor: "#f1f5f9", borderRadius: "8px", padding: "0.875rem", display: "flex", gap: "0.875rem", marginBottom: "0.875rem", alignItems: "center" }}>
                    <div style={{ flexShrink: 0, position: "relative" }}>
                      {getPictureUrl(selected.member.pictureUrl) ? (
                        <img src={getPictureUrl(selected.member.pictureUrl)} alt={`${selected.member.fullName} profile`} style={{ width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover", border: "2px solid #f59e0b", display: "block" }} />
                      ) : (
                        <div style={{ width: "60px", height: "60px", borderRadius: "8px", border: "2px solid #f59e0b", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#e2e8f0", fontSize: "1.25rem", fontWeight: "bold", color: "#64748b" }}>
                          {selected.member.fullName.split(" ").map((part) => part[0]).join("")}
                        </div>
                      )}
                      <button type="button" title="Take member photo" onClick={startCamera} style={{ position: "absolute", bottom: "-6px", right: "-6px", backgroundColor: "#f59e0b", color: "#4b3000", width: "24px", height: "24px", borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.15)", border: 0, padding: 0 }}>
                        <Camera size={13} />
                      </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", justifyContent: "center" }}>
                      <h2 style={{ fontSize: "0.9rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "4px", color: "#0f172a", lineHeight: 1.2 }}>
                        {selected.member.fullName}
                        <BadgeCheck size={13} style={{ color: "#d97706", flexShrink: 0 }} />
                      </h2>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "2px" }}>
                        <span style={{ backgroundColor: "#f59e0b", color: "#fff", fontSize: "0.6rem", fontWeight: 600, padding: "2px 6px", borderRadius: "4px", lineHeight: 1.2 }}>{selected.member.memberId}</span>
                        <span style={{ backgroundColor: "#1e293b", color: "#fff", fontSize: "0.6rem", fontWeight: 600, padding: "2px 6px", borderRadius: "4px", lineHeight: 1.2 }}>{selected.member.packageName.includes("Student") ? "Student Pass" : "Pro Pass"}</span>
                      </div>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.7rem", color: "#64748b", marginTop: "2px" }}><Phone size={11} /> {selected.member.contact}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.7rem", color: "#64748b", marginTop: "1px" }}><MapPin size={11} /> {selected.member.address}</span>
                    </div>
                  </div>

                  {/* Subscription Card */}
                  <div style={{ backgroundColor: "#f1f5f9", borderRadius: "8px", padding: "0.875rem", marginBottom: "1.25rem", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem", width: "100%" }}>
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>Active Subscription</span>
                      <span style={{ backgroundColor: selected.daysLeft <= 7 ? "#fee2e2" : "#dcfce7", color: selected.daysLeft <= 7 ? "#b91c1c" : "#15803d", padding: "2px 8px", borderRadius: "999px", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", lineHeight: 1.2 }}>
                        {selected.daysLeft <= 7 && selected.daysLeft > 0 ? "Expiring" : selected.status}
                      </span>
                    </div>
                    <strong style={{ fontSize: "0.875rem", color: "#0f172a", display: "block", marginBottom: "0.6rem", lineHeight: 1.2 }}>{selected.member.packageName}</strong>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", marginBottom: "1rem" }}>
                      <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "#92400e", lineHeight: 0.9 }}>{PACKAGE_PRICES[selected.member.packageName] ?? ""}</span>
                      <span style={{ color: "#64748b", fontWeight: 600, fontSize: "0.65rem", paddingBottom: "2px" }}>{selected.member.packageDays === 1 ? "/ session" : "/ month (Auto-Renew)"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: "0.7rem", marginBottom: "5px", width: "100%" }}>
                      <span style={{ color: "#64748b", fontWeight: 600, fontSize: "0.65rem", textTransform: "uppercase", whiteSpace: "nowrap", paddingRight: "1rem" }}>Cycle Validity</span>
                      <strong style={{ color: "#0f172a", textAlign: "right", lineHeight: 1.2, fontSize: "0.7rem" }}>{selected.daysLeft} Days Left (Valid till {getExpiryDate(selected.member)})</strong>
                    </div>
                    <div style={{ height: "5px", width: "100%", backgroundColor: "#cbd5e1", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ height: "100%", backgroundColor: selected.daysLeft <= 7 ? "#dc2626" : "#22c55e", width: `${Math.min(100, Math.max(0, (selected.daysLeft / selected.member.packageDays) * 100))}%` }} />
                    </div>
                  </div>

                  <div className="inspector-activity">
                    <div><small>Recent Turnstile Activity</small><ShieldCheck size={15} /></div>
                    <strong>
                      {selected.lastActivity
                        ? `${selected.lastActivity.action === "check-in" ? "Checked in" : "Checked out"} · ${selected.lastActivity.station}`
                        : "No kiosk activity yet"}
                    </strong>
                    <span>
                      {selected.lastActivity
                        ? getActivityTime(selected.lastActivity.occurredAt)
                        : "Activity will appear after the next kiosk check-in or check-out."}
                    </span>
                    <div className="activity-history" aria-label="Check-in and check-out history">
                      <strong>Check-in / Check-out History</strong>
                      {activityHistory.length > 0 ? activityHistory.slice(0, 5).map((activity, index) => (
                        <div className="activity-history-row" key={`${activity.occurredAt}-${index}`}>
                          <span className={`activity-dot ${activity.action === "check-in" ? "check-in" : "check-out"}`} />
                          <span>
                            <b>{activity.action === "check-in" ? "Checked in" : "Checked out"} · {activity.station}</b>
                            <small>{getActivityTime(activity.occurredAt)}</small>
                          </span>
                        </div>
                      )) : <small>No check-in or check-out history yet.</small>}
                    </div>
                  </div>
                  <div className="inspector-actions">
                    <button type="button" disabled={renewingId === selected.member.memberId} onClick={() => handleRenewPass(selected.member.memberId)}>
                      <RefreshCw size={15} className={renewingId === selected.member.memberId ? "animate-spin" : ""} />{" "}
                      {renewingId === selected.member.memberId ? "Renewing..." : "Renew Pass"}
                    </button>
                    <button type="button" onClick={() => router.push(`/body-fat?memberId=${encodeURIComponent(selected.member.memberId)}`)}><Eye size={15} /> Calculate Body Fat</button>
                  </div>
                </>
              ) : (
                <div className="directory-empty">Select a member to inspect.</div>
              )}
            </aside>
          </div>
        </section>
      </div>
      {bodyFatOpen && selected && <BodyFatModal memberName={selected.member.fullName} onClose={() => setBodyFatOpen(false)} />}
    </main>
  );
}
