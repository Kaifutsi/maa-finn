import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const MODEL_ID = "mlc-ai/Llama-3.2-3B-Instruct-q4f32_1-MLC";
const OUT_DIR = path.join(process.cwd(), "public", "models", "Llama-3.2-3B-Instruct-q4f32_1-MLC");

fs.mkdirSync(OUT_DIR, { recursive: true });

// Список нужных файлов (минимально достаточный набор для WebLLM)
const FILES = [
  "ndarray-cache.json",
  "mlc-chat-config.json",
  "tokenizer.json",
  "params_shard_0.bin",
  "params_shard_1.bin",
  "params_shard_2.bin",
  "params_shard_3.bin",
  "params_shard_4.bin",
  "params_shard_5.bin",
  "params_shard_6.bin",
  "params_shard_7.bin",
  "params_shard_8.bin",
  "params_shard_9.bin",
  "params_shard_10.bin",
  "params_shard_11.bin",
  "params_shard_12.bin",
  "params_shard_13.bin",
  "params_shard_14.bin",
  "params_shard_15.bin",
  "params_shard_16.bin",
  "params_shard_17.bin",
  "params_shard_18.bin",
  "params_shard_19.bin",
  "params_shard_20.bin",
  "params_shard_21.bin",
  "params_shard_22.bin",
  "params_shard_23.bin",
  "params_shard_24.bin",
  "params_shard_25.bin",
  "params_shard_26.bin",
  "params_shard_27.bin",
  "params_shard_28.bin",
  "params_shard_29.bin",
  "params_shard_30.bin",
  "params_shard_31.bin",
  "params_shard_32.bin",
  "params_shard_33.bin",
  "params_shard_34.bin",
  "params_shard_35.bin",
  "params_shard_36.bin",
  "params_shard_37.bin",
  "params_shard_38.bin",
  "params_shard_39.bin",
  "params_shard_40.bin",
  "params_shard_41.bin",
  "params_shard_42.bin",
  "params_shard_43.bin",
  "params_shard_44.bin",
  "params_shard_45.bin",
];

for (const f of FILES) {
  const url = `https://huggingface.co/${MODEL_ID}/resolve/main/${f}`;
  const out = path.join(OUT_DIR, f);
  if (fs.existsSync(out)) {
    console.log("skip", f);
    continue;
  }
  console.log("get", f);
  execSync(`curl -L --fail -o "${out}" "${url}"`, { stdio: "inherit" });
}

console.log("Done:", OUT_DIR);
