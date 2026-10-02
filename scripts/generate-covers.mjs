import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "covers");
mkdirSync(outDir, { recursive: true });

const covers = [
  { file: "default.svg", from: "#fb923c", to: "#9a3412", label: "FeirAL" },
  { file: "artesanato.svg", from: "#fbbf24", to: "#b45309", label: "Artesanato" },
  { file: "alimentos.svg", from: "#f87171", to: "#991b1b", label: "Alimentos" },
  { file: "moda.svg", from: "#f472b6", to: "#9d174d", label: "Moda" },
  { file: "eventos-culturais.svg", from: "#a78bfa", to: "#5b21b6", label: "Eventos culturais" },
  { file: "flores-e-plantas.svg", from: "#4ade80", to: "#166534", label: "Flores e plantas" },
  { file: "antiguidades.svg", from: "#94a3b8", to: "#334155", label: "Antiguidades" },
];

function svg({ from, to, label }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
    <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="6" cy="6" r="2.5" fill="rgba(255,255,255,0.16)"/>
    </pattern>
  </defs>
  <rect width="1200" height="600" fill="url(#g)"/>
  <rect width="1200" height="600" fill="url(#dots)"/>
  <g fill="rgba(255,255,255,0.9)">
    <circle cx="150" cy="470" r="60"/>
    <circle cx="1050" cy="140" r="80"/>
  </g>
  <text x="600" y="320" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="74" font-weight="700" fill="#ffffff">${label}</text>
  <text x="600" y="380" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="30" fill="rgba(255,255,255,0.85)">FeirAL - feirinhas de Alagoas</text>
</svg>
`;
}

for (const cover of covers) {
  writeFileSync(join(outDir, cover.file), svg(cover), "utf8");
}

console.log(`Gerados ${covers.length} arquivos em public/covers`);
