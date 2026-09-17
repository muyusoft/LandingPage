# Muyusoft — Spec de construcción para Claude Code

Landing corporativa de Muyusoft, estudio de software AI-first (Ecuador, clientes en EE.UU. y Europa). Este documento es la fuente de verdad para generar el proyecto. Pégalo completo como primer prompt en Claude Code.

---

## 1. Stack y decisiones de arquitectura (no negociables en esta fase)

- **Next.js 14+, App Router, TypeScript estricto**
- **Tailwind CSS** — tokens del design system definidos en `@theme` (sección 3), no clases arbitrarias sueltas
- **next-intl** para i18n con rutas `/en` y `/es` (inglés es el locale por defecto / fuente del copy)
- **Framer Motion** para todas las animaciones — usar los valores de easing/duración de la sección 5, no defaults de librería
- **Web3Forms** para el envío del formulario de contacto (nivel gratuito, sin backend propio)
- **Cal.com** embebido para agendar la llamada de 30 min
- **Cloudflare Turnstile** o honeypot en el formulario (anti-spam invisible)
- **Plausible** (o GA4 como alternativa) para analítica, con eventos personalizados por CTA
- **MDX** para los casos de estudio (`content/work/*.mdx`), no Notion API por ahora — más simple para 4 socios técnicos
- **Vercel** para hosting, GitHub Actions para preview deployments en cada PR
- **Modo oscuro únicamente.** No implementar toggle ni tokens de modo claro — se agrega en una fase posterior
- **Sin blog técnico todavía** — dejar la ruta preparada pero sin contenido (RF-CMS-03 del plan)

---

## 2. Estructura de carpetas objetivo

```
app/
  [locale]/
    layout.tsx                 → Navbar + Footer (layout global)
    page.tsx                   → ensambla las 9 secciones de la home
    work/
      [slug]/
        page.tsx               → caso de estudio individual
    privacy/page.tsx
    terms/page.tsx
    ai-policy/page.tsx
    not-found.tsx
  sitemap.ts
  robots.ts
  layout.tsx                   → root layout (fuente, providers globales)
components/
  navbar.tsx
  footer.tsx
  sections/
    hero.tsx
    hero-weave.tsx              → cliente, dynamic import, ssr:false
    pitch.tsx
    services.tsx
    team.tsx
    work.tsx
    how-we-start.tsx
    testimonials.tsx            → nueva, oculta por flag (ver sección 6)
    faq.tsx
    contact.tsx
  ui/
    button.tsx
    card.tsx
    accordion.tsx
    field.tsx
content/
  work/
    procurement-platform.mdx
    vehicle-logistics.mdx
messages/
  en.json
  es.json
lib/
  i18n.ts                       → config de next-intl
  analytics.ts                  → helper para eventos de conversión
i18n/
  routing.ts
  request.ts
middleware.ts                   → next-intl middleware para /en /es
```

---

## 3. Design tokens (Tailwind `@theme`)

Pegar tal cual en `globals.css`. Modo oscuro único — sin variantes claras todavía.

```css
@theme {
  /* fondos: 4 niveles, en orden de profundidad */
  --color-bg:        #08090B;
  --color-bg-2:      #0D0F12;
  --color-surface:   #121418;
  --color-surface-2: #171A1F;

  /* texto */
  --color-fg:    #F2F4F7;
  --color-muted: #8A93A3;
  --color-dim:   #5D6675;

  /* acentos */
  --color-accent:   #DCE4F0;   /* hilos del hero, isotipo */
  --color-accent-2: #7FA6FF;   /* numeración, enlaces, foco, nav activo */
  --color-ok:       #5FD39A;
  --color-warn:     #E8B45F;

  /* bordes (usar con opacidad vía Tailwind: border-white/10, border-white/18) */
  --color-line:   rgba(242,244,247,.10);
  --color-line-2: rgba(242,244,247,.18);

  /* tipografía */
  --font-sans: "Sora", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Spline Sans Mono", ui-monospace, monospace;

  /* radios */
  --radius-chip:  6px;
  --radius-btn:   8px;
  --radius-input: 9px;
  --radius-card:  14px;
  --radius-panel: 16px;

  /* layout */
  --width-content: 1180px;
  --height-nav: 64px;

  /* movimiento */
  --ease-brand: cubic-bezier(.2,.7,.3,1);
}
```

**Regla de oro para Claude Code:** ningún componente declara un hex, un radio o una duración a mano. Todo pasa por estos tokens. Si hace falta un valor nuevo, se agrega aquí primero.

**Fuentes:** Sora (400/600/700) y Spline Sans Mono (400/500) vía `next/font/google`, no `<link>` de Google Fonts.

