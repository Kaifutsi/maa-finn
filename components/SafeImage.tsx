import NextImage, { type ImageProps } from "next/image";

/** Имя репозитория на GitHub Pages */
const REPO = "maa-finn";
/** Префикс для прода (GitHub Pages) */
const PREFIX = process.env.NODE_ENV === "production" ? `/${REPO}` : "";

/** Добавляем basePath к строковым src, оставляем http(s)/data как есть */
function withBase(src: string | any) {
  if (typeof src !== "string") return src;
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) return src;
  if (src.startsWith(PREFIX)) return src;
  return `${PREFIX}${src.startsWith("/") ? src : `/${src}`}`;
}

export default function Image(props: ImageProps) {
  const { src, ...rest } = props as any;
  const fixed = withBase(src);
  return <NextImage src={fixed} {...rest} />;
}
