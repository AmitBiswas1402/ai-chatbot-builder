import { connectDB } from "@/lib/db";
import Setting from "@/models/settings.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { ownerId, businessName, supportEmail, knowledge } = await req.json();

    if (!ownerId) {
      return new NextResponse(
        JSON.stringify({ error: "Owner ID is required" }),
        { status: 400 },
      );
    }

    await connectDB();

    const settings = await Setting.findOneAndUpdate(
      { ownerId },
      { ownerId, businessName, supportEmail, knowledge },
      { new: true, upsert: true },
    );
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { message: `settings error : ${error}` },
      { status: 500 },
    );
  }
}
