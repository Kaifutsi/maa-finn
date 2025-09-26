// /lib/webllm.ts
// Инициализация WebLLM с явным appConfig.model_list, чтобы избежать ошибок вида
// "Cannot read properties of undefined (reading 'find')".

let cachedPromise: Promise<any> | null = null;

const MODEL_ID =
  process.env.NEXT_PUBLIC_MLC_MODEL ||
  "mlc-ai/Phi-3.1-mini-4k-instruct-q4f32_1-MLC";

const MODEL_DIRNAME = MODEL_ID.split("/").pop()!;
const DEFAULT_MODEL_URL = `/models/${MODEL_DIRNAME}/`;

const MODEL_URL =
  process.env.NEXT_PUBLIC_MLC_MODEL_URL &&
  process.env.NEXT_PUBLIC_MLC_MODEL_URL.trim() !== ""
    ? process.env.NEXT_PUBLIC_MLC_MODEL_URL
    : DEFAULT_MODEL_URL;

const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;
const WASM_THREADS = process.env.NEXT_PUBLIC_WASM_THREADS; // "1" → без потоков

export async function getEngine() {
  if (cachedPromise) return cachedPromise;

  cachedPromise = (async () => {
    const webllm = await import("@mlc-ai/web-llm");

    // ЯВНО задаём список моделей: это устраняет падение на .find(...)
    const appConfig: any = {
      model_list: [
        {
          model_id: MODEL_ID,
          // web-llm понимает model_url или base_url (встречается в разных версиях)
          model_url: MODEL_URL,
          base_url: MODEL_URL,
        },
      ],
      useIndexedDBCache: true,
    };

    if (WASM_THREADS === "1") {
      // ключ может называться wasmNumThreads (в новых билдах)
      appConfig.wasmNumThreads = 1;
    }

    const opts: any = {
      // дублируем modelUrl на всякий случай
      modelUrl: MODEL_URL,
      appConfig,
      // initProgressCallback: (p: any) => console.log("[WebLLM]", p?.text, p?.progress),
    };

    if (HF_TOKEN && /^https?:\/\//i.test(MODEL_URL)) {
      opts.hf_token = HF_TOKEN;
    }

    // ВАЖНО: первый аргумент — СТРОКА (id модели)
    const engine = await webllm.CreateMLCEngine(MODEL_ID, opts);
    return engine;
  })();

  return cachedPromise;
}

export async function preloadWebLLM() {
  try {
    await getEngine();
  } catch {
    /* no-op */
  }
}
