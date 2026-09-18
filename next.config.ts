import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
// Allow this computer's private IPv4 addresses, not arbitrary LAN origins.
// Recomputed at startup so DHCP changes do not require editing this file.
const LAN_HOSTS = IS_DEVELOPMENT
  ? [...new Set(Object.values(networkInterfaces()).flatMap(entries =>
      (entries ?? []).filter(entry => {
        if (entry.internal || entry.family !== "IPv4") return false;
        const [a, b] = entry.address.split(".").map(Number);
        return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
      }).map(entry => entry.address),
    ))]
  : [];
// Some browsers do not match WebSockets against connect-src 'self'.
const DEV_SOCKET_SOURCES = IS_DEVELOPMENT
  ? ["localhost", "127.0.0.1", ...LAN_HOSTS].flatMap(host => [`ws://${host}:*`, `wss://${host}:*`])
  : [];

// 'unsafe-eval' solo en dev: React lo necesita para reconstruir stack traces
// en modo desarrollo; nunca lo usa en producción.
const SCRIPT_SRC = process.env.NODE_ENV === "development"
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io"
  : "script-src 'self' 'unsafe-inline' https://plausible.io";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  SCRIPT_SRC,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  ["connect-src 'self' https://api.web3forms.com https://plausible.io", ...DEV_SOCKET_SOURCES].join(" "),
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self' https://api.web3forms.com",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  ...(IS_DEVELOPMENT ? { allowedDevOrigins: LAN_HOSTS } : {}),
  // Build de producción autocontenido (server.js + deps mínimas) — necesario
  // para desplegar en Dokploy/Docker sin arrastrar node_modules completo.
  output: "standalone",
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default withNextIntl(nextConfig);
