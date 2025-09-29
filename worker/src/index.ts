/// <reference types="@cloudflare/workers-types" />

export interface Env {
  OPENAI_API_KEY: string;
  ALLOWED_ORIGIN?: string;
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function corsHeaders(origin: string | null, allowed: string | undefined) {
  const allow =
    (allowed || "*") === "*"
      ? "*"
      : origin && origin === allowed
      ? origin
      : "";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
}

export default {
  async fetch(req: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const headers = corsHeaders(req.headers.get("Origin"), env.ALLOWED_ORIGIN);

    if (req.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (url.pathname === "/chat" && req.method === "POST") {
      if (!env.OPENAI_API_KEY) {
        return new Response(
          JSON.stringify({ error: "Server misconfigured" }),
          { status: 500, headers: { "content-type": "application/json", ...headers } }
        );
      }

      const body = (await req.json().catch(() => null)) as
        | { messages?: ChatMessage[]; temperature?: number; max_tokens?: number }
        | null;

      const messages = Array.isArray(body?.messages) ? body!.messages : [];
      const temperature =
        typeof body?.temperature === "number" ? body!.temperature : 0.5;
      const max_tokens =
        typeof body?.max_tokens === "number" ? body!.max_tokens : 256;

      if (messages.length === 0) {
        return new Response(JSON.stringify({ error: "messages required" }), {
          status: 400,
          headers: { "content-type": "application/json", ...headers }
        });
      }

      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature,
          max_tokens
        })
      });

      if (!r.ok) {
        const text = await r.text();
        return new Response(text, { status: r.status, headers });
      }

      // Проксируем OpenAI-совместный JSON как есть
      const data = await r.json();
      return new Response(JSON.stringify(data), {
        headers: { "content-type": "application/json", ...headers }
      });
    }

    return new Response("ok", { headers });
  }
};
