// /lib/webllm.ts
// Надёжный запуск WebLLM: жёстко задаём model_id + model_url и
// пробрасываем modelUrl (даже если TS ругается — кастом к any).

let cachedPromise: Promise<any> | null = null;

const RAW_ID =
  process.env.NEXT_PUBLIC_MLC_MODEL ||
  "Llama-3.2-1B-Instruct-q4f32_1-MLC";

// basename для WebLLM = последний сегмент
const MODEL_ID = RAW_ID.split("/").pop()!; // "Llama-3.2-1B-Instruct-q4f32_1-MLC"

// берём URL из env или по умолчанию /models/<MODEL_ID>/
const DEFAULT_MODEL_URL = `/models/${MODEL_ID}/`;
function withTrailingSlash(s: string) {
  return s.endsWith("/") ? s : s + "/";
}
const MODEL_URL = withTrailingSlash(
  (process.env.NEXT_PUBLIC_MLC_MODEL_URL || "").trim() || DEFAULT_MODEL_URL
);

const WASM_THREADS = process.env.NEXT_PUBLIC_WASM_THREADS; // "1" для Pages

function log(...args: any[]) {
  console.log("[WebLLM]", ...args);
}

async function ensureLocalModelFolder(): Promise<void> {
  // проверяем HEAD двух ключевых файлов — сразу поймём, верно ли MODEL_URL
  for (const f of ["mlc-chat-config.json", "tokenizer.json"]) {
    const u = MODEL_URL + f;
    const r = await fetch(u, { method: "HEAD" });
    if (!r.ok) {
      throw new Error(`Файл не найден: ${u} (HTTP ${r.status}). Проверь NEXT_PUBLIC_MLC_MODEL_URL=${MODEL_URL}`);
    }
  }
}

export async function getEngine() {
  if (cachedPromise) return cachedPromise;

  cachedPromise = (async () => {
    const webllm = await import("@mlc-ai/web-llm");
    log("MODEL_ID=", MODEL_ID, "MODEL_URL=", MODEL_URL);

    // 1) убеждаемся, что файлы доступны
    await ensureLocalModelFolder();

    // 2) собираем appConfig + обязательно пробрасываем modelUrl
    const appConfig: any = {
      model_list: [
        {
          model_id: MODEL_ID,
          model_url: MODEL_URL, // для новых версий
          base_url: MODEL_URL,  // на всякий случай
        },
      ],
      useIndexedDBCache: true,
    };
    if (WASM_THREADS === "1") appConfig.wasmNumThreads = 1;

    const opts: any = {
      // ВАЖНО: modelUrl нужен рантайму (даже если типы его не знают)
      modelUrl: MODEL_URL,
      appConfig,
      initProgressCallback: (p: any) => {
        if (p?.text) log(p.text, p.progress ?? "");
      },
    };

    // 3) создаём движок
    const engine = await (webllm as any).CreateMLCEngine(MODEL_ID, opts);
    log("Engine ready");
    return engine;
  })();

  return cachedPromise;
}

export async function preloadWebLLM() {
  try {
    await getEngine();
  } catch (e) {
    console.error("[WebLLM] preload error:", e);
  }
}
