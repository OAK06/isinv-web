import "@/app/global.css"
import { Metadata } from "next"
import Providers from "@/app/providers"
import { dir } from "i18next"
import { resolveServerLocale } from "@/i18n/resolveServerLocale"
import { serverTranslation } from "@/i18n/server"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.ibrahimsalama.com";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverTranslation("common");

  // Per-subdomain SEO: resolve the vertical from the Host header and tailor the
  // title/description. Gym keeps the SEO-tuned siteMeta copy; the apex/www umbrella
  // uses its own platform-wide meta; other verticals derive title/description from
  // their hero copy.
  const metaTitle = t("siteMeta.title");
  const metaDescription = t("siteMeta.description");

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: metaTitle,
      template: "%s | Ibrahim Salama",
    },
    description: metaDescription,
    applicationName: "IS Inventory",
    alternates: {
      canonical: "./",
    },
    // SEO intentionally DISABLED — the site is not meant to be discoverable yet
    // (internal / marketing-only). noindex/nofollow keeps it out of search + AI.
    // The openGraph / twitter / keywords below are commented out and should be
    // restored (and brand-updated) when going public.
    // See memory: project-isinv-seo-geo-disabled.
    robots: {
      index: false,
      follow: false,
    },
    /* SEO-OFF — restore when public:
    keywords: [
      "glass repair", "glass shop", "inventory management",
      "stock management", "point of sale", "purchase orders", "suppliers",
    ],
    openGraph: {
      type: "website",
      siteName: "Ibrahim Salama",
      title: metaTitle,
      description: metaDescription,
      url: baseUrl,
      images: [{ url: baseUrl + "/mobileFriendly.png", alt: "IS Inventory" }],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
    },
    */
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Resolve the locale right here in the render from the incoming CDN geo header
  // (+ manual-choice cookie), independent of middleware. Drives <html lang>, the
  // client i18n provider, and metadata.
  const locale = resolveServerLocale();
  const direction = dir(locale); // "rtl" or "ltr"

  // SEO-OFF: site-wide JSON-LD structured data (Organization + WebSite) is
  // disabled while the site is non-discoverable. Restore + brand-update when
  // going public. See memory: project-isinv-seo-geo-disabled.

  return (
    <html lang={locale} dir={direction} data-theme="gymFlyte" className="h-full">
      <body className="antialiased">
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
