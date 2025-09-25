"use client";
import Script from "next/script";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const YM_ID = process.env.NEXT_PUBLIC_YM_ID;

export default function YandexMetrika() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // отправка хита при смене роутов (SPA)
  useEffect(() => {
    if (!YM_ID) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : "");
    if (typeof window !== "undefined" && (window as any).ym) {
      (window as any).ym(Number(YM_ID), "hit", url);
    }
  }, [pathname, searchParams]);

  if (!YM_ID) return null;

  return (
    <>
      <Script
        id="ym-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],
            k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

            ym(${YM_ID}, "init", {
              clickmap:true,
              trackLinks:true,
              accurateTrackBounce:true,
              webvisor:true,
              trackHash:true
            });
          `,
        }}
      />
      <noscript>
        <div>
          <img src={"https://mc.yandex.ru/watch/" + YM_ID}
               style={{position:"absolute", left:"-9999px"}} alt="" />
        </div>
      </noscript>
    </>
  );
}
