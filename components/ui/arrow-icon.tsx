type Direction = "up-right" | "right" | "left" | "down";

const paths: Record<Direction, string> = {
  "up-right": "M6 18 18 6M6 6h12v12",
  right: "M4 12h16m-7-7 7 7-7 7",
  left: "M20 12H4m7-7-7 7 7 7",
  down: "M12 4v16m-7-7 7 7 7-7",
};

/** Decorative, font-independent icon; the surrounding control supplies its label. */
export function ArrowIcon({ direction = "up-right" }: { direction?: Direction }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block", verticalAlign: "-0.125em", flexShrink: 0 }}
    >
      <path d={paths[direction]} />
    </svg>
  );
}
