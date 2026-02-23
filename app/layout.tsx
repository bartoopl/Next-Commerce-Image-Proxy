import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next-Commerce-Image-Proxy",
  description:
    "Image proxy for legacy ERP/PIM – optimization, WebP/AVIF, URL signing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
