import { supabase } from "./supabase";
import type { MemberStatus } from "@/features/check-in/types/status";

type MemberRow = {
  id: string; member_id: string; full_name: string; contact: string; address: string;
  picture_url: string | null; package_name: string; package_days: number;
  started_at: string; registered_at: string;
};
type ActivityRow = { member_id: string; action: "check-in" | "check-out"; station: string; occurred_at: string };

const daysLeftFor = (startedAt: string, packageDays: number) => Math.max(0, Math.ceil((new Date(startedAt).getTime() + packageDays * 86400000 - Date.now()) / 86400000));

const toMember = (row: MemberRow) => ({
  fullName: row.full_name, memberId: row.member_id, packageName: row.package_name,
  contact: row.contact, address: row.address, packageDays: row.package_days,
  startedAt: row.started_at, registeredAt: row.registered_at, pictureUrl: row.picture_url ?? undefined,
});

const toStatus = (row: MemberRow, activity?: ActivityRow): MemberStatus => {
  const daysLeft = daysLeftFor(row.started_at, row.package_days);
  return { member: toMember(row), status: daysLeft > 0 ? "active" : "expired", daysLeft, lastActivity: activity ? { action: activity.action, station: activity.station, occurredAt: activity.occurred_at } : undefined };
};

async function activitiesByMember() {
  const { data, error } = await supabase.from("member_activity").select("member_id, action, station, occurred_at");
  if (error) throw error;
  return new Map((data as ActivityRow[]).map((item) => [item.member_id, item]));
}

export async function fetchMemberStatuses(): Promise<MemberStatus[]> {
  const [{ data, error }, activities] = await Promise.all([
    supabase.from("members").select("*").order("registered_at", { ascending: false }),
    activitiesByMember(),
  ]);
  if (error) throw error;
  return (data as MemberRow[]).map((row) => toStatus(row, activities.get(row.member_id)));
}

export async function fetchMemberStatusDirect(memberId: string): Promise<MemberStatus> {
  const normalized = memberId.trim().toUpperCase();
  const [{ data, error }, activities] = await Promise.all([
    supabase.from("members").select("*").eq("member_id", normalized).single(),
    activitiesByMember(),
  ]);
  if (error || !data) throw new Error("We couldn't find that member ID");
  return toStatus(data as MemberRow, activities.get(normalized));
}

export async function recordMemberActivityDirect(memberId: string, action: "check-in" | "check-out") {
  const current = await fetchMemberStatusDirect(memberId);
  if (current.status === "expired") throw new Error("Membership expired. Check-in and check-out are unavailable.");
  const { error } = await supabase.from("member_activity").upsert({ member_id: current.member.memberId, action, station: "Kiosk", occurred_at: new Date().toISOString() });
  if (error) throw error;
  return fetchMemberStatusDirect(current.member.memberId);
}

export async function renewMemberPassDirect(memberId: string, days?: number) {
  const current = await fetchMemberStatusDirect(memberId);
  const expiry = new Date(new Date(current.member.startedAt).getTime() + current.member.packageDays * 86400000);
  const startedAt = new Date(Math.max(Date.now(), expiry.getTime())).toISOString();
  const { error } = await supabase.from("members").update({ started_at: startedAt, package_days: days && days > 0 ? Math.floor(days) : current.member.packageDays }).eq("member_id", current.member.memberId);
  if (error) throw error;
  return fetchMemberStatusDirect(current.member.memberId);
}

export async function editMemberDirect(memberId: string, fields: { fullName?: string; contact?: string; address?: string; packageName?: string; packageDays?: number; startedAt?: string }) {
  const update = { ...(fields.fullName !== undefined ? { full_name: fields.fullName } : {}), ...(fields.contact !== undefined ? { contact: fields.contact } : {}), ...(fields.address !== undefined ? { address: fields.address } : {}), ...(fields.packageName !== undefined ? { package_name: fields.packageName } : {}), ...(fields.packageDays !== undefined ? { package_days: Number(fields.packageDays) } : {}), ...(fields.startedAt !== undefined ? { started_at: fields.startedAt } : {}) };
  const { error } = await supabase.from("members").update(update).eq("member_id", memberId.trim().toUpperCase());
  if (error) throw error;
  return fetchMemberStatusDirect(memberId);
}

export async function deleteMemberDirect(memberId: string) {
  const { error } = await supabase.from("members").delete().eq("member_id", memberId.trim().toUpperCase());
  if (error) throw error;
}

export async function uploadMemberPictureDirect(memberId: string, picture: File) {
  const path = `members/${memberId.trim().toUpperCase()}-${Date.now()}-${picture.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error: uploadError } = await supabase.storage.from("member-photos").upload(path, picture, { contentType: picture.type, upsert: true });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from("member-photos").getPublicUrl(path);
  const { error } = await supabase.from("members").update({ picture_url: data.publicUrl }).eq("member_id", memberId.trim().toUpperCase());
  if (error) throw error;
  return fetchMemberStatusDirect(memberId);
}

export async function createMemberDirect(form: { fullName: string; memberId: string; contact: string; address: string; packageName: string; packageDays: string; picture?: File }) {
  let pictureUrl: string | null = null;
  if (form.picture) {
    const path = `members/${form.memberId.trim().toUpperCase()}-${Date.now()}-${form.picture.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("member-photos").upload(path, form.picture, { contentType: form.picture.type, upsert: true });
    if (error) throw new Error(`Photo upload blocked by Supabase Storage policy: ${error.message}`);
    pictureUrl = supabase.storage.from("member-photos").getPublicUrl(path).data.publicUrl;
  }
  const now = new Date().toISOString();
  const { error } = await supabase.from("members").insert({ id: crypto.randomUUID(), member_id: form.memberId.trim().toUpperCase(), full_name: form.fullName, contact: form.contact, address: form.address, package_name: form.packageName, package_days: Number(form.packageDays), started_at: now, registered_at: now, picture_url: pictureUrl });
  if (error) throw new Error(`Member insert blocked by Supabase RLS: ${error.message}`);
  return fetchMemberStatusDirect(form.memberId);
}
