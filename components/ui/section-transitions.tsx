"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";

/** Content stays visible without JavaScript; only offscreen blocks are prepared. */
export function SectionTransitions() {
  const locale = useLocale();
  const revealed = useRef(new WeakSet<Element>());

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Map<Element, Animation>();
    const seen = revealed.current;
    const elements = document.querySelectorAll<HTMLElement>("[data-section-enter]");
    let resizeFrame = 0;

    const handleEntries: IntersectionObserverCallback = entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting || media.matches || seen.has(entry.target)) continue;
        seen.add(entry.target);
        observer.unobserve(entry.target);
        const animation = animations.get(entry.target);
        if (!animation) continue;
        if (entry.target.contains(document.activeElement)) {
          animation.cancel();
          animations.delete(entry.target);
        } else {
          // Continue from the state prepared offscreen, never reset visible content.
          animation.play();
        }
      }
    };

    function createObserver() {
      // Percentage root margins resolve against width, so use viewport-height pixels.
      const inset = Math.round(Math.min(180, Math.max(90, window.innerHeight * 0.2)));
      return new IntersectionObserver(handleEntries, {
        threshold: 0,
        rootMargin: `0px 0px -${inset}px 0px`,
      });
    }
    let observer = createObserver();

    function prepare() {
      if (media.matches) {
        elements.forEach(element => seen.add(element));
        return;
      }
      elements.forEach(element => {
        if (seen.has(element)) return;
        // Includes restored scroll positions and direct links into a section.
        if (element.getBoundingClientRect().top < window.innerHeight || element.contains(document.activeElement)) {
          seen.add(element);
          return;
        }
        const animation = element.animate(
          [{ opacity: 0.15, transform: "translateY(24px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 1000, easing: "cubic-bezier(.22,.45,.25,1)", fill: "both" },
        );
        animation.pause();
        animation.currentTime = 0;
        animations.set(element, animation);
        animation.onfinish = () => {
          // Release the transform so sticky descendants and hover styles stay native.
          animation.cancel();
          animations.delete(element);
        };
        observer.observe(element);
      });
    }

    function resize() {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        observer.disconnect();
        observer = createObserver();
        animations.forEach((_, element) => {
          if (!seen.has(element) && !media.matches) observer.observe(element);
        });
      });
    }

    function updatePreference() {
      if (!media.matches) return;
      observer.disconnect();
      elements.forEach(element => seen.add(element));
      animations.forEach(animation => animation.cancel());
      animations.clear();
    }

    function revealFocused(event: FocusEvent) {
      if (!(event.target instanceof Element)) return;
      const focused = event.target;
      animations.forEach((animation, element) => {
        if (!element.contains(focused)) return;
        seen.add(element);
        observer.unobserve(element);
        animation.cancel();
        animations.delete(element);
      });
    }

    prepare();
    media.addEventListener("change", updatePreference);
    document.addEventListener("focusin", revealFocused);
    window.addEventListener("resize", resize);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(resizeFrame);
      animations.forEach(animation => animation.cancel());
      media.removeEventListener("change", updatePreference);
      document.removeEventListener("focusin", revealFocused);
      window.removeEventListener("resize", resize);
    };
  }, [locale]);

  return null;
}
