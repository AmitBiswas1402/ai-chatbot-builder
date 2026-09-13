import { getSettingForOwner } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req: NextRequest) {
  try {
    const ownerId = req.nextUrl.searchParams.get("ownerId");
    if (!ownerId) {
      return NextResponse.json({ message: "Owner ID is required" }, { status: 400, headers: corsHeaders });
    }
    const settings = await getSettingForOwner(ownerId);
    return NextResponse.json(settings || {}, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: `settings error: ${error}` }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ownerId } = await req.json();
    if (!ownerId) {
      return NextResponse.json(
        { message: "Owner ID is required" },
        { status: 400, headers: corsHeaders },
      );
    }
    const settings = await getSettingForOwner(ownerId);
    return NextResponse.json(settings || {}, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { message: `settings error: ${error}` },
      { status: 500, headers: corsHeaders },
    );
  }
}
