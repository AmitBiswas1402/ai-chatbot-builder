import { connectDB } from "@/lib/db";
import Setting from "@/models/settings.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { ownerId } = await req.json();

    if (!ownerId) {
      return NextResponse.json(
        { message: "Owner ID is required" },
        { status: 400 },
      );
    }
    await connectDB();
    const settings = await Setting.findOne({
      ownerId: ownerId,
    });

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { message: `settings error: ${error}` },
      { status: 500 },
    );
  }
}
