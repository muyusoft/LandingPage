import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import { useTranslations } from "next-intl";
import mingaShot from "@/assets/products/minga.webp";
import oversetShot from "@/assets/products/overset.webp";
import proyectaShot from "@/assets/products/proyecta.webp";
import type { ProductLogo as ProductLogoKey, WorkItem } from "@/lib/work";
import { ProductLogo } from "./product-logo";
import styles from "./in-progress.module.css";

/** Color de marca de cada producto, usado en el brillo de la tarjeta. */
const BRAND: Record<ProductLogoKey, string> = {
  minga: "#1f8a63",
  overset: "#c6ff3d",
  proyecta: "#2448f5",
};

/** Captura real de cada producto y el marco en que se muestra. Sin captura, se muestra el símbolo. */
const SHOTS: Partial<Record<ProductLogoKey, { src: StaticImageData; frame: "phone" | "browser" }>> = {
  minga: { src: mingaShot, frame: "phone" },
  overset: { src: oversetShot, frame: "phone" },
  proyecta: { src: proyectaShot, frame: "browser" },
};

function Preview({ logo, alt }: { logo: ProductLogoKey; alt: string }) {
  const shot = SHOTS[logo];
  if (!shot) {
    return (
      <div className={styles.preview} aria-hidden="true">
        <ProductLogo logo={logo} className={styles.previewMark} />
      </div>
    );
  }
  return (
    <div className={styles.preview}>
      <div className={shot.frame === "phone" ? styles.phone : styles.browser}>
        {shot.frame === "browser" && <div className={styles.browserBar} aria-hidden="true"><i /><i /><i /></div>}
        <Image
          src={shot.src}
          alt={alt}
          placeholder="blur"
          sizes={shot.frame === "phone" ? "180px" : "(min-width: 1000px) 420px, 90vw"}
          className={styles.shot}
        />
      </div>
    </div>
  );
}

export function InProgress({ items }: { items: WorkItem[] }) {
  const t = useTranslations("Work.inProgress");
  if (items.length === 0) return null;

  return (
    <div data-section-enter="" className={styles.strip}>
      <div className={styles.head}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h3 className={styles.title}>{t("title")}</h3>
        <p className={styles.description}>{t("description")}</p>
      </div>
      <ul className={styles.grid}>
        {items.map(item => {
          const product = item.product;
          return (
            <li key={item.slug} className={styles.card} style={{ "--brand": product ? BRAND[product.logo] : undefined } as CSSProperties}>
              {product && <Preview logo={product.logo} alt={t("shotAlt", { name: item.title })} />}
              <div className={styles.body}>
                <div className={styles.cardTop}>
                  <h4 className={styles.name}>
                    {product && <ProductLogo logo={product.logo} className={styles.mark} />}
                    <span>{item.title}</span>
                  </h4>
                  <span className={styles.status}><i aria-hidden="true" />{t("status")}</span>
                </div>
                {product && <p className={styles.meta}>{product.sector} · {product.platform}</p>}
                <p className={styles.tagline}>{item.excerpt}</p>
                <ul className={styles.stack} aria-label={t("stack")}>
                  {item.stack.map(tech => <li key={tech}>{tech}</li>)}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
