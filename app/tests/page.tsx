import { Suspense } from "react";
import TestsClient from "./Client";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Загрузка…</div>}>
      <TestsClient />
    </Suspense>
  );
}
