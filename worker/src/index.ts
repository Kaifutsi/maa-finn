export interface Env {
  OPENAI_API_KEY: string;
  ALLOWED_ORIGIN?: string;
}

type ChatRole = "system" | "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ChatRequestBody = {
  messages?: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
};

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TEMPERATURE = 0.5;
const DEFAULT_MAX_TOKENS = 256;
const MAX_ALLOWED_TOKENS = 1200;

function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders
    }
  });
}

function textResponse(
  text: string,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(text, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      ...extraHeaders
    }
  });
}

function buildCorsHeaders(origin: string | null, allowedOrigin?: string) {
  const isWildcard = !allowedOrigin || allowedOrigin === "*";
  const allowOrigin = isWildcard
    ? "*"
    : origin && origin === allowedOrigin
      ? origin
      : "";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "content-type, authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function isValidMessage(message: unknown): message is ChatMessage {
  if (!message || typeof message !== "object") return false;

  const msg = message as Record<string, unknown>;

  return (
    (msg.role === "system" || msg.role === "user" || msg.role === "assistant") &&
    typeof msg.content === "string" &&
    msg.content.trim().length > 0
  );
}

function sanitizeTemperature(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_TEMPERATURE;
  }

  if (value < 0) return 0;
  if (value > 2) return 2;

  return value;
}

function sanitizeMaxTokens(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_MAX_TOKENS;
  }

  const normalized = Math.floor(value);

  if (normalized < 1) return DEFAULT_MAX_TOKENS;
  if (normalized > MAX_ALLOWED_TOKENS) return MAX_ALLOWED_TOKENS;

  return normalized;
}

function normalizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];

  return input.filter(isValidMessage).map((msg) => ({
    role: msg.role,
    content: msg.content.trim()
  }));
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const corsHeaders = buildCorsHeaders(req.headers.get("Origin"), env.ALLOWED_ORIGIN);

    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (url.pathname === "/health" && req.method === "GET") {
      return jsonResponse(
        {
          ok: true,
          service: "maafinn-api"
        },
        200,
        corsHeaders
      );
    }

    if (url.pathname !== "/chat") {
      return textResponse("Not found", 404, corsHeaders);
    }

    if (req.method !== "POST") {
      return jsonResponse(
        { error: "Method not allowed" },
        405,
        corsHeaders
      );
    }

    if (!env.OPENAI_API_KEY) {
      return jsonResponse(
        { error: "Server misconfigured: OPENAI_API_KEY is missing" },
        500,
        corsHeaders
      );
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return jsonResponse(
        { error: "Content-Type must be application/json" },
        400,
        corsHeaders
      );
    }

    const body = (await req.json().catch(() => null)) as ChatRequestBody | null;

    if (!body) {
      return jsonResponse(
        { error: "Invalid JSON body" },
        400,
        corsHeaders
      );
    }

    const messages = normalizeMessages(body.messages);
    const temperature = sanitizeTemperature(body.temperature);
    const max_tokens = sanitizeMaxTokens(body.max_tokens);

    if (messages.length === 0) {
      return jsonResponse(
        { error: "messages required" },
        400,
        corsHeaders
      );
    }

    const systemMessage: ChatMessage = {
      role: "system",
      content:
        "Ты помощник MaaFinn. Отвечай только по-русски, понятно, кратко и дружелюбно. Помогай с изучением финского языка, объясняй примеры просто и без воды."
    };

    const hasSystemMessage = messages.some((msg) => msg.role === "system");
    const finalMessages = hasSystemMessage ? messages : [systemMessage, ...messages];

    try {
      const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: finalMessages,
          temperature,
          max_tokens
        })
      });

      const rawText = await openAiResponse.text();

      if (!openAiResponse.ok) {
        return jsonResponse(
          {
            error: "OpenAI request failed",
            status: openAiResponse.status,
            details: rawText
          },
          openAiResponse.status,
          corsHeaders
        );
      }

      let data: unknown;

      try {
        data = JSON.parse(rawText);
      } catch {
        return jsonResponse(
          {
            error: "Invalid JSON from OpenAI",
            details: rawText
          },
          502,
          corsHeaders
        );
      }

      return jsonResponse(data, 200, corsHeaders);
    } catch (error) {
      return jsonResponse(
        {
          error: "Upstream request failed",
          details: error instanceof Error ? error.message : "Unknown error"
        },
        502,
        corsHeaders
      );
    }
  }
};
