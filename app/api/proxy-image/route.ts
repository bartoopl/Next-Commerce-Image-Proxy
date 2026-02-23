import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getImageProxyConfig } from "@/lib/config";
import { parseAndVerifyParams } from "@/lib/url-signing";
import { isOriginAllowed } from "@/lib/validate-origin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_QUALITY = 80;
const DEFAULT_WIDTH = 1200;

type OutputFormat = "avif" | "webp" | "jpeg";
const MIME: Record<OutputFormat, string> = {
  avif: "image/avif",
  webp: "image/webp",
  jpeg: "image/jpeg",
};

function selectFormat(acceptHeader: string | null): OutputFormat {
  const accept = (acceptHeader ?? "").toLowerCase();
  if (accept.includes("image/avif")) return "avif";
  if (accept.includes("image/webp")) return "webp";
  return "jpeg";
}

export async function GET(request: NextRequest) {
  let config: ReturnType<typeof getImageProxyConfig>;
  try {
    config = getImageProxyConfig();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Configuration error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const parsed = parseAndVerifyParams(request.nextUrl.searchParams, config);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const { url: sourceUrl, w: widthParam, q: qualityParam } = parsed;

  if (!isOriginAllowed(sourceUrl, config)) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
  }

  const width = widthParam ?? DEFAULT_WIDTH;
  const quality = qualityParam ?? DEFAULT_QUALITY;
  const format = selectFormat(request.headers.get("accept"));

  let sourceBuffer: Buffer;
  try {
    const res = await fetch(sourceUrl, {
      headers: { "User-Agent": "Next-Commerce-Image-Proxy/1.0" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${res.status}` },
        { status: 502 }
      );
    }
    const arr = await res.arrayBuffer();
    sourceBuffer = Buffer.from(arr);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  let pipeline = sharp(sourceBuffer);
  const metadata = await pipeline.metadata();
  const outWidth =
    metadata.width && metadata.width <= width ? undefined : width;

  if (outWidth) {
    pipeline = pipeline.resize(outWidth, undefined, { withoutEnlargement: true });
  }

  switch (format) {
    case "avif":
      pipeline = pipeline.avif({ quality });
      break;
    case "webp":
      pipeline = pipeline.webp({ quality });
      break;
    case "jpeg":
      pipeline = pipeline.jpeg({ quality });
      break;
    default: {
      const _: never = format;
      return NextResponse.json({ error: "Unsupported format" }, { status: 500 });
    }
  }

  const output = await pipeline.toBuffer();
  const maxAge = config.cacheMaxAge;

  return new NextResponse(output, {
    status: 200,
    headers: {
      "Content-Type": MIME[format],
      "Cache-Control": `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${Math.min(maxAge, 86400)}`,
      "Content-Length": String(output.byteLength),
    },
  });
}
