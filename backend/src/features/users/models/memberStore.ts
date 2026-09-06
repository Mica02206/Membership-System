import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Member } from "../types/user.js";

// ── Database setup ──────────────────────────────────────────────────────────
const DATA_DIR = path.resolve("data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "members.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id           TEXT PRIMARY KEY,
    memberId     TEXT UNIQUE NOT NULL,
    fullName     TEXT NOT NULL,
    contact      TEXT NOT NULL,
    address      TEXT NOT NULL,
    pictureUrl   TEXT,
    packageName  TEXT NOT NULL,
    packageDays  INTEGER NOT NULL,
    startedAt    TEXT NOT NULL,
    registeredAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS member_activity (
    memberId TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    station TEXT NOT NULL,
    occurredAt TEXT NOT NULL
  );
`);

// ── Seed data (only if table is empty) ─────────────────────────────────────
const count = (db.prepare("SELECT COUNT(*) as n FROM members").get() as { n: number }).n;
if (count === 0) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO members
      (id, memberId, fullName, contact, address, packageName, packageDays, startedAt, registeredAt)
    VALUES
      (@id, @memberId, @fullName, @contact, @address, @packageName, @packageDays, @startedAt, @registeredAt)
  `);
  insert.run({
    id: randomUUID(), memberId: "MBR-2048", fullName: "Avery Johnson",
    contact: "+1 202 555 0148", address: "18 Mercer Street",
    packageName: "Unlimited 30", packageDays: 30,
    startedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    registeredAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  });
  insert.run({
    id: randomUUID(), memberId: "MBR-1182", fullName: "Jordan Lee",
    contact: "+1 202 555 0191", address: "42 King Avenue",
    packageName: "Starter 7", packageDays: 7,
    startedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    registeredAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  });
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function rowToMember(row: Record<string, unknown>): Member {
  return {
    id:          row.id as string,
    memberId:    row.memberId as string,
    fullName:    row.fullName as string,
    contact:     row.contact as string,
    address:     row.address as string,
    pictureUrl:  row.pictureUrl as string | undefined,
    packageName: row.packageName as string,
    packageDays: row.packageDays as number,
    startedAt:   row.startedAt as string,
    registeredAt: row.registeredAt as string | undefined,
  };
}

// ── Store API ────────────────────────────────────────────────────────────────
export const memberStore = {
  all: (): Member[] =>
    (db.prepare("SELECT * FROM members ORDER BY registeredAt DESC").all() as Record<string, unknown>[]).map(rowToMember),

  findByMemberId: (memberId: string): Member | undefined => {
    const row = db.prepare("SELECT * FROM members WHERE memberId = ?").get(memberId.toUpperCase()) as Record<string, unknown> | undefined;
    return row ? rowToMember(row) : undefined;
  },

  recordActivity: (memberId: string, action: "check-in" | "check-out", station = "Kiosk"): boolean => {
    const normalizedMemberId = memberId.trim().toUpperCase();
    const result = db.prepare(`
      INSERT INTO member_activity (memberId, action, station, occurredAt)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(memberId) DO UPDATE SET
        action = excluded.action,
        station = excluded.station,
        occurredAt = excluded.occurredAt
    `).run(normalizedMemberId, action, station, new Date().toISOString());
    return result.changes > 0;
  },

  lastActivity: (memberId: string): { action: "check-in" | "check-out"; station: string; occurredAt: string } | undefined => {
    const row = db.prepare("SELECT action, station, occurredAt FROM member_activity WHERE memberId = ?")
      .get(memberId.trim().toUpperCase()) as { action: "check-in" | "check-out"; station: string; occurredAt: string } | undefined;
    return row;
  },

  create: (input: Omit<Member, "id" | "startedAt">): Member => {
    const now = new Date().toISOString();
    const member: Member = { ...input, id: randomUUID(), startedAt: now };
    db.prepare(`
      INSERT INTO members (id, memberId, fullName, contact, address, pictureUrl, packageName, packageDays, startedAt, registeredAt)
      VALUES (@id, @memberId, @fullName, @contact, @address, @pictureUrl, @packageName, @packageDays, @startedAt, @registeredAt)
    `).run({ ...member, pictureUrl: member.pictureUrl ?? null, registeredAt: now });
    return member;
  },

  renew: (memberId: string, days?: number): Member | null => {
    const normalizedMemberId = memberId.trim().toUpperCase();
    const row = db.prepare("SELECT * FROM members WHERE memberId = ?").get(normalizedMemberId) as Record<string, unknown> | undefined;
    if (!row) return null;

    const current = rowToMember(row);
    const renewalDays = days && days > 0 ? Math.floor(days) : current.packageDays;
    const currentExpiry = new Date(current.startedAt).getTime() + current.packageDays * 86400000;
    const renewalStart = new Date(Math.max(Date.now(), currentExpiry)).toISOString();

    db.prepare("UPDATE members SET startedAt = ?, packageDays = ? WHERE memberId = ?").run(
      renewalStart,
      renewalDays,
      normalizedMemberId,
    );

    const updated = db.prepare("SELECT * FROM members WHERE memberId = ?").get(normalizedMemberId) as Record<string, unknown> | undefined;
    return updated ? rowToMember(updated) : null;
  },

  updatePicture: (memberId: string, pictureUrl: string): Member | null => {
    db.prepare("UPDATE members SET pictureUrl = ? WHERE memberId = ?").run(pictureUrl, memberId.toUpperCase());
    const row = db.prepare("SELECT * FROM members WHERE memberId = ?").get(memberId.toUpperCase()) as Record<string, unknown> | undefined;
    return row ? rowToMember(row) : null;
  },

  update: (memberId: string, fields: Partial<Omit<Member, "id" | "memberId">>): Member | null => {
    const normalizedMemberId = memberId.trim().toUpperCase();
    const existing = db.prepare("SELECT * FROM members WHERE memberId = ?").get(normalizedMemberId) as Record<string, unknown> | undefined;
    if (!existing) return null;
    const current = rowToMember(existing);
    const merged = {
      ...current,
      ...Object.fromEntries(
        Object.entries(fields).filter(([, value]) => value !== undefined),
      ),
    } as Member;
    db.prepare(`
      UPDATE members SET fullName=@fullName, contact=@contact, address=@address,
        packageName=@packageName, packageDays=@packageDays, startedAt=@startedAt
      WHERE memberId=@memberId
    `).run({
      fullName: merged.fullName,
      contact: merged.contact,
      address: merged.address,
      packageName: merged.packageName,
      packageDays: Number(merged.packageDays),
      startedAt: merged.startedAt,
      memberId: normalizedMemberId,
    });
    const updated = db.prepare("SELECT * FROM members WHERE memberId = ?").get(normalizedMemberId) as Record<string, unknown> | undefined;
    return updated ? rowToMember(updated) : null;
  },

  delete: (memberId: string): boolean => {
    const normalizedMemberId = memberId.trim().toUpperCase();
    const row = db.prepare("SELECT pictureUrl FROM members WHERE memberId = ?").get(normalizedMemberId) as { pictureUrl: string | null } | undefined;
    if (row?.pictureUrl) {
      const abs = path.resolve(row.pictureUrl.replace(/^\//, ""));
      try {
        if (fs.existsSync(abs)) fs.unlinkSync(abs);
      } catch {
        // Removing the database record should not fail because a photo is unavailable.
      }
    }
    const result = db.prepare("DELETE FROM members WHERE memberId = ?").run(normalizedMemberId);
    return result.changes > 0;
  },
};
