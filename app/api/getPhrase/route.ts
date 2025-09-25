import { NextRequest, NextResponse } from "next/server";

const LIMIT = 5;
const COOKIE = "phrase_quota_v1";

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
              "Ты — преподаватель финского языка. Генерируешь фразы ТОЛЬКО на финском. " +
              "Уровень A1–A2, повседневные короткие предложения. Никаких переводов, " +
              "никаких комментариев, только сама финская фраза.",
          },
          { role: "user", content: "Дай одну короткую финскую фразу для тренировки произношения. Без кавычек." },
        ],
        temperature: 0.8,
        max_tokens: 30,
      }),
    });

    if (!res.ok) {
      // не списываем попытку
      return NextResponse.json({ error: `Upstream error ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const phrase = data?.choices?.[0]?.message?.content?.trim() || "Hei!";
    const clean = phrase.replace(/^['\"«»]+|['\"«»]+$/g, "");

    const newCount = used + 1;
    const out = NextResponse.json({
      phrase: clean,
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
    return NextResponse.json({ phrase: "Minä puhun suomea vähän." }, { status: 500 });
  }
}
