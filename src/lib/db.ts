import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const uri = process.env.MONGODB_URI;

type GlobalMongoose = typeof globalThis & {
  _mongoosePromise?: Promise<typeof mongoose>;
};

const globalMongoose = globalThis as GlobalMongoose;

export async function connectDB(): Promise<typeof mongoose | null> {
  if (!uri) {
    console.warn("MONGODB_URI is not defined, using fallback store.");
    return null;
  }

  if (globalMongoose._mongoosePromise) {
    try {
      return await globalMongoose._mongoosePromise;
    } catch {
      globalMongoose._mongoosePromise = undefined;
    }
  }

  try {
    globalMongoose._mongoosePromise = mongoose
      .connect(uri, {
        dbName: process.env.MONGODB_DB || "ai-chatbot-builder",
        serverSelectionTimeoutMS: 3000,
      })
      .then(() => mongoose);

    return await globalMongoose._mongoosePromise;
  } catch (err: any) {
    console.warn("MongoDB connection failed, falling back to local persistent store:", err?.message || err);
    globalMongoose._mongoosePromise = undefined;
    return null;
  }
}

// Resilient settings storage helper (MongoDB primary, local JSON fallback)
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

function readFallbackStore(): Record<string, any> {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(SETTINGS_FILE, "utf8");
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

function writeFallbackStore(data: Record<string, any>) {
  try {
    ensureDataFile();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to fallback store:", err);
  }
}

export async function getSettingForOwner(ownerId: string) {
  try {
    const conn = await connectDB();
    if (conn) {
      const Setting = (await import("@/models/settings.model")).default;
      const found = await Setting.findOne({ ownerId });
      if (found) return found;
    }
  } catch (err) {
    console.warn("MongoDB read failed, checking fallback store:", err);
  }

  const store = readFallbackStore();
  return store[ownerId] || null;
}

export async function saveSettingForOwner(ownerId: string, update: { businessName?: string; supportEmail?: string; knowledge?: string }) {
  let savedDoc: any = null;

  try {
    const conn = await connectDB();
    if (conn) {
      const Setting = (await import("@/models/settings.model")).default;
      const cleanUpdate: Record<string, any> = { ownerId };
      if (update.businessName !== undefined) cleanUpdate.businessName = update.businessName;
      if (update.supportEmail !== undefined) cleanUpdate.supportEmail = update.supportEmail;
      if (update.knowledge !== undefined) cleanUpdate.knowledge = update.knowledge;

      savedDoc = await Setting.findOneAndUpdate(
        { ownerId },
        cleanUpdate,
        { new: true, upsert: true }
      );
    }
  } catch (err) {
    console.warn("MongoDB save failed, saving to fallback store:", err);
  }

  // Also sync to local fallback store
  const store = readFallbackStore();
  const existing = store[ownerId] || { ownerId };
  const merged = {
    ...existing,
    ...(update.businessName !== undefined && { businessName: update.businessName }),
    ...(update.supportEmail !== undefined && { supportEmail: update.supportEmail }),
    ...(update.knowledge !== undefined && { knowledge: update.knowledge }),
  };
  store[ownerId] = merged;
  writeFallbackStore(store);

  return savedDoc || merged;
}
