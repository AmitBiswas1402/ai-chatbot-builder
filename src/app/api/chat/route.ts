import { connectDB } from "@/lib/db";
import Setting from "@/models/settings.model";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

type ChatPayload = { message?: string; ownerId?: string };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let parsedBody: ChatPayload = {};

    try {
      parsedBody = JSON.parse(rawBody) as ChatPayload;
    } catch {
      // Accept JSON-like text payloads with trailing commas.
      const repairedBody = rawBody.replace(/,\s*([}\]])/g, "$1");

      try {
        parsedBody = JSON.parse(repairedBody) as ChatPayload;
      } catch {
        // Last fallback for text mode: extract known fields from raw content.
        const messageMatch = rawBody.match(/['"]message['"]\s*:\s*['"]([\s\S]*?)['"]/i);
        const ownerIdMatch = rawBody.match(/['"]ownerId['"]\s*:\s*['"]([\s\S]*?)['"]/i);

        parsedBody = {
          message: messageMatch?.[1]?.trim(),
          ownerId: ownerIdMatch?.[1]?.trim(),
        };
      }
    }

    // Fallback for clients sending form-urlencoded payloads.
    if (!parsedBody.message || !parsedBody.ownerId) {
      const form = new URLSearchParams(rawBody);
      parsedBody = {
        message: parsedBody.message ?? form.get("message") ?? undefined,
        ownerId: parsedBody.ownerId ?? form.get("ownerId") ?? undefined,
      };
    }

    // Final fallback: accept query params when clients post with empty body.
    if (!parsedBody.message || !parsedBody.ownerId) {
      parsedBody = {
        message: parsedBody.message ?? req.nextUrl.searchParams.get("message") ?? undefined,
        ownerId: parsedBody.ownerId ?? req.nextUrl.searchParams.get("ownerId") ?? undefined,
      };
    }

    const { message, ownerId } = parsedBody;

    if (!message || !ownerId) {
      return NextResponse.json(
        { error: "Message and ownerId are required" },
        { status: 400, headers: corsHeaders },
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500, headers: corsHeaders },
      );
    }

    await connectDB();

    const setting = await Setting.findOne({ ownerId });

    if (!setting) {
      return NextResponse.json(
        { message: "No settings found for this ownerId" },
        { status: 404, headers: corsHeaders },
      );
    }

    const KNOWLEDGE = `
    Business Name: ${setting.businessName || "not provided"}
    Support Email: ${setting.supportEmail || "not provided"}
    Knowledge: ${setting.knowledge || "not provided"}
    `;

    const prompt = `
    You are a professional customer support agent for. Use ONLY the information provided below to answer the customer's question. You may rephrase, summarize, or interpret the information if needed. Do NOT invent new policies, prices, or promises. If you don't know the answer, say you don't know. Do not make up an answer. Reply with "Please contact customer support for more information." if the question is not answerable based on the provided information.:

    ---------------------
    BUSINESS INFORMATION:
    ---------------------

    ${KNOWLEDGE}

    ---------------------
    CUSTOMER QUESTION:
    ---------------------
    ${message}

    ----------------------
    ANSWER:
    ----------------------
    `;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ text: response.text ?? "" }, { headers: corsHeaders });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Error generating AI content: ${errorMessage}` },
      { status: 500, headers: corsHeaders },
    );
  }
}
