/**
 * Runtime configuration for the image proxy.
 * Values are read from env at request time (no build-time bundling of secrets).
 */

const MIN_SECRET_LENGTH = 32;

function getSecret(): string {
  const secret = process.env.IMAGE_PROXY_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `IMAGE_PROXY_SECRET must be set and at least ${MIN_SECRET_LENGTH} characters. Use: openssl rand -hex 32`
    );
  }
  return secret;
}

function getAllowedOrigins(): string[] | null {
  const raw = process.env.IMAGE_PROXY_ALLOWED_ORIGINS;
  if (!raw?.trim()) return null;
  return raw.split(",").map((o) => o.trim().toLowerCase()).filter(Boolean);
}

export function getImageProxyConfig() {
  return {
    secret: getSecret(),
    allowedOrigins: getAllowedOrigins(),
    maxWidth: Math.min(
      8192,
      Math.max(1, parseInt(process.env.IMAGE_PROXY_MAX_WIDTH ?? "4096", 10) || 4096)
    ),
    cacheMaxAge: Math.max(
      0,
      parseInt(process.env.IMAGE_PROXY_CACHE_MAX_AGE ?? "31536000", 10) || 31536000
    ),
  };
}

export type ImageProxyConfig = ReturnType<typeof getImageProxyConfig>;
