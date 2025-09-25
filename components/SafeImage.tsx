import NextImage, { type ImageProps } from "next/image";

function withBase(src: string | any) {
  if (typeof src !== "string") return src;
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) return src;
  // всегда абсолютный путь от корня
  return src.startsWith("/") ? src : `/${src}`;
}

export default function Image(props: ImageProps) {
  const { src, ...rest } = props as any;
  const fixed = withBase(src);
  return <NextImage src={fixed} unoptimized {...rest} />;
}
