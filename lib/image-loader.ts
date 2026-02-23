import type { ImageLoaderProps } from "next/image";

/**
 * Loader for next/image when using pre-signed proxy URLs.
 * Use with images whose `src` was set server-side via getProxyImageSrc().
 * Returns the given src as-is (it is already the full signed proxy URL).
 * Do not add or change query params here – that would invalidate the HMAC signature.
 */
export function proxyImageLoader({ src }: ImageLoaderProps): string {
  return src;
}
