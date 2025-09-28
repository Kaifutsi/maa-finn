// /lib/webllm.ts
// WebLLM: загрузка модели только с локального пути (/models/...)
// + проверка наличия ключевых файлов, + тонкая инициализация.

let cachedPromise: Promise<any> | null = null;

const RAW_ID =
  process.env.NEXT_PUBLIC_MLC_MODEL || "Llama-3.2-1B-Instruct-q4f32_1-MLC";

// basename → то, что ждёт WebLLM как model_id
const MODEL_ID = RAW_ID.split("/").pop()!; // напр. "Llama-3.2-1B-Instruct-q4f32_1-MLC"

const DEFAULT_MODEL_URL = `/models/${MODEL_ID}/`;
const MODEL_URL =
  (process.env.NEXT_PUBLIC_MLC_MODEL_URL || "").trim() || DEFAULT_MODEL_URL;

const WASM_THREADS = process.env.NEXT_PUBLIC_WASM_THREADS;

function log(...args: any[]) {
  // полезные логи в консоль при инициализации
  // eslint-disable-next-line no-console
  console.log("[WebLLM]", ...args);
}

async function ensureLocalModelFolder(): Promise<void> {
  // Проверяем, что статика реально доступна по указанному URL
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

    log("MODEL_ID =", MODEL_ID, "| MODEL_URL =", MODEL_URL);

    // 1) Убедимся, что модель отдается со статики
    await ensureLocalModelFolder();

    // 2) Готовим appConfig в формате, который ожидает WebLLM
    const appConfig: any = {
      model_list: [
        {
          model_id: MODEL_ID,
          // оба ключа поддерживаются в разных версиях конфигов
          model_url: MODEL_URL,
          base_url: MODEL_URL,
        },
      ],
      useIndexedDBCache: true,
    };

    // 3) Конфиг движка (строго только известные поля!)
    const engineConfig: any = {
      appConfig,
      initProgressCallback: (p: any) => {
        if (p?.text) log(p.text, p.progress ?? "");
      },
    };
    if (WASM_THREADS === "1") {
      // на GitHub Pages часто нужен однопоточный wasm
      engineConfig.wasmNumThreads = 1;
    }

    // 4) Стартуем движок
    const engine = await webllm.CreateMLCEngine(MODEL_ID, engineConfig);
    log("Engine ready");
    return engine;
  })();

  return cachedPromise;
}

export async function preloadWebLLM() {
  try {
    await getEngine();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[WebLLM] preload error:", e);
  }
}
