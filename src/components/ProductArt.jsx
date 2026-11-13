import { useId } from "react";

const palettes = [
  { c1: "#BFD9FF", c2: "#F3F8FF", c3: "#A9C9F7", accent: "#5A92E4" },
  { c1: "#E1EEFF", c2: "#F7FAFF", c3: "#C5DAF8", accent: "#70A5EC" },
  { c1: "#CCE2FF", c2: "#F6F9FF", c3: "#AFCDF5", accent: "#3F7BE0" },
  { c1: "#D6E8FF", c2: "#FFFFFF", c3: "#B7D3FA", accent: "#3F84EA" },
];

// Three angles per product (front, side, detail). Swap these for real photos later.
export function galleryFor(seed) {
  const labels = ["Front", "Side", "Detail"];
  return labels.map((label, i) => {
    const p = palettes[(seed + i) % palettes.length];
    return { label, ...p, sx: 30 + i * 30, sy: 24 + i * 6 };
  });
}

export default function ProductArt({ art }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 90" preserveAspectRatio="xMidYMid slice" className="block h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`pa${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={art.c1} />
          <stop offset="1" stopColor={art.c2} />
        </linearGradient>
      </defs>
      <rect width="120" height="90" fill={`url(#pa${uid})`} />
      <circle cx={art.sx} cy={art.sy} r="14" fill="#fff" opacity=".35" />
      <circle cx={art.sx} cy={art.sy} r="9" fill="#fff" opacity=".95" />
      <path d="M0 60Q26 38 52 56T120 48V90H0Z" fill={art.c3} />
      <path d="M0 72Q32 52 64 70T120 62V90H0Z" fill={art.accent} opacity=".8" />
      <path d="M0 82Q40 68 80 80T120 76V90H0Z" fill={art.accent} />
    </svg>
  );
}
