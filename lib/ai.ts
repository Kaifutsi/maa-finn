// Универсальный клиент к твоему Cloudflare Worker (OpenAI-совместный ответ)
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "https://maafinn-api.maafinn.workers.dev";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatChoice = {
  message?: { content?: string };
  text?: string;
};

type OpenAICompatResponse = {
  choices?: ChatChoice[];
};

export async function chat(
  messages: ChatMessage[],
  opts?: { temperature?: number; max_tokens?: number }
) {
  const r = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      messages,
      temperature: opts?.temperature ?? 0.5,
      max_tokens: opts?.max_tokens ?? 256,
    }),
  });

  if (!r.ok) {
    const t = await r.text();
    throw new Error(`API ${r.status}: ${t}`);
  }

  const json = (await r.json()) as OpenAICompatResponse;

  // поддерживаем и responses с message.content, и text
  const text =
    json.choices?.[0]?.message?.content ??
    json.choices?.[0]?.text ??
    "";

  return String(text);
}
