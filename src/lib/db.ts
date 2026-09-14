import fs from "fs";
import path from "path";

export interface OwnerSetting {
  ownerId: string;
  businessName?: string;
  supportEmail?: string;
  knowledge?: string;
  updatedAt?: string;
}

// Resilient settings storage helper (Local persistent store, ready for Drizzle / Neon DB integration)
const DATA_DIR = path.join(process.cwd(), ".data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify({}), "utf8");
  }
}

function readStore(): Record<string, OwnerSetting> {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(SETTINGS_FILE, "utf8");
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

function writeStore(data: Record<string, OwnerSetting>) {
  try {
    ensureDataFile();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to settings store:", err);
  }
}

export async function getSettingForOwner(ownerId: string): Promise<OwnerSetting | null> {
  const store = readStore();
  return store[ownerId] || null;
}

export async function saveSettingForOwner(
  ownerId: string,
  update: { businessName?: string; supportEmail?: string; knowledge?: string }
): Promise<OwnerSetting> {
  const store = readStore();
  const existing = store[ownerId] || { ownerId };
  const merged: OwnerSetting = {
    ...existing,
    ...(update.businessName !== undefined && { businessName: update.businessName }),
    ...(update.supportEmail !== undefined && { supportEmail: update.supportEmail }),
    ...(update.knowledge !== undefined && { knowledge: update.knowledge }),
    updatedAt: new Date().toISOString(),
  };
  store[ownerId] = merged;
  writeStore(store);

  return merged;
}
