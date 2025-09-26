// /lib/webllm.ts
// Единая точка инициализации локальной модели (WebLLM) — офлайн, в браузере.
// Никаких ключей/серверов не нужно. Первая загрузка модели кэшируется.

let cachedPromise: Promise<any> | null = null;

// Можно переопределить модель через .env.local — NEXT_PUBLIC_MLC_MODEL
// Примеры из репозитория MLC:
//  - "Llama-3.2-3B-Instruct-q4f32_1-MLC"
//  - "Phi-3.1-mini-4k-instruct-q4f32_1-MLC"
const DEFAULT_MODEL_ID =
  process.env.NEXT_PUBLIC_MLC_MODEL || "Llama-3.2-3B-Instruct-q4f32_1-MLC";

export async function getEngine() {
  if (cachedPromise) return cachedPromise;

  cachedPromise = (async () => {
    // Dynamic import — библиотека тянется только в браузере
    const webllm = await import("@mlc-ai/web-llm");

    // ВАЖНО: CreateMLCEngine принимает СТРОКУ (id модели) или массив строк — не объект!
    // Передаём строку, чтобы не выпадать в TS-ошибку вида:
    // "Argument of type '{ model: string; }' is not assignable to parameter of type 'string | string[]'."
    const engine = await webllm.CreateMLCEngine(DEFAULT_MODEL_ID, {
      // initProgressCallback: (p: any) => console.log(p.text, p.progress),
    });

    // engine.chat.completions.create(...) — OpenAI-подобный интерфейс
    return engine;
  })();

  return cachedPromise;
}

// Необязательный хелпер (можно вызвать на старте страницы, чтобы заранее подгрузить модель)
export async function preloadWebLLM() {
  try {
    await getEngine();
  } catch {
    // молча — UI сам покажет fallback
  }
}
