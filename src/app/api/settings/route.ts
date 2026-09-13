import { getSettingForOwner, saveSettingForOwner } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const ownerId = req.nextUrl.searchParams.get("ownerId");
    if (!ownerId) {
      return NextResponse.json({ error: "Owner ID is required" }, { status: 400 });
    }

    const setting = await getSettingForOwner(ownerId);
    return NextResponse.json(setting || {});
  } catch (error) {
    console.error("GET Settings API Error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ownerId, businessName, supportEmail, knowledge } = body;

    if (!ownerId) {
      return NextResponse.json(
        { error: "Owner ID is required" },
        { status: 400 },
      );
    }

    // If query-only payload (no fields provided), act as a safe read
    if (businessName === undefined && supportEmail === undefined && knowledge === undefined) {
      const existing = await getSettingForOwner(ownerId);
      return NextResponse.json(existing || {});
    }

    const settings = await saveSettingForOwner(ownerId, {
      businessName,
      supportEmail,
      knowledge,
    });
    
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Settings API Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to save settings", details: errorMessage },
      { status: 500 },
    );
  }
}
