import { NextRequest, NextResponse } from "next/server";

const LIMIT = 5;
const COOKIE = "ask_quota_v1";

function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function nextMonthResetTs() {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export async function POST(req: NextRequest) {
  const nowKey = monthKey();
  const raw = req.cookies.get(COOKIE)?.value || "";
  const [savedKey, savedCountStr] = raw.split(":");
  const parsed = Number(savedCountStr);
  const used = savedKey === nowKey && Number.isFinite(parsed) ? parsed : 0;
  const resetAt = nextMonthResetTs();

  if (used >= LIMIT) {
    return NextResponse.json(
      { paywall: true, scope: "month", limit: LIMIT, remaining: 0, resetAt },
      { status: 402 }
    );
  }

  let question = "";
  try {
    const body = await req.json();
    question = String(body?.question ?? "").trim();
  } catch {}
  if (!question) {
    return NextResponse.json({ error: "Пустой запрос" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Ты — дружелюбный преподаватель финского языка (Suomen kieli). " +
              "Отвечай кратко и чётко, фокусируясь ТОЛЬКО на финском. " +
              "Если спрашивают про другой язык — мягко верни тему к финскому. " +
              "Приводи примеры на финском с глоссами RU/EN при необходимости.",
          },
          { role: "user", content: question },
        ],
        temperature: 0.5,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream error ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const answer = data?.choices?.[0]?.message?.content ?? "";

    const newCount = used + 1;
    const out = NextResponse.json({
      answer,
      quota: { limit: LIMIT, used: newCount, remaining: Math.max(0, LIMIT - newCount), resetAt },
    });
    out.cookies.set(COOKIE, `${nowKey}:${newCount}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(resetAt),
      path: "/",
    });
    return out;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
