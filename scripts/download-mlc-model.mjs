import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const MLC_MODEL_ID = process.env.MLC_MODEL_ID || process.env.NEXT_PUBLIC_MLC_MODEL;
if (!MLC_MODEL_ID) {
  console.error("ENV MLC_MODEL_ID or NEXT_PUBLIC_MLC_MODEL is required.");
  process.exit(1);
}

// basename — имя папки в public/models и model_id для WebLLM
const BASENAME = MLC_MODEL_ID.split("/").pop();
const OUT_DIR = path.join(process.cwd(), "public", "models", BASENAME);
fs.mkdirSync(OUT_DIR, { recursive: true });

// Функция: получить HTTP-код без падения
function httpStatus(url) {
  try {
    const code = execSync(`curl -s -o /dev/null -w "%{http_code}" -L "${url}"`, {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    return code;
  } catch {
    return "000";
  }
}

const FILES = [
  "ndarray-cache.json",
  "mlc-chat-config.json",
  "tokenizer.json",
  // Пытаемся 0..45, но качаем только то, что реально есть (у 1B — 0..21)
  ...Array.from({ length: 46 }, (_, i) => `params_shard_${i}.bin`),
];

for (const f of FILES) {
  const url = `https://huggingface.co/${MLC_MODEL_ID}/resolve/main/${f}`;
  const out = path.join(OUT_DIR, f);
  if (fs.existsSync(out)) {
    console.log("skip", f);
    continue;
  }

  const code = httpStatus(url);
  if (code !== "200") {
    console.log("miss", f, `(HTTP ${code})`);
    continue;
  }

  console.log("get", f);
  execSync(`curl -L --fail -o "${out}" "${url}"`, { stdio: "inherit" });
}

console.log("Done:", OUT_DIR);