**Tracking:** todo texto en `--font-sans` a tamaño de título lleva `tracking-tight` o `-tracking-[.035em]` explícito — sin esto Sora se ve genérica.

---

## 4. Internacionalización

- Locales: `en` (default) y `es`, rutas `/en/...` y `/es/...`, middleware de `next-intl` redirige `/` según `Accept-Language`.
- El copy fuente se escribe primero en inglés en `messages/en.json`; el español es traducción, no al revés (frases largas en ES rompen el ritmo del display si se escribe al revés).
- **Margen del 25%:** ningún contenedor de texto puede depender de un ancho fijo por longitud de string — el español corre 15–25% más largo. Probar cada componente con `messages/es.json` cargado antes de darlo por terminado.
- `<html lang>` debe reflejar el locale activo (lo maneja `next-intl` automáticamente vía el layout de `[locale]`).
- Conmutador de idioma en el navbar: dos botones EN/ES que navegan a la ruta equivalente en el otro locale (no un dropdown), con `aria-pressed` en el activo.
- `generateMetadata` por locale en cada ruta (title, description, OG) — ver sección 7.

---

## 5. Movimiento — valores exactos

| Elemento | Especificación | Disparo |
|---|---|---|
| Tejido del hero | rotación continua lenta + parallax de mouse (lerp suave) + inclinación al hacer scroll | continuo + scroll |
| Revelado de sección | opacidad 0→1, translateY 16px→0, 600ms, `--ease-brand`, delay escalonado de 70ms (máx. 4 elementos) | Framer `whileInView`, once: true |
| Paso activo del Pitch | opacidad .28→1, 450ms; barra de progreso de 4 tramos, 350ms | Framer `useInView` con `margin: "-42% 0px -42% 0px"` |
| Acordeón FAQ | altura animada, 320ms ease; ícono `+` rota 135° | clic |
| Navbar | fondo + blur + borde aparecen a los 40px de scroll | scroll |
| **Nav activo (nuevo)** | el link de la sección visible se resalta en `accent-2`, resto en `muted` | scroll-spy, ver sección 6 |

`prefers-reduced-motion: reduce` → tejido estático (sin rotación automática), revelados ya visibles, pasos del Pitch todos en opacidad 1.

---

## 6. Cambios sobre el design system original (confirmados en esta ronda)

### 6.1 Estado activo del nav (scroll-spy) — SÍ, implementar ahora

- Usar `IntersectionObserver` (o el hook de scroll-spy de tu preferencia) sobre las secciones ancladas de la home: Hero, Pitch, Services, Team, Work, HowWeStart, FAQ, Contact.
- El link del nav correspondiente a la sección visible pasa de `text-muted` a `text-accent-2`. Solo un link activo a la vez.
- Umbral sugerido: la sección se considera activa cuando su borde superior cruza el 50% del viewport.
- Aplica también en el menú móvil colapsado.

### 6.2 Testimonios — sección nueva, oculta

- Crear el componente `components/sections/testimonials.tsx` siguiendo el mismo lenguaje visual que Services o Team (tarjetas sobre `surface`, borde `line`, radio `card`).
- Contenido: cita, nombre, cargo, empresa — estructura preparada aunque no haya testimonios reales todavía.
- **No renderizar en la home por ahora.** Controlar con una constante exportada, por ejemplo:

```ts
// lib/flags.ts
export const SHOW_TESTIMONIALS = false;
```

- En `app/[locale]/page.tsx`, envolver el componente en esa condición para que no aparezca ni en el DOM ni en el nav hasta que haya contenido real que mostrar.
- Posición cuando se active: entre Work y HowWeStart.

### 6.3 Idioma / SEO — next-intl con `/en` y `/es`

- Confirmado: no usar el enfoque de cookie/localStorage del plan de implementación. Rutas por idioma para que ambas versiones sean indexables por separado (cumple RNF-SEO-02 del plan).
- Cada ruta genera su propio `<link rel="alternate" hreflang>` hacia la contraparte del otro idioma.
- El sitemap (`app/sitemap.ts`) debe emitir entradas para ambos locales de cada ruta pública.

---

## 7. SEO y metadata (del plan de implementación)

- `generateMetadata` en cada página: título, descripción, Open Graph, Twitter Card — por locale.
- JSON-LD tipo `ProfessionalService` u `Organization` en el layout raíz.
- `app/sitemap.ts` y `app/robots.ts` (no archivos estáticos) para que se regeneren en cada build.
- Core Web Vitals objetivo: LCP < 2.5s, INP < 200ms, CLS < 0.1.
- El `<h1>` del hero y el CTA se renderizan en servidor; el canvas del tejido (`hero-weave.tsx`) se carga con `dynamic(() => import('./hero-weave'), { ssr: false })` para no bloquear el LCP.
- Cabeceras de seguridad (CSP, HSTS, X-Frame-Options) configuradas en `next.config.ts` o middleware — a nivel edge en Vercel.

