import { ProxyImage } from "@/components/ProxyImage";

const DEMO_SOURCE =
  "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800";

export default function Home() {
  return (
    <main style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <h1>Next-Commerce-Image-Proxy</h1>
      <p>
        Obraz z zewnętrznego źródła (Unsplash) serwowany przez proxy z
        optymalizacją (WebP/AVIF) i podpisem HMAC.
      </p>

      <section style={{ marginTop: "2rem" }}>
        <h2>Prosty przykład (szerokość 600px)</h2>
        <ProxyImage
          sourceUrl={DEMO_SOURCE}
          width={600}
          quality={85}
          alt="Demo product"
        />
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Responsywny srcSet (320, 640, 1024)</h2>
        <ProxyImage
          sourceUrl={DEMO_SOURCE}
          width={640}
          widths={[320, 640, 1024]}
          quality={80}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px"
          alt="Demo responsive"
        />
      </section>
    </main>
  );
}
