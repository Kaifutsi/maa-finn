// scripts/download-mlc-model.mjs
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Берём из env, иначе дефолт на 1B
let MODEL_ID = process.env.MLC_MODEL_ID || process.env.NEXT_PUBLIC_MLC_MODEL || "Llama-3.2-1B-Instruct-q4f32_1-MLC";
if (!MODEL_ID.includes("/")) MODEL_ID = `mlc-ai/${MODEL_ID}`;

const FOLDER  = MODEL_ID.split("/").pop();
const OUT_DIR = path.join(process.cwd(), "public", "models", FOLDER);
fs.mkdirSync(OUT_DIR, { recursive: true });

const CORE = ["ndarray-cache.json", "mlc-chat-config.json", "tokenizer.json"];

// Для 1B обычно хватает ~22 шардов. Пройдём с запасом и пропустим 404.
const SHARDS = Array.from({ length: 64 }, (_, i) => `params_shard_${i}.bin`);
const FILES = [...CORE, ...SHARDS];

for (const f of FILES) {
  const url = `https://huggingface.co/${MODEL_ID}/resolve/main/${f}`;
  const out = path.join(OUT_DIR, f);
  if (fs.existsSync(out)) { console.log("skip", f); continue; }
  try {
    console.log("get", f);
    execSync(`curl -L --fail -o "${out}" "${url}"`, { stdio: "inherit" });
  } catch {
    if (fs.existsSync(out)) fs.rmSync(out);
    console.log("miss", f);
  }
}
console.log("Done:", OUT_DIR);
