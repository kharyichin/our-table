import { hashString } from "@/lib/utils";

// A small original illustration system: hand-cut-paper-style blobs with a
// simple glyph inside, colored from the storybook palette. Deterministic by
// seed so the same recipe/ingredient always renders the same way. This is
// intentionally modest — a placeholder system that keeps the product usable
// without AI-generated art, not a full illustration library.

const PALETTE = [
  { fill: "var(--tomato)", dark: "var(--tomato-dark)" },
  { fill: "var(--squash)", dark: "var(--squash-dark)" },
  { fill: "var(--basil)", dark: "var(--basil-dark)" },
  { fill: "var(--blueberry)", dark: "var(--blueberry-dark)" },
  { fill: "var(--plum)", dark: "var(--plum-dark)" },
  { fill: "var(--butter)", dark: "var(--butter-dark)" },
] as const;

// A handful of hand-cut-feeling blob outlines (irregular, not perfect circles).
const BLOBS = [
  "M100,18 C140,14 176,44 180,84 C184,126 158,168 112,178 C68,188 26,164 16,120 C6,76 30,32 68,20 C79,17 89,19 100,18 Z",
  "M96,14 C132,10 174,30 184,70 C194,112 176,158 132,176 C90,193 40,180 18,140 C-2,102 14,54 54,28 C66,20 82,16 96,14 Z",
  "M104,20 C144,26 178,58 178,98 C178,140 146,178 102,182 C60,186 22,156 16,114 C10,72 40,32 82,20 C89,18 97,19 104,20 Z",
];

function glyphFor(tag: string) {
  const t = tag.toLowerCase();
  if (/(chicken|thigh|drumstick)/.test(t)) return Drumstick;
  if (/(pork|beef|meat|shoulder)/.test(t)) return Drumstick;
  if (/(fish|salmon|tuna)/.test(t)) return Fish;
  if (/(tofu)/.test(t)) return Cube;
  if (/(rice|grain)/.test(t)) return Bowl;
  if (/(egg)/.test(t)) return Egg;
  if (/(tomato)/.test(t)) return Tomato;
  if (/(basil|cilantro|herb|leaf|cabbage)/.test(t)) return Leaf;
  if (/(panko|bread|flour)/.test(t)) return Grain;
  if (/(curry|soup|stew|sauce)/.test(t)) return Bowl;
  if (/(lime|lemon|citrus)/.test(t)) return Citrus;
  if (/(miso|paste|jar)/.test(t)) return Jar;
  if (/(noodle|pasta)/.test(t)) return Noodle;
  if (/(pepper|chili|spicy)/.test(t)) return Chili;
  return Bowl;
}

interface DishIllustrationProps {
  seed: string;
  tags?: string[];
  className?: string;
}

export function DishIllustration({ seed, tags = [], className }: DishIllustrationProps) {
  const h = hashString(seed);
  const palette = PALETTE[h % PALETTE.length];
  const blob = BLOBS[h % BLOBS.length];
  const rotation = (h % 7) - 3;
  const primaryTag = tags[0] ?? seed;
  const Glyph = glyphFor(primaryTag);

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden="true"
    >
      <path d={blob} fill="var(--paper-warm)" opacity={0.9} transform="translate(6,8)" />
      <path d={blob} fill={palette.fill} opacity={0.22} />
      <path d={blob} fill="none" stroke={palette.dark} strokeWidth={2.5} strokeLinejoin="round" opacity={0.35} />
      <g transform="translate(100,100)">
        <Glyph color={palette.fill} dark={palette.dark} />
      </g>
    </svg>
  );
}

interface GlyphProps {
  color: string;
  dark: string;
}

function Bowl({ color, dark }: GlyphProps) {
  return (
    <g>
      <path d="M-42,4 a42,26 0 0 0 84,0 Z" fill={color} stroke={dark} strokeWidth={3} />
      <path d="M-46,4 h92" stroke={dark} strokeWidth={3} strokeLinecap="round" />
      <ellipse cx="-8" cy="-6" rx="7" ry="5" fill="var(--paper)" opacity={0.7} />
      <ellipse cx="10" cy="-10" rx="5" ry="4" fill="var(--paper)" opacity={0.6} />
    </g>
  );
}

