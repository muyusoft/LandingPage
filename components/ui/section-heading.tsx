import { Reveal } from "@/components/ui/reveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

// Hero es la única sección centrada del sitio (spec 8.1); el resto va alineado a la izquierda.
export function SectionHeading({
  eyebrow,
  title,
  description,
  className = "",
}: Readonly<SectionHeadingProps>) {
  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${className}`}>
      <Reveal
        as="span"
        index={0}
        className="w-fit rounded-chip border border-line px-3 py-1 text-xs font-medium uppercase tracking-[.08em] text-muted"
      >
        {eyebrow}
      </Reveal>
      <Reveal
        as="h2"
        index={1}
        className="text-3xl font-semibold -tracking-[.035em] text-fg sm:text-4xl"
      >
        {title}
      </Reveal>
      {description && (
        <Reveal as="p" index={2} className="text-lg text-muted">
          {description}
        </Reveal>
      )}
    </div>
  );
}
