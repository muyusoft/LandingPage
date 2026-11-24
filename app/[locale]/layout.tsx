import type { Metadata } from "next";
import localFont from "next/font/local";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

// Fuentes servidas desde el repo (assets/fonts, licencia OFL) con next/font/local. No se usa
// next/font/google: descargar las fuentes durante el build rompía el deploy en Dokploy con
// Turbopack ("next/font/google queries have exactly one entry") y además dependía de la red.
// Solo el subconjunto latin, que cubre español e inglés.
const sora = localFont({
  src: [
    { path: "../../assets/fonts/sora-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../assets/fonts/sora-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../assets/fonts/sora-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans-loaded",
  display: "swap",
});

// Solo se expone como variable: --font-mono en globals.css la usa (utilidad font-mono y módulos CSS).
const splineSansMono = localFont({
  src: [
    { path: "../../assets/fonts/spline-sans-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../assets/fonts/spline-sans-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-mono-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MuyuSoft",
  description: "MuyuSoft — Custom software built to last",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: requested } = await params;

  if (!hasLocale(routing.locales, requested)) {
    notFound();
  }

  const locale = await getLocale();
  const t = await getTranslations("Organization");

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "MuyuSoft",
    description: t("description"),
    url: SITE_URL,
    email: "contact@muyusoft.com",
    areaServed: ["US", "Europe", "Ecuador"],
  };

  return (
    <html
      lang={locale}
      className={`${sora.className} ${sora.variable} ${splineSansMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {PLAUSIBLE_DOMAIN && (
          <Script
            defer
            data-domain={PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
        <NextIntlClientProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
