import { createHmac, timingSafeEqual } from "node:crypto";
import type { ImageProxyConfig } from "./config";

export type SignedParams = {
  url: string;
  w?: number;
  q?: number;
  sig: string;
};

const SIG_PARAM = "sig";
const ALGORITHM = "sha256";

function buildPayload(url: string, w?: number, q?: number): string {
  const parts = [url, String(w ?? ""), String(q ?? "")];
  return parts.join("|");
}

function signPayload(payload: string, secret: string): string {
  return createHmac(ALGORITHM, secret).update(payload).digest("hex");
}

/**
 * Generates HMAC signature for proxy URL parameters.
 * Call this only on the server (uses IMAGE_PROXY_SECRET).
 */
export function signProxyParams(
  url: string,
  options: { width?: number; quality?: number },
  config: ImageProxyConfig
): string {
  const payload = buildPayload(url, options.width, options.quality);
  return signPayload(payload, config.secret);
}

/**
 * Verifies that the signature matches the given url, width, and quality.
 * Returns true only if the signature is valid (constant-time comparison).
 */
export function verifyProxySignature(
  url: string,
  w: number | undefined,
  q: number | undefined,
  providedSig: string,
  config: ImageProxyConfig
): boolean {
  const payload = buildPayload(url, w, q);
  const expected = signPayload(payload, config.secret);
  if (expected.length !== providedSig.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(providedSig, "hex"));
  } catch {
    return false;
  }
}

/**
 * Builds the full proxy URL with signed query (for use in loader).
 * baseUrl: e.g. origin of your app, e.g. process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
 */
export function buildSignedProxyUrl(
  baseUrl: string,
  sourceUrl: string,
  options: { width?: number; quality?: number },
  config: ImageProxyConfig
): string {
  const sig = signProxyParams(sourceUrl, options, config);
  const u = new URL("/api/proxy-image", baseUrl);
  u.searchParams.set("url", sourceUrl);
  if (options.width != null) u.searchParams.set("w", String(options.width));
  if (options.quality != null) u.searchParams.set("q", String(options.quality));
  u.searchParams.set(SIG_PARAM, sig);
  return u.toString();
}

/**
 * Parses and validates query params for the route handler.
 */
export function parseAndVerifyParams(
  searchParams: URLSearchParams,
  config: ImageProxyConfig
): { url: string; w?: number; q?: number } | { error: string; status: number } {
  const url = searchParams.get("url");
  const sig = searchParams.get(SIG_PARAM);

  if (!url?.trim()) {
    return { error: "Missing url parameter", status: 400 };
  }
  if (!sig?.trim()) {
    return { error: "Missing sig parameter", status: 401 };
  }

  let w: number | undefined;
  const wRaw = searchParams.get("w");
  if (wRaw != null && wRaw !== "") {
    w = parseInt(wRaw, 10);
    if (Number.isNaN(w) || w < 1 || w > config.maxWidth) {
      return {
        error: `Invalid w: must be 1–${config.maxWidth}`,
        status: 400,
      };
    }
  }

  let q: number | undefined;
  const qRaw = searchParams.get("q");
  if (qRaw != null && qRaw !== "") {
    q = parseInt(qRaw, 10);
    if (Number.isNaN(q) || q < 1 || q > 100) {
      return { error: "Invalid q: must be 1–100", status: 400 };
    }
  }

  if (!verifyProxySignature(url, w, q, sig, config)) {
    return { error: "Invalid signature", status: 403 };
  }

  return { url: url.trim(), w, q };
}
