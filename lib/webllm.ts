// /lib/webllm.ts
// Надёжный запуск WebLLM на GitHub Pages
// 1) MODEL_ID = basename из переменной или дефолта
// 2) MODEL_URL = /models/<MODEL_ID>/
// 3) Жёстко задаём appConfig, чтобы SDK не падал

let cachedPromise: Promise<any> | null = null;

const RAW_ID =
  process.env.NEXT_PUBLIC_MLC_MODEL ||
  "Llama-3.2-3B-Instruct-q4f32_1-MLC"; // то, что реально лежит в public/models

const MODEL_ID = RAW_ID.split("/").pop()!; // "Llama-3.2-3B-Instruct-q4f32_1-MLC"
const MODEL_URL =
  (process.env.NEXT_PUBLIC_MLC_MODEL_URL || "").trim() ||
  `/models/${MODEL_ID}/`;

const WASM_THREADS = process.env.NEXT_PUBLIC_WASM_THREADS;

function log(...args: any[]) {
  console.log("[WebLLM]", ...args);
}

async function ensureLocalModelFolder(): Promise<void> {
  const urls = [`${MODEL_URL}mlc-chat-config.json`, `${MODEL_URL}tokenizer.json`];
  for (const u of urls) {
    const r = await fetch(u, { method: "HEAD" });
    if (!r.ok) {
      throw new Error(
        `Файл не найден: ${u} (HTTP ${r.status}). Проверь MODEL_URL=${MODEL_URL}`
      );
    }
  }
}

export async function getEngine() {
  if (cachedPromise) return cachedPromise;

  cachedPromise = (async () => {
    const webllm = await import("@mlc-ai/web-llm");

    log("MODEL_ID=", MODEL_ID, "MODEL_URL=", MODEL_URL);

    // Проверим что файлы реально есть
    await ensureLocalModelFolder();

    // Жёсткий appConfig
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

    if (WASM_THREADS === "1") {
      appConfig.wasmNumThreads = 1;
    }

    const opts: any = {
      modelUrl: MODEL_URL,
      appConfig,
      initProgressCallback: (p: any) => {
        if (p?.text) log(p.text, p.progress ?? "");
      },
    };

    const engine = await webllm.CreateMLCEngine(MODEL_ID, opts);
    log("Engine ready", engine);
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