function Drumstick({ color, dark }: GlyphProps) {
  return (
    <g transform="rotate(20)">
      <ellipse cx="0" cy="-6" rx="26" ry="20" fill={color} stroke={dark} strokeWidth={3} />
      <path d="M-6,10 C-10,26 -6,40 4,46 C10,49 18,46 18,38 C18,30 8,28 6,18" fill="var(--paper-warm)" stroke={dark} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

function Fish({ color, dark }: GlyphProps) {
  return (
    <g>
      <path d="M-38,0 C-20,-22 20,-22 34,0 C20,22 -20,22 -38,0 Z" fill={color} stroke={dark} strokeWidth={3} />
      <path d="M34,0 L52,-14 L52,14 Z" fill={color} stroke={dark} strokeWidth={3} strokeLinejoin="round" />
      <circle cx="-22" cy="-2" r="3" fill={dark} />
      <path d="M-6,-10 Q6,0 -6,10" stroke={dark} strokeWidth={2} fill="none" opacity={0.5} />
    </g>
  );
}

function Cube({ color, dark }: GlyphProps) {
  return (
    <g>
      <rect x="-30" y="-24" width="60" height="48" rx="6" fill={color} stroke={dark} strokeWidth={3} />
      <rect x="-18" y="-12" width="14" height="14" rx="2" fill="var(--paper)" opacity={0.5} />
      <rect x="4" y="4" width="14" height="14" rx="2" fill="var(--paper)" opacity={0.4} />
    </g>
  );
}

function Egg({ color, dark }: GlyphProps) {
  return (
    <g>
      <path d="M0,-34 C22,-34 32,-4 32,14 C32,34 16,46 0,46 C-16,46 -32,34 -32,14 C-32,-4 -22,-34 0,-34 Z" fill="var(--paper)" stroke={dark} strokeWidth={3} />
      <circle cx="4" cy="8" r="14" fill={color} />
    </g>
  );
}

function Tomato({ color, dark }: GlyphProps) {
  return (
    <g>
      <circle cx="0" cy="6" r="34" fill={color} stroke={dark} strokeWidth={3} />
      <path d="M-14,-24 Q0,-38 14,-24 Q4,-30 0,-20 Q-4,-30 -14,-24 Z" fill="var(--basil)" stroke={dark} strokeWidth={2} />
      <path d="M-14,-4 Q0,4 16,-8" stroke="var(--paper)" strokeWidth={3} fill="none" opacity={0.4} strokeLinecap="round" />
    </g>
  );
}

function Leaf({ color, dark }: GlyphProps) {
  return (
    <g transform="rotate(-15)">
      <path d="M0,-38 C26,-30 30,10 0,42 C-30,10 -26,-30 0,-38 Z" fill={color} stroke={dark} strokeWidth={3} />
      <path d="M0,-30 L0,36" stroke={dark} strokeWidth={2} opacity={0.5} />
    </g>
  );
}

function Grain({ color, dark }: GlyphProps) {
  const dots = [-20, -6, 8, 22];
  return (
    <g>
      {dots.map((x, i) => (
        <ellipse key={x} cx={x} cy={i % 2 === 0 ? -6 : 8} rx="9" ry="14" fill={color} stroke={dark} strokeWidth={2.5} transform={`rotate(${i * 6 - 9} ${x} 0)`} />
      ))}
    </g>
  );
}

function Citrus({ color, dark }: GlyphProps) {
  return (
    <g>
      <circle cx="0" cy="0" r="34" fill={color} stroke={dark} strokeWidth={3} />
      <circle cx="0" cy="0" r="26" fill="var(--paper)" opacity={0.85} />
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={i} x1="0" y1="0" x2={26 * Math.cos((i * Math.PI) / 4)} y2={26 * Math.sin((i * Math.PI) / 4)} stroke={dark} strokeWidth={1.5} opacity={0.5} />
      ))}
    </g>
  );
}

function Jar({ color, dark }: GlyphProps) {
  return (
    <g>
      <rect x="-22" y="-30" width="44" height="14" rx="4" fill={dark} />
      <path d="M-26,-16 h52 v46 a10,10 0 0 1 -10,10 h-32 a10,10 0 0 1 -10,-10 Z" fill={color} stroke={dark} strokeWidth={3} />
    </g>
  );
}

function Noodle({ color, dark }: GlyphProps) {
  return (
    <g>
      <path d="M-30,20 Q-20,-30 0,0 Q20,30 30,-20" stroke={color} strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M-30,20 Q-20,-30 0,0 Q20,30 30,-20" stroke={dark} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.15} />
    </g>
  );
}

function Chili({ color, dark }: GlyphProps) {
  return (
    <g transform="rotate(25)">
      <path d="M-30,-20 C-10,-30 20,-24 26,0 C30,18 14,38 -8,34 C-24,30 -34,4 -30,-20 Z" fill={color} stroke={dark} strokeWidth={3} />
      <path d="M-30,-20 C-34,-30 -30,-38 -20,-40" stroke="var(--basil)" strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
}

interface IngredientGlyphProps {
  tag: string;
  className?: string;
  seed?: string;
}

export function IngredientGlyph({ tag, className, seed }: IngredientGlyphProps) {
  const h = hashString(seed ?? tag);
  const palette = PALETTE[h % PALETTE.length];
  const Glyph = glyphFor(tag);
  return (
    <svg viewBox="-40 -40 80 80" className={className} aria-hidden="true">
      <Glyph color={palette.fill} dark={palette.dark} />
    </svg>
  );
}
