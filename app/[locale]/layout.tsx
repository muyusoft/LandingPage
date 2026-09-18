import type { Metadata } from "next";
import { Sora, Spline_Sans_Mono } from "next/font/google";
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

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

// El className por defecto no se usa: el token --font-mono en globals.css ya
// referencia "Spline Sans Mono" por nombre literal (usado vía la utilidad font-mono).
// Solo necesitamos que Next.js self-hostee el @font-face; `variable` evita que
// esta clase pise el font-family por defecto del documento.
const splineSansMono = Spline_Sans_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-loaded",
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
    email: "hello@muyusoft.com",
    areaServed: ["US", "Europe", "Ecuador"],
  };

  return (
    <html
      lang={locale}
      className={`${sora.className} ${splineSansMono.variable} h-full antialiased`}
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