---

## 8. Secciones de la home, en orden

1. **Hero** — tejido 3D a pantalla completa (Three.js o React Three Fiber), eyebrow, h1, párrafo, dos CTA. Texto centrado (única sección centrada del sitio).
2. **Pitch** — storytelling scroll-driven, columna izquierda sticky + 4 pasos que se activan según scroll. Se desactiva el sticky bajo 980px (una columna, todo visible).
3. **Services** — 3 tarjetas de paquetes (Prototipo, Producto a medida, Equipo continuo) con precio anclado al fondo (`mt-auto`) para alinear pese a distinto largo de texto entre idiomas.
4. **Team** — 4 tarjetas, iniciales en vez de fotos, rol descriptivo (no C-level).
5. **Work** — grid de casos de estudio desde `content/work/*.mdx`, cada tarjeta enlaza a `/[locale]/work/[slug]`.
6. **Testimonials** — nueva, oculta por flag (ver 6.2).
7. **HowWeStart** — 4 pasos con etiqueta temporal `día N · costo` (ej. "día 0 · gratis", "día 7 · 40% inicial").
8. **FAQ** — acordeón, 7 preguntas, todas cerradas por defecto, `aria-expanded` real. Renderizar contenido en el HTML (oculto por altura, no `display:none`) + JSON-LD `FAQPage`.
9. **Contact** — texto + datos de contacto a la izquierda, formulario a la derecha (nombre, correo, empresa, tipo de proyecto, mensaje, rango de presupuesto) + widget de Cal.com.

Layout global en todas las rutas: **Navbar** (sticky, scroll-spy, conmutador de idioma, altura 64px) y **Footer** (marca, columna Sitio, columna Legal con `/privacy` `/terms` `/ai-policy`).

---

## 9. Formulario de contacto — comportamiento

- Campos: nombre, correo de trabajo, empresa, tipo de proyecto (select: Landing / Sitio Corporativo / MVP·Web App / Retainer), mensaje, rango de presupuesto (select con 4 opciones incluyendo "Aún no lo sé").
- Envío vía Web3Forms (o Formspree como alternativa), sin backend propio.
- Anti-spam invisible (Turnstile o honeypot) — sin fricción visible para el usuario real.
- Confirmación inmediata en pantalla + copia al correo del remitente.
- Cada envío y cada clic en "Agendar llamada" dispara un evento de analítica etiquetado con la sección de origen.
- Estados del botón: reposo → enviando (deshabilitado, texto "Enviando…") → éxito (reemplaza el formulario por confirmación, borde `ok`) → error (texto en `warn` bajo el botón + correo directo como alternativa).
- Validación al salir del campo (`onBlur`), no al teclear.

---

## 10. Casos de estudio (`/work/[slug]`)

- Contenido en MDX bajo `content/work/`, frontmatter con: `title`, `client`, `year`, `stack[]`, `excerpt`, `locale` (o un archivo MDX por idioma).
- Página individual: hero simple sobre `bg` (sin tejido 3D — se reserva a la home), luego problema → qué construimos → resultado en una columna de máx. 68ch, capturas a ancho completo entre bloques. Cierra con el mismo CTA de Contact.
- `generateStaticParams` para prerenderizar todos los slugs en build.

---

## 11. Accesibilidad — checklist para Claude Code

- Contraste AAA en `fg` y `muted` sobre `bg`; `dim` solo en texto ≥14px, nunca en párrafos largos.
- Foco visible: anillo `accent-2` de 2px, offset 3, en todo elemento interactivo — nunca `outline: none` sin reemplazo.
- Acordeón, conmutador de idioma, menú móvil y formulario 100% operables por teclado.
- Canvas del hero con `aria-hidden="true"`.
- Objetivo táctil mínimo 44px en botones, links del nav móvil y cabeceras del acordeón.
- Auditoría con `axe` antes de publicar.

---

## 12. Primer prompt sugerido para Claude Code

> Usa este documento completo como especificación. Empieza por: (1) el scaffold de Next.js con TypeScript, Tailwind y next-intl configurado para `/en` y `/es`; (2) los tokens de la sección 3 en `globals.css`; (3) el layout raíz con Navbar y Footer vacíos; (4) el componente Hero con el tejido en un archivo cliente separado. Después de cada bloque, muéstrame el resultado antes de seguir con la siguiente sección.

Construir en este orden evita que Claude Code intente generar las 9 secciones de una sola vez sin fundamentos (tokens, i18n, layout) ya en su lugar.
