import { Suspense } from "react";
import DictionaryClient from "./DictionaryClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Загрузка…</div>}>
      <DictionaryClient />
    </Suspense>
  );
}
