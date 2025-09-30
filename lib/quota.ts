const LIMIT = 5;
const KEY = "aiQuota:v1";

export const LIMIT_MSG =
  "Ты использовал все 5 бесплатных запросов на этот месяц 💙 Спасибо, что тренируешь финский! Лимит обновится автоматически в следующем месяце.";

type Quota = { month: string; used: number; limit: number };

function monthKey(d = new Date()) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function readQuota(): Quota {
  try {
    const raw = localStorage.getItem(KEY);
    const cur = monthKey();
    if (!raw) return { month: cur, used: 0, limit: LIMIT };
    const obj = JSON.parse(raw) as Quota;
    if (obj.month !== cur) return { month: cur, used: 0, limit: LIMIT };
    return { ...obj, limit: LIMIT };
  } catch {
    return { month: monthKey(), used: 0, limit: LIMIT };
  }
}

export function incQuota(): Quota {
  const q = readQuota();
  const next = { ...q, used: q.used + 1 };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function remaining(): number {
  const q = readQuota();
  return Math.max(0, q.limit - q.used);
}
