// /lib/webllm.ts
// Надёжный запуск WebLLM на GitHub Pages.
// 1) Берём basename модели как model_id (то, что ждёт WebLLM).
// 2) Подтягиваем mlc-chat-config.json из /public/models/... чтобы убедиться, что папка существует.
// 3) Строим appConfig.model_list сами и передаём в CreateMLCEngine.
// 4) Детальные логи в консоль, чтобы сразу видеть, что пошло не так.

let cachedPromise: Promise<any> | null = null;

const RAW_ID =
  process.env.NEXT_PUBLIC_MLC_MODEL ||
  "mlc-ai/Phi-3.1-mini-4k-instruct-q4f32_1-MLC";

// basename — это ровно то, что WebLLM использует как model_id
const MODEL_ID = RAW_ID.split("/").pop()!; // "Phi-3.1-mini-4k-instruct-q4f32_1-MLC"

const DEFAULT_MODEL_URL = `/models/${MODEL_ID}/`;
const MODEL_URL =
  (process.env.NEXT_PUBLIC_MLC_MODEL_URL || "").trim() || DEFAULT_MODEL_URL;

const WASM_THREADS = process.env.NEXT_PUBLIC_WASM_THREADS; // "1" на Pages

function log(...args: any[]) {
  // Немного шума в консоли — помогает при диагностике
  console.log("[WebLLM]", ...args);
}

async function ensureLocalModelFolder(): Promise<void> {
  // Проверяем наличие конфига и токенайзера — частая причина ошибок путей
  const urls = [
    `${MODEL_URL}mlc-chat-config.json`,
    `${MODEL_URL}tokenizer.json`,
  ];
  for (const u of urls) {
    const r = await fetch(u, { method: "HEAD" });
    if (!r.ok) {
      throw new Error(
        `Файл не найден: ${u} (HTTP ${r.status}). Проверь путь MODEL_URL=${MODEL_URL}`
      );
    }
  }
}

export async function getEngine() {
  if (cachedPromise) return cachedPromise;

  cachedPromise = (async () => {
    const webllm = await import("@mlc-ai/web-llm");

    log("MODEL_ID=", MODEL_ID, "MODEL_URL=", MODEL_URL);

    // 1) Убедимся, что папка модели реально доступна на домене
    await ensureLocalModelFolder();

    // 2) Жёстко задаём список моделей в нужном формате
    const appConfig: any = {
      model_list: [
        {
          model_id: MODEL_ID,     // важно: совпадает с 1-м аргументом CreateMLCEngine
          model_url: MODEL_URL,   // оба ключа на всякий случай
          base_url: MODEL_URL,
        },
      ],
      useIndexedDBCache: true,
    };
    if (WASM_THREADS === "1") {
      appConfig.wasmNumThreads = 1;
    }

    const opts: any = {
      modelUrl: MODEL_URL, // дублируем
      appConfig,
      initProgressCallback: (p: any) => {
        if (p?.text) log(p.text, p.progress ?? "");
      },
    };

    // 3) Запускаем движок
    const engine = await webllm.CreateMLCEngine(MODEL_ID, opts);
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
