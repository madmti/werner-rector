import { readFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const BADGES_DIR = join(".", "badges");
mkdirSync(BADGES_DIR, { recursive: true });

// ==========================================
// 1. GENERACIÓN DE BADGES DE LIGHTHOUSE
// ==========================================

function getLighthouseTheme(score: number) {
  if (score >= 0.9) return { stroke: "#00cc66", text: "#00cc66", bg: "#172b22" }; // Verde (90-100)
  if (score >= 0.5) return { stroke: "#ffa827", text: "#ffa827", bg: "#2c2214" }; // Naranja (50-89)
  return { stroke: "#ff4e42", text: "#ff4e42", bg: "#2d1a19" };                   // Rojo (0-49)
}

function generateCircleSVG(title: string, score: number): string {
  const percentage = Math.round(score * 100);
  const theme = getLighthouseTheme(score);

  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score * circumference);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="120" height="140" fill="none">
  <style>
    .title { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; fill: #e3e3e3; text-anchor: middle; }
    .score { font-family: "Roboto Mono", "Courier New", Courier, monospace; font-size: 20px; font-weight: 700; fill: ${theme.text}; text-anchor: middle; dominant-baseline: central; }
  </style>

  <circle cx="60" cy="50" r="${radius}" stroke="${theme.stroke}" stroke-opacity="0.25" stroke-width="6" fill="${theme.bg}" />
  <circle cx="60" cy="50" r="${radius}" stroke="${theme.stroke}" stroke-width="6" stroke-linecap="round"
    stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}"
    transform="rotate(-90 60 50)" />

  <text x="60" y="50" class="score">${percentage}</text>
  <text x="60" y="112" class="title">${title}</text>
</svg>`;
}

function processLighthouse() {
  const reportPath = join(".", "reports", "lighthouse.report.json");

  if (!existsSync(reportPath)) {
    console.warn(`[!] No se encontró el reporte de Lighthouse en ${reportPath}. Saltando...`);
    return;
  }

  const rawData = readFileSync(reportPath, "utf-8");
  const report = JSON.parse(rawData);
  const categories = report.categories;

  for (const key in categories) {
    const cat = categories[key];
    const svgContent = generateCircleSVG(cat.title, cat.score);
    const outputPath = join(BADGES_DIR, `lighthouse-${key}.svg`);

    writeFileSync(outputPath, svgContent);
    console.log(`[✓] Badge Lighthouse generado: ${outputPath}`);
  }
}

// ==========================================
// 2. GENERACIÓN DE BADGE DE BUNDLE SIZE
// ==========================================

interface NodePart {
  renderedLength?: number;
  gzipLength?: number;
  brotliLength?: number;
}

interface StatsJSON {
  nodeParts?: Record<string, NodePart>;
  tree?: any;
}

function calculateTotalBytes(stats: StatsJSON): number {
  // Soporte para Rollup Visualizer v2 (los pesos están en nodeParts)
  if (stats.nodeParts) {
    let total = 0;
    for (const part of Object.values(stats.nodeParts)) {
      total += part.gzipLength ?? part.renderedLength ?? 0;
    }
    return total;
  }

  // Fallback recursivo para árboles de versiones antiguas
  function traverse(node: any): number {
    if (node.gzipLength !== undefined) return node.gzipLength;
    if (node.renderedLength !== undefined) return node.renderedLength;
    if (node.children && Array.isArray(node.children)) {
      return node.children.reduce((acc: number, child: any) => acc + traverse(child), 0);
    }
    return 0;
  }

  return traverse(stats.tree ?? {});
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'kB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function generateBundleBadge(sizeString: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="28" viewBox="0 0 160 28" fill="none">
  <rect width="160" height="28" rx="6" fill="#18181b" stroke="#27272a" stroke-width="1"/>

  <g transform="translate(10, 5)" stroke="#a1a1aa" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5z"/>
    <polyline points="10 2 10 7 15 7"/>
  </g>

  <text x="32" y="18" fill="#a1a1aa" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="500">bundle size</text>
  <text x="150" y="18" fill="#38bdf8" font-family="'JetBrains Mono', 'Fira Code', monospace" font-size="11" font-weight="700" text-anchor="end">${sizeString}</text>
</svg>`;
}

function processBundleSize() {
  const statsPath = join(".", "reports", "stats.json");

  if (!existsSync(statsPath)) {
    console.warn(`[!] No se encontró el JSON de Rollup Visualizer en ${statsPath}. Saltando...`);
    return;
  }

  const rawData = readFileSync(statsPath, "utf-8");
  const stats: StatsJSON = JSON.parse(rawData);

  const totalBytes = calculateTotalBytes(stats);
  const formattedSize = formatBytes(totalBytes);
  const svgContent = generateBundleBadge(formattedSize);

  const outputPath = join(BADGES_DIR, "bundle-size.svg");
  writeFileSync(outputPath, svgContent);
  console.log(`[✓] Badge Bundle Size generado: ${outputPath} (${formattedSize})`);
}

// ==========================================
// EJECUCIÓN PRINCIPAL
// ==========================================

async function main() {
  console.log("Generando badges para el proyecto...");
  processLighthouse();
  processBundleSize();
  console.log("¡Proceso completado!");
}

main();
