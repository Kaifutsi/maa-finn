export default function Pill({ title, icon, description, examples }: {
  title: string;
  icon: React.ReactNode;
  description?: string;
  examples?: { fi?: string; en?: string; ru?: string; fact?: string };
}) {
  return (
    <div className="rounded-3xl p-4 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl grid place-items-center bg-sky-100 text-sky-700">{icon}</div>
        <div className="font-semibold">{title}</div>
      </div>
      {description && <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">{description}</div>}
      {examples && (
        <div className="text-xs space-y-1">
          {examples.fi && <div><b>FI:</b> {examples.fi}</div>}
          {examples.en && <div><b>EN:</b> {examples.en}</div>}
          {examples.ru && <div><b>RU:</b> {examples.ru}</div>}
          {examples.fact && <div className="italic opacity-80">💡 {examples.fact}</div>}
        </div>
      )}
    </div>
  );
}
