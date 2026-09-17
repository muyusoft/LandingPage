"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const EASE_BRAND = [0.22, 0.45, 0.25, 1] as const;
const DURATION = 1;
const STAGGER = 0.12;
const MAX_STAGGERED_INDEX = 3;

type RevealTag = "div" | "span" | "h1" | "h2" | "p";

type RevealProps = {
  as?: RevealTag;
  index?: number;
  className?: string;
  children: ReactNode;
};

const tagToMotionComponent: Record<RevealTag, typeof motion.div> = {
  div: motion.div,
  span: motion.span,
  h1: motion.h1,
  h2: motion.h2,
  p: motion.p,
};

// A slower reveal, triggered further inside the viewport.
export function Reveal({
  as = "div",
  index = 0,
  className,
  children,
}: Readonly<RevealProps>) {
  const reducedMotion = usePrefersReducedMotion();
  const MotionTag = tagToMotionComponent[as];

  return (
    <MotionTag
      data-reveal=""
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -120px 0px" }}
      transition={{
        duration: reducedMotion ? 0 : DURATION,
        ease: EASE_BRAND,
        delay: reducedMotion ? 0 : Math.min(index, MAX_STAGGERED_INDEX) * STAGGER,
      }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
