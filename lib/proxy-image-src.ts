import { getImageProxyConfig } from "./config";
import { buildSignedProxyUrl } from "./url-signing";

export type ProxyImageSrcOptions = {
  width?: number;
  quality?: number;
};

/**
 * Returns a signed proxy URL for the given source image.
 * Use only on the server (e.g. in Server Components or API routes).
 */
export function getProxyImageSrc(
  sourceUrl: string,
  options: ProxyImageSrcOptions = {}
): string {
  const config = getImageProxyConfig();
  const baseUrl = getBaseUrl();
  return buildSignedProxyUrl(baseUrl, sourceUrl, options, config);
}

/**
 * Returns multiple signed URLs for srcSet (e.g. 320w, 640w, 1024w).
 */
export function getProxyImageSrcSet(
  sourceUrl: string,
  widths: number[],
  quality?: number
): string {
  const config = getImageProxyConfig();
  const baseUrl = getBaseUrl();
  return widths
    .map((w) => {
      const url = buildSignedProxyUrl(baseUrl, sourceUrl, { width: w, quality }, config);
      return `${url} ${w}w`;
    })
    .join(", ");
}

function getBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return "http://localhost:3000";
}
