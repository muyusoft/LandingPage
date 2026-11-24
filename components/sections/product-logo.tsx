import type { ProductLogo as ProductLogoKey } from "@/lib/work";

/**
 * Símbolos de los productos propios, tomados de sus repositorios. Son decorativos:
 * el nombre del producto va siempre al lado como texto.
 */
export function ProductLogo({ logo, className }: { logo: ProductLogoKey; className?: string }) {
  if (logo === "overset") {
    // "Discos": tres discos crecientes (rejilla de 48 de Overset, modo oscuro).
    return (
      <svg className={className} viewBox="0 0 35 38" aria-hidden="true" focusable="false">
        <rect x="0" y="12" width="8" height="14" rx="4" fill="#5f7d1f" />
        <rect x="12" y="6" width="9" height="26" rx="4.5" fill="#8fb52c" />
        <rect x="25" y="0" width="10" height="38" rx="5" fill="#c6ff3d" />
      </svg>
    );
  }

  if (logo === "proyecta") {
    // "La p ecuatorial", versión sobre fondo oscuro (public/brand/mark-on-dark.svg).
    return (
      <svg className={className} viewBox="14 12 34 42" aria-hidden="true" focusable="false">
        <path d="M14 12H33A15 15 0 0 1 47.97 26H14Z" fill="#c8f55a" />
        <path d="M14 29H47.87A15 15 0 0 1 33 42H25V54H14Z" fill="#ffffff" />
      </svg>
    );
  }

  // Minga: el apretón de manos de su cabecera, aclarado para fondo oscuro.
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3dbb8a"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m3 6 4-3 5 2 5-2 4 3-4 10-5 5-6-4zM8 6l4-1 4 4-3 3-3-3-3 3m6 0 4 4m-7-2 4 4m-7-1 4 3" />
    </svg>
  );
}
