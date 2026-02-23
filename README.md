# Next-Commerce-Image-Proxy

A Next.js (App Router) middleware/proxy that intercepts image requests from external systems (legacy ERP/PIM), optimizes them on the fly, and serves them in WebP/AVIF with full compatibility for `next/image`.

## Features

- **Dynamic optimization** – Route Handler `GET /api/proxy-image` accepts `url`, `w` (width), and `q` (quality).
- **Modern formats** – Content Negotiation (Accept header) → AVIF / WebP / JPEG.
- **Image processing** – **sharp** for resize and format conversion.
- **Caching** – Cache-Control headers for Vercel Edge / CDN.
- **Security** – **URL signing (HMAC)** to prevent DoS; optional host allowlist.
- **Integration** – Custom loader for `next/image` and a `ProxyImage` component.

## Requirements

- Node.js 18+
- Next.js 15+ (App Router)
- `IMAGE_PROXY_SECRET` env var (min. 32 characters), e.g. `openssl rand -hex 32`

## Installation

```bash
cp .env.example .env
# Set IMAGE_PROXY_SECRET in .env

npm install
npm run dev
```

## Project structure

```
├── app/
│   ├── api/proxy-image/route.ts   # GET handler: fetch → sharp → response
│   ├── layout.tsx
│   └── page.tsx                   # ProxyImage usage example
├── components/
│   └── ProxyImage.tsx             # Server Component using the proxy
├── lib/
│   ├── config.ts                  # Env (secret, maxWidth, cache, allowlist)
│   ├── url-signing.ts             # HMAC: sign, verify, buildSignedProxyUrl
│   ├── validate-origin.ts         # Allowed host check
│   ├── proxy-image-src.ts         # getProxyImageSrc / getProxyImageSrcSet (server)
│   └── image-loader.ts            # proxyImageLoader for next/image
├── .env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Usage

### 1. `ProxyImage` component (Server Component)

```tsx
import { ProxyImage } from "@/components/ProxyImage";

<ProxyImage
  sourceUrl="https://legacy-erp.example.com/assets/product-123.jpg"
  width={600}
  quality={85}
  alt="Product"
/>

// With responsive srcSet
<ProxyImage
  sourceUrl="https://legacy-erp.example.com/assets/product-123.jpg"
  width={640}
  widths={[320, 640, 1024]}
  sizes="(max-width: 640px) 100vw, 50vw"
  alt="Product"
/>
```

### 2. Building the URL manually (server-only)

```ts
import { getProxyImageSrc } from "@/lib/proxy-image-src";
import Image from "next/image";
import { proxyImageLoader } from "@/lib/image-loader";

const src = getProxyImageSrc("https://...", { width: 800, quality: 80 });

<Image loader={proxyImageLoader} src={src} width={800} height={600} alt="..." />
```

### 3. Calling the API directly

The URL must be signed (HMAC). Signing is only done on the server:

- `getProxyImageSrc(sourceUrl, { width, quality })` → returns the full URL including the `sig` parameter.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `IMAGE_PROXY_SECRET` | Yes | HMAC secret (min. 32 characters) |
| `IMAGE_PROXY_ALLOWED_ORIGINS` | No | Allowed hosts (comma-separated); empty = all |
| `IMAGE_PROXY_MAX_WIDTH` | No | Max width in pixels (default 4096) |
| `IMAGE_PROXY_CACHE_MAX_AGE` | No | Cache-Control max-age in seconds (default 1 year) |

## Runtime

The Route Handler runs on **Node.js** (not Edge) because of **sharp** (libvips).

## License

MIT
>>>>>>> 7e46ad5 (Initial commit)
