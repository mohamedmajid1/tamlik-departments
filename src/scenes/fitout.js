// Tamlik Fit-out: interior design as a designer's floor plan. An empty shell gets a walnut floor, a marble
// kitchen, furniture that lands piece by piece, warm light pools, and a fan of real material samples
// (Poly Haven marble, walnut, plaster). All art lives in a 1000×1000 box.
import { C } from '../brand.js';

const P = C.paper, B = C.brass;
const tex = (n) => `assets/tex/${n}.jpg`;
const fab = '#3b342d', fab2 = '#4a4037';          // upholstery tones

export const fitout = {
  id: 'fitout', name: 'FIT-OUT', accent: B, glow: 'rgba(217,183,121,.14)',
  tagline: 'We shape your <b>space</b>',
  art() {
    const x0 = 150, y0 = 150, x1 = 850, y1 = 750, t = 16;    // room, wall thickness
    const chairs = [[625, 238], [685, 238], [745, 238], [625, 402], [685, 402], [745, 402]];
    return `
    <defs>
      <pattern id="foWalnut" patternUnits="userSpaceOnUse" width="340" height="340"><image href="${tex('walnut_veneer')}" width="340" height="340" preserveAspectRatio="xMidYMid slice"/></pattern>
      <pattern id="foPlanks" patternUnits="userSpaceOnUse" width="700" height="44"><path d="M 0 43.5 L 700 43.5 M 180 0 L 180 44" stroke="#000" stroke-opacity=".25" stroke-width="1"/></pattern>
      <pattern id="foMarble" patternUnits="userSpaceOnUse" width="260" height="260"><image href="${tex('marble_01')}" width="260" height="260" preserveAspectRatio="xMidYMid slice"/></pattern>
      <radialGradient id="foLight" r=".5"><stop offset="0" stop-color="#ffd59a" stop-opacity=".55"/><stop offset=".55" stop-color="#ffc47a" stop-opacity=".16"/><stop offset="1" stop-color="#ffc47a" stop-opacity="0"/></radialGradient>
      <filter id="foShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000" flood-opacity=".6"/></filter>
      <clipPath id="foRoom"><rect x="${x0 + t}" y="${y0 + t}" width="${x1 - x0 - 2 * t}" height="${y1 - y0 - 2 * t}"/></clipPath>
    </defs>

    <!-- dimension lines -->
    <g stroke="${P}" stroke-opacity=".3" stroke-width="1.2" fill="none">
      <path class="draw dim" d="M ${x0} 105 L ${x1} 105 M ${x0} 93 L ${x0} 117 M ${x1} 93 L ${x1} 117 M 500 97 L 500 113"/>
      <path class="draw dim" d="M 105 ${y0} L 105 ${y1} M 93 ${y0} L 117 ${y0} M 93 ${y1} L 117 ${y1}"/>
    </g>

    <!-- floor: walnut planks, a marble kitchen zone -->
    <g class="floor" clip-path="url(#foRoom)">
      <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#1a1612"/>
      <rect class="walnut" x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#foWalnut)" opacity=".62"/>
      <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#foPlanks)"/>
      <rect class="marble-floor" x="585" y="520" width="${x1 - 585}" height="${y1 - 520}" fill="url(#foMarble)" opacity=".85"/>
    </g>

    <!-- light pools -->
    <g class="lights" style="mix-blend-mode:screen" clip-path="url(#foRoom)">
      <circle cx="360" cy="400" r="190" fill="url(#foLight)"/><circle cx="685" cy="320" r="170" fill="url(#foLight)"/>
      <circle cx="210" cy="215" r="120" fill="url(#foLight)"/><circle cx="710" cy="640" r="150" fill="url(#foLight)" opacity=".7"/>
    </g>

    <!-- furniture -->
    <g class="furniture" filter="url(#foShadow)">
      <rect class="piece" x="205" y="235" width="300" height="330" rx="8" fill="${P}" fill-opacity=".08" stroke="${B}" stroke-opacity=".55" stroke-width="1.6"/>
      <g class="piece sofa">
        <path d="M 172 245 L 245 245 L 245 520 L 440 520 L 440 592 L 172 592 Z" fill="${fab}" stroke="${P}" stroke-opacity=".75" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M 172 245 L 190 245 L 190 574 L 440 574" fill="none" stroke="${P}" stroke-opacity=".4" stroke-width="1.4"/>
        <path d="M 190 335 L 245 335 M 190 425 L 245 425 M 300 520 L 300 574 M 370 520 L 370 574" stroke="${P}" stroke-opacity=".3" stroke-width="1.2"/>
      </g>
      <circle class="piece" cx="360" cy="400" r="58" fill="url(#foMarble)" stroke="${B}" stroke-width="2.4"/>
      <g class="piece">
        <rect x="455" y="270" width="72" height="76" rx="14" fill="${fab2}" stroke="${P}" stroke-opacity=".7" stroke-width="1.6"/><path d="M 515 276 L 515 340" stroke="${P}" stroke-opacity=".35" stroke-width="1.2"/>
      </g>
      <g class="piece">
        <rect x="455" y="456" width="72" height="76" rx="14" fill="${fab2}" stroke="${P}" stroke-opacity=".7" stroke-width="1.6"/><path d="M 515 462 L 515 526" stroke="${P}" stroke-opacity=".35" stroke-width="1.2"/>
      </g>
      ${chairs.map(([x, y]) => `<rect class="piece chair" x="${x - 20}" y="${y - 18}" width="40" height="36" rx="9" fill="${fab2}" stroke="${P}" stroke-opacity=".6" stroke-width="1.4"/>`).join('')}
      <rect class="piece" x="600" y="262" width="170" height="116" rx="6" fill="url(#foWalnut)" stroke="${B}" stroke-width="2.2"/>
      <path class="piece" d="M 600 ${y1 - t} L 600 ${y1 - t - 60} L ${x1 - t - 60} ${y1 - t - 60} L ${x1 - t - 60} 470 L ${x1 - t} 470 L ${x1 - t} ${y1 - t} Z" fill="url(#foMarble)" stroke="${P}" stroke-opacity=".8" stroke-width="1.6"/>
      <rect class="piece" x="620" y="560" width="120" height="50" rx="4" fill="url(#foMarble)" stroke="${B}" stroke-width="2"/>
      ${[640, 680, 720].map((x) => `<circle class="piece" cx="${x}" cy="532" r="13" fill="${fab2}" stroke="${P}" stroke-opacity=".6" stroke-width="1.4"/>`).join('')}
      ${[[205, 690], [805, 215]].map(([x, y]) => `<g class="piece plant">${Array.from({ length: 9 }, (_, i) => {
        const a = i / 9 * Math.PI * 2, r = 30;
        return `<path d="M ${x} ${y} Q ${x + Math.cos(a + 0.35) * r * 0.7} ${y + Math.sin(a + 0.35) * r * 0.7} ${x + Math.cos(a) * r} ${y + Math.sin(a) * r} Q ${x + Math.cos(a - 0.35) * r * 0.7} ${y + Math.sin(a - 0.35) * r * 0.7} ${x} ${y}" fill="#3d7a4f" stroke="#7fbf8f" stroke-opacity=".6" stroke-width="1"/>`;
      }).join('')}<circle cx="${x}" cy="${y}" r="8" fill="#2e5c3b"/></g>`).join('')}
      <g class="piece lamp"><circle cx="210" cy="215" r="16" fill="${B}" fill-opacity=".9"/><circle cx="210" cy="215" r="24" fill="none" stroke="${B}" stroke-width="1.6" stroke-opacity=".6"/></g>
    </g>

    <!-- walls, with the door swing and windows -->
    <g class="walls">
      <path class="draw wall" d="M ${x0} ${y0} L ${x1} ${y0} L ${x1} ${y1} L 330 ${y1} M 250 ${y1} L ${x0} ${y1} L ${x0} ${y0}" fill="none" stroke="${P}" stroke-width="${t}" stroke-linejoin="miter" stroke-opacity=".92" transform="translate(${t / 2} ${t / 2}) scale(${(x1 - x0 - t) / (x1 - x0)} ${(y1 - y0 - t) / (y1 - y0)})" transform-origin="${x0} ${y0}"/>
      <path d="M 250 ${y1 - t} L 250 ${y1 - 90} A 80 80 0 0 1 330 ${y1 - t}" fill="none" stroke="${P}" stroke-opacity=".55" stroke-width="1.4"/>
      ${[[380, 620]].map(([a, b]) => `<rect x="${a}" y="${y0}" width="${b - a}" height="${t}" fill="#0d1116"/><path d="M ${a} ${y0 + 5} L ${b} ${y0 + 5} M ${a} ${y0 + 11} L ${b} ${y0 + 11}" stroke="${C.cyan}" stroke-opacity=".7" stroke-width="1.4"/>`).join('')}
      <rect x="${x1 - t}" y="300" width="${t}" height="130" fill="#0d1116"/><path d="M ${x1 - 11} 300 L ${x1 - 11} 430 M ${x1 - 5} 300 L ${x1 - 5} 430" stroke="${C.cyan}" stroke-opacity=".7" stroke-width="1.4"/>
    </g>

    <!-- the designer's sample book -->
    <g class="swatches">
      ${[['marble_01', 330, -9], ['walnut_veneer', 500, 0], ['clay_plaster', 670, 9]].map(([n, x, a], i) => `
        <g class="swatch" transform="rotate(${a} ${x} 880)" filter="url(#foShadow)">
          <clipPath id="foSw${i}"><rect x="${x - 72}" y="820" width="144" height="120" rx="12"/></clipPath>
          <image href="${tex(n)}" x="${x - 72}" y="820" width="144" height="120" preserveAspectRatio="xMidYMid slice" clip-path="url(#foSw${i})"/>
          <rect x="${x - 72}" y="820" width="144" height="120" rx="12" fill="none" stroke="${B}" stroke-width="2"/>
        </g>`).join('')}
    </g>`;
  },
};
