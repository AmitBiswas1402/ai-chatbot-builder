import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "chatBot.js");
    const script = fs.readFileSync(filePath, "utf8");
    return new Response(script, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new NextResponse("console.error('Failed to load chatBot.js');", {
      headers: { "Content-Type": "application/javascript" },
    });
  }
}
