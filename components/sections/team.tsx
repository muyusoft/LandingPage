import { useTranslations } from "next-intl";
import type { StaticImageData } from "next/image";
import matheoPhoto from "@/assets/team/matheo-chavez.jpeg";
import anthonyPhoto from "@/assets/team/anthony-cochea.jpeg";
import juanPhoto from "@/assets/team/juan-aristizabal.jpeg";
import andresPhoto from "@/assets/team/andres-loza.jpeg";
import { SectionHeading } from "@/components/ui/section-heading";
import { TeamGrid, type TeamMember } from "./team-grid";

const MEMBER_KEYS = ["one", "two", "three", "four"] as const;
type MemberKey = (typeof MEMBER_KEYS)[number];

// Fotos disponibles por miembro; el resto usa el placeholder de iniciales.
const MEMBER_PHOTOS: Partial<Record<MemberKey, StaticImageData>> = {
  one: matheoPhoto,
  two: anthonyPhoto,
  three: juanPhoto,
  four: andresPhoto,
};

// Punto de enfoque vertical de cada foto en la portada de la hoja móvil: deja la cara por encima
// del nombre. Las fotos más cerradas (cara grande) necesitan un valor más alto.
const PHOTO_FOCUS: Record<MemberKey, string> = {
  one: "12%",
  two: "12%",
  three: "10%",
  four: "42%",
};

// Perfiles públicos por miembro. Solo se muestran los que tienen URL.
const MEMBER_LINKS: Record<MemberKey, { linkedin?: string; github?: string }> = {
  one: {},
  two: {},
  three: {},
  four: {},
};

export function Team() {
  const t = useTranslations("Team");

  const members: TeamMember[] = MEMBER_KEYS.map((key) => {
    const { linkedin, github } = MEMBER_LINKS[key];
    return {
      key,
      name: t(`members.${key}.name`),
      role: t(`members.${key}.role`),
      bio: t(`members.${key}.bio`),
      focus: t.raw(`members.${key}.focus`) as string[],
      photo: MEMBER_PHOTOS[key],
      photoFocus: PHOTO_FOCUS[key],
      links: [
        linkedin && { label: "LinkedIn", href: linkedin },
        github && { label: "GitHub", href: github },
      ].filter((link): link is { label: string; href: string } => Boolean(link)),
    };
  });

  return (
    <section id="team" className="mx-auto max-w-(--width-content) px-6 pt-8 pb-16 min-[761px]:py-24">
      <SectionHeading
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />
      <TeamGrid members={members} />
    </section>
  );
}
