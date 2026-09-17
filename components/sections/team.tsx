import { useTranslations } from "next-intl";
import Image, { type StaticImageData } from "next/image";
import matheoPhoto from "@/assets/team/matheo-chavez.jpeg";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const MEMBER_KEYS = ["one", "two", "three", "four"] as const;

// Fotos disponibles por miembro; el resto usa el placeholder de iniciales.
const MEMBER_PHOTOS: Partial<Record<(typeof MEMBER_KEYS)[number], StaticImageData>> = {
  one: matheoPhoto,
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Team() {
  const t = useTranslations("Team");

  return (
    <section id="team" className="mx-auto max-w-(--width-content) px-6 py-24">
      <SectionHeading
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {MEMBER_KEYS.map((key, index) => {
          const name = t(`members.${key}.name`);
          const photo = MEMBER_PHOTOS[key];

          return (
            <Reveal key={key} index={index}>
              {/* Móvil: tarjeta compacta, foto pequeña junto al nombre.
                  sm+: retrato grande arriba, tal como en escritorio. */}
              <Card className="flex h-full flex-row items-center gap-4 overflow-hidden p-4 sm:flex-col sm:items-stretch sm:gap-0 sm:p-0">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-surface-2 sm:aspect-[4/5] sm:h-auto sm:w-full sm:shrink sm:rounded-none">
                  {photo ? (
                    <Image
                      src={photo}
                      alt=""
                      fill
                      placeholder="blur"
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 56px"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="flex h-full w-full items-center justify-center font-mono text-sm text-accent-2 sm:text-4xl"
                    >
                      {getInitials(name)}
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 sm:gap-1 sm:p-6">
                  <p className="truncate font-semibold text-fg sm:whitespace-normal">
                    {name}
                  </p>
                  <p className="truncate text-sm text-muted sm:whitespace-normal">
                    {t(`members.${key}.role`)}
                  </p>
                </div>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
