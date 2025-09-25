export default function Footer(){
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-sm">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} maa_finn</p>
        <div className="flex gap-3 text-slate-500"><a href="#">Политика</a><a href="#">Контакты</a></div>
      </div>
    </footer>
  );
}
