// /lib/webllm.ts
// Единая инициализация WebLLM: локальная (самохост) загрузка модели,
// кэширование и простой preload. Работает без ключей и без серверных роутов.

let cachedPromise: Promise<any> | null = null;

/**
 * Переопределения через .env.local:
 * - NEXT_PUBLIC_MLC_MODEL        — id модели в стиле HF (по умолчанию компактная Phi-3.1-mini)
 * - NEXT_PUBLIC_MLC_MODEL_URL    — базовый URL к файлам модели (если пусто — /models/<dir>/ из /public)
 * - NEXT_PUBLIC_WASM_THREADS     — "1" чтобы принудительно отключить потоки (на GitHub Pages и т.п.)
 * - NEXT_PUBLIC_HF_TOKEN         — токен HF (нужен только если грузишь прямо с huggingface.co)
 */
const MODEL_ID =
  process.env.NEXT_PUBLIC_MLC_MODEL ||
  "mlc-ai/Phi-3.1-mini-4k-instruct-q4f32_1-MLC";

// Если не задан явный URL, считаем, что ты самохостишь файлы в /public/models/<dir>:
const MODEL_DIRNAME = MODEL_ID.split("/").pop()!;
const DEFAULT_MODEL_URL = `/models/${MODEL_DIRNAME}/`;

const MODEL_URL =
  process.env.NEXT_PUBLIC_MLC_MODEL_URL && process.env.NEXT_PUBLIC_MLC_MODEL_URL.trim() !== ""
    ? process.env.NEXT_PUBLIC_MLC_MODEL_URL
    : DEFAULT_MODEL_URL;

const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;
const WASM_THREADS = process.env.NEXT_PUBLIC_WASM_THREADS; // "1" → без потоков

export async function getEngine() {
  if (cachedPromise) return cachedPromise;

  cachedPromise = (async () => {
    const webllm = await import("@mlc-ai/web-llm");

    // Конфиг инициализации: самохост по умолчанию, прогресс-колбэк и опция потоков
    const opts: any = {
      modelUrl: MODEL_URL,
      // Раскомментируй при отладке прогресса
      // initProgressCallback: (p: any) => console.log(`[WebLLM] ${p?.text ?? ""}`, p?.progress),
    };

    // Если явно просили «без потоков» (например, на GitHub Pages без COOP/COEP)
    if (WASM_THREADS === "1") {
      opts.appConfig = { ...(opts.appConfig ?? {}), wasmNumThreads: 1 };
    }

    // Если вдруг хочешь грузить с huggingface.co (MODEL_URL указывает на https://…),
    // можно передать HF токен:
    if (HF_TOKEN && /^https?:\/\//i.test(MODEL_URL)) {
      opts.hf_token = HF_TOKEN;
    }

    // ВАЖНО: первый параметр — СТРОКА (id), а не объект
    const engine = await webllm.CreateMLCEngine(MODEL_ID, opts);

    // У движка есть OpenAI-подобный интерфейс:
    // await engine.chat.completions.create({ messages: [...] })
    return engine;
  })();

  return cachedPromise;
}

// Необязательный preload — вызови один раз на старте страницы
export async function preloadWebLLM() {
  try {
    await getEngine();
  } catch {
    // Молча игнорируем: UI сам покажет fallback/заглушку при ошибках
  }
}
