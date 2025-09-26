// /lib/webllm.ts
// Надёжная инициализация WebLLM: model_id = basename, явный appConfig.model_list.

let cachedPromise: Promise<any> | null = null;

// Полный id, если приходит из env (может быть 'mlc-ai/...'), иначе дефолт
const RAW_ID =
  process.env.NEXT_PUBLIC_MLC_MODEL ||
  "mlc-ai/Phi-3.1-mini-4k-instruct-q4f32_1-MLC";

// Базовое имя модели (то, что WebLLM ждёт как model_id)
const MODEL_ID = RAW_ID.split("/").pop()!; // -> "Phi-3.1-mini-4k-instruct-q4f32_1-MLC"

// Откуда брать файлы модели (папка, размещённая в public/models/...)
const DEFAULT_MODEL_URL = `/models/${MODEL_ID}/`;
const MODEL_URL =
  (process.env.NEXT_PUBLIC_MLC_MODEL_URL || "").trim() || DEFAULT_MODEL_URL;

const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;
const WASM_THREADS = process.env.NEXT_PUBLIC_WASM_THREADS; // "1" => без потоков

export async function getEngine() {
  if (cachedPromise) return cachedPromise;

  cachedPromise = (async () => {
    const webllm = await import("@mlc-ai/web-llm");

    // ЯВНЫЙ список моделей — ключевое: model_id должен совпадать с первым аргументом
    const appConfig: any = {
      model_list: [
        {
          model_id: MODEL_ID,       // <-- basename
          model_url: MODEL_URL,     // обе формы поддерживаются в lib
          base_url: MODEL_URL,
        },
      ],
      useIndexedDBCache: true,
    };

    if (WASM_THREADS === "1") {
      appConfig.wasmNumThreads = 1; // для Pages без COOP/COEP
    }

    const opts: any = {
      modelUrl: MODEL_URL, // дублируем
      appConfig,
      // initProgressCallback: (p: any) => console.log("[WebLLM]", p?.text, p?.progress),
    };

    if (HF_TOKEN && /^https?:\/\//i.test(MODEL_URL)) {
      opts.hf_token = HF_TOKEN;
    }

    // ВАЖНО: первый арг — ТОЧНО такой же, как model_id выше (basename)
    const engine = await webllm.CreateMLCEngine(MODEL_ID, opts);
    return engine;
  })();

  return cachedPromise;
}

export async function preloadWebLLM() {
  try {
    await getEngine();
  } catch {}
}
