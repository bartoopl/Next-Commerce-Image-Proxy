import Image from "next/image";
import { getProxyImageSrc, getProxyImageSrcSet } from "@/lib/proxy-image-src";
import { proxyImageLoader } from "@/lib/image-loader";

type ProxyImageProps = {
  sourceUrl: string;
  width: number;
  height?: number;
  quality?: number;
  sizes?: string;
  /** Responsive widths for srcSet (e.g. [320, 640, 1024]). If set, srcSet will be generated. */
  widths?: number[];
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
};

/**
 * Server Component: renders an image through the signed proxy.
 * Use for legacy ERP/PIM image URLs. Requires IMAGE_PROXY_SECRET.
 */
export async function ProxyImage({
  sourceUrl,
  width,
  height,
  quality = 80,
  sizes,
  widths,
  alt,
  className,
  priority,
  fill = false,
}: ProxyImageProps) {
  const src = getProxyImageSrc(sourceUrl, { width, quality });
  const srcSet = widths?.length
    ? getProxyImageSrcSet(sourceUrl, widths, quality)
    : undefined;

  const common = {
    alt,
    className,
    priority,
    loader: proxyImageLoader,
    sizes: sizes ?? (widths ? "(max-width: 768px) 100vw, 1024px" : undefined),
  };

  if (fill) {
    return (
      <Image
        {...common}
        src={src}
        fill
        style={{ objectFit: "cover" }}
      />
    );
  }

  return (
    <Image
      {...common}
      src={src}
      width={width}
      height={height ?? width}
      srcSet={srcSet}
    />
  );
}
