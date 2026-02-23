import type { ImageProxyConfig } from "./config";

/**
 * Returns true if the source URL is allowed (when allowlist is set).
 * If allowedOrigins is null, all origins are allowed.
 */
export function isOriginAllowed(sourceUrl: string, config: ImageProxyConfig): boolean {
  const allowlist = config.allowedOrigins;
  if (!allowlist || allowlist.length === 0) return true;
  try {
    const host = new URL(sourceUrl).hostname.toLowerCase();
    return allowlist.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}
