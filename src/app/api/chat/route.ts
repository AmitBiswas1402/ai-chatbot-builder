import { getSettingForOwner } from "@/lib/db";
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

    const setting = await getSettingForOwner(ownerId);

    const businessName = setting?.businessName?.trim() || "our business";
    const supportEmail = setting?.supportEmail?.trim() || "our support team";
    const knowledgeBase = setting?.knowledge?.trim() || "";

    if (!setting || !knowledgeBase) {
      return NextResponse.json({
        text: `Hello! I am the AI customer support assistant for ${businessName}. Our business knowledge base has not been fully configured yet in the Dashboard. Once details are added, I'll be able to answer specific product, pricing, and policy questions!`
      }, { headers: corsHeaders });
    }

    const prompt = `
You are a friendly, helpful, and professional AI customer support agent for "${businessName}".

CRITICAL GUIDELINES:
1. GREETINGS: If the customer greets you (e.g. "hi", "hello", "hey", "good morning"), reply warmly, welcome them to ${businessName}, and ask how you can help them today.
2. ACCURACY: Use ONLY the provided business information below to answer questions about products, services, return policies, shipping, or pricing.
3. UNKNOWN QUESTIONS: If the question cannot be answered using the provided information, politely reply: "I don't have that specific information right now. Please reach out to customer support at ${supportEmail} for further assistance." Do NOT invent policies or details that are not in the knowledge base.
4. TONE: Be polite, clear, concise, and professional.

---------------------
BUSINESS INFORMATION:
Business Name: ${businessName}
Support Email: ${supportEmail}
Knowledge Base:
${knowledgeBase}
---------------------

CUSTOMER QUESTION:
${message}

HELPFUL ANSWER:
`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const modelsToTry = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
    let response: { text?: string | null } | null = null;
    for (const model of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        if (response?.text) break;
      } catch (err) {
        console.warn(`Model ${model} failed:`, err);
      }
    }
    if (!response?.text) {
      throw new Error("Unable to generate answer with Gemini AI");
    }

    return NextResponse.json({ text: response.text ?? "" }, { headers: corsHeaders });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Error generating AI content: ${errorMessage}` },
      { status: 500, headers: corsHeaders },
    );
  }
}
