// /lib/webllm.ts
// Надёжный запуск WebLLM на GitHub Pages c авто-ретраем сигнатуры API.

let cachedPromise: Promise<any> | null = null;

const RAW_ID =
  process.env.NEXT_PUBLIC_MLC_MODEL ||
  "Llama-3.2-3B-Instruct-q4f32_1-MLC"; // именно эта папка лежит в public/models

const MODEL_ID = RAW_ID.split("/").pop()!; // → "Llama-3.2-3B-Instruct-q4f32_1-MLC"
const MODEL_URL =
  (process.env.NEXT_PUBLIC_MLC_MODEL_URL || "").trim() ||
  `/models/${MODEL_ID}/`;

const WASM_THREADS = process.env.NEXT_PUBLIC_WASM_THREADS;

function log(...args: any[]) {
  // чуть больше логов для диагностики в консоли
  console.log("[WebLLM]", ...args);
}

async function ensureLocalModelFolder(): Promise<void> {
  // минимальная проверка доступности файлов, чтобы сразу ловить 404
  for (const file of ["mlc-chat-config.json", "tokenizer.json"]) {
    const u = `${MODEL_URL}${file}`;
    const r = await fetch(u, { method: "HEAD" });
    if (!r.ok) throw new Error(`Файл не найден: ${u} (HTTP ${r.status}). Проверь MODEL_URL=${MODEL_URL}`);
  }
}

export async function getEngine() {
  if (cachedPromise) return cachedPromise;

  cachedPromise = (async () => {
    const webllm = await import("@mlc-ai/web-llm");

    log("MODEL_ID=", MODEL_ID, "MODEL_URL=", MODEL_URL);

    await ensureLocalModelFolder();

    // жёсткий appConfig
    const appConfig: any = {
      model_list: [
        {
          model_id: MODEL_ID,
          model_url: MODEL_URL,
          base_url: MODEL_URL,
        },
      ],
      useIndexedDBCache: true,
    };
    if (WASM_THREADS === "1") appConfig.wasmNumThreads = 1;

    const baseOpts: any = {
      appConfig,
      modelUrl: MODEL_URL, // пусть будет и тут
      initProgressCallback: (p: any) => p?.text && log(p.text, p.progress ?? ""),
    };

    // --- совместимость с разными версиями web-llm ---
    let engine: any;
    try {
      // v0.2.x иногда ждёт (modelId, modelUrl: string, opts?)
      log("CreateMLCEngine try: (id, url, opts)");
      engine = await (webllm as any).CreateMLCEngine(MODEL_ID, MODEL_URL, baseOpts);
    } catch (e1) {
      log("Fallback CreateMLCEngine: (id, opts) because", e1);
      // другой вариант: (modelId, opts)
      engine = await (webllm as any).CreateMLCEngine(MODEL_ID, baseOpts);
    }

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
