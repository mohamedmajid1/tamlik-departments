// Tamlik Fit-out: interior design as a designer's floor plan. A bare concrete shell turns into a walnut floor
// and a marble kitchen, furniture lands piece by piece, the lamps come on, and a fan of real material samples
// (Poly Haven marble, walnut, plaster) opens. Art lives in a 1000×1000 box; animate() adds the motion at T (ms).
import { svg, stagger } from '../../vendor/anime.esm.min.js';
import { C } from '../brand.js';

const P = C.paper, B = C.brass;
const tex = (n) => `assets/tex/${n}.jpg`;
const fab = '#3b342d', fab2 = '#4a4037';          // upholstery tones
const x0 = 150, y0 = 150, x1 = 850, y1 = 750, t = 16;    // room, wall thickness
const COLS = 10, ROWS = 9;                                // the concrete shell, as slabs that lift away

export const fitout = {
  id: 'fitout', name: 'FIT-OUT', accent: B, glow: 'rgba(217,183,121,.14)',
  tagline: 'We shape your <b>space</b>',
  art() {
    const chairs = [[625, 238], [685, 238], [745, 238], [625, 402], [685, 402], [745, 402]];
    const sw = (x1 - x0) / COLS, sh = (y1 - y0) / ROWS;
    return `
    <defs>
      <pattern id="foWalnut" patternUnits="userSpaceOnUse" width="340" height="340"><image href="${tex('walnut_veneer')}" width="340" height="340" preserveAspectRatio="xMidYMid slice"/></pattern>
      <pattern id="foPlanks" patternUnits="userSpaceOnUse" width="700" height="44"><path d="M 0 43.5 L 700 43.5 M 180 0 L 180 44" stroke="#000" stroke-opacity=".25" stroke-width="1"/></pattern>
      <pattern id="foMarble" patternUnits="userSpaceOnUse" width="260" height="260"><image href="${tex('marble_01')}" width="260" height="260" preserveAspectRatio="xMidYMid slice"/></pattern>
      <pattern id="foConcrete" patternUnits="userSpaceOnUse" width="300" height="300"><image href="${tex('concrete_pavers')}" width="300" height="300" preserveAspectRatio="xMidYMid slice"/></pattern>
      <radialGradient id="foLight" r=".5"><stop offset="0" stop-color="#ffd59a" stop-opacity=".55"/><stop offset=".55" stop-color="#ffc47a" stop-opacity=".16"/><stop offset="1" stop-color="#ffc47a" stop-opacity="0"/></radialGradient>
      <filter id="foShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000" flood-opacity=".6"/></filter>
      <clipPath id="foRoom"><rect x="${x0 + t}" y="${y0 + t}" width="${x1 - x0 - 2 * t}" height="${y1 - y0 - 2 * t}"/></clipPath>
    </defs>

    <!-- dimension lines -->
    <g stroke="${P}" stroke-opacity=".3" stroke-width="1.2" fill="none">
      <path class="dim" d="M ${x0} 105 L ${x1} 105 M ${x0} 93 L ${x0} 117 M ${x1} 93 L ${x1} 117 M 500 97 L 500 113"/>
      <path class="dim" d="M 105 ${y0} L 105 ${y1} M 93 ${y0} L 117 ${y0} M 93 ${y1} L 117 ${y1}"/>
    </g>

    <!-- floor: walnut planks, a marble kitchen zone, under a bare concrete shell that lifts away -->
    <g class="floor" clip-path="url(#foRoom)">
      <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#1a1612"/>
      <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#foWalnut)" opacity=".62"/>
      <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#foPlanks)"/>
      <rect x="585" y="520" width="${x1 - 585}" height="${y1 - 520}" fill="url(#foMarble)" opacity=".85"/>
      <g class="shell">${Array.from({ length: COLS * ROWS }, (_, i) => {
        const cx = x0 + (i % COLS) * sw, cy = y0 + Math.floor(i / COLS) * sh;
        return `<rect class="slab pop" x="${cx}" y="${cy}" width="${sw + 0.5}" height="${sh + 0.5}" fill="url(#foConcrete)" stroke="#000" stroke-opacity=".35" stroke-width="1"/>`;
      }).join('')}</g>
    </g>

    <!-- light pools -->
    <g class="lights" style="mix-blend-mode:screen" clip-path="url(#foRoom)">
      <circle cx="360" cy="400" r="190" fill="url(#foLight)"/><circle cx="685" cy="320" r="170" fill="url(#foLight)"/>
      <circle cx="210" cy="215" r="120" fill="url(#foLight)"/><circle cx="710" cy="640" r="150" fill="url(#foLight)" opacity=".7"/>
    </g>

    <!-- furniture -->
    <g filter="url(#foShadow)">
      <rect class="piece pop" x="205" y="235" width="300" height="330" rx="8" fill="${P}" fill-opacity=".08" stroke="${B}" stroke-opacity=".55" stroke-width="1.6"/>
      <g class="piece pop">
        <path d="M 172 245 L 245 245 L 245 520 L 440 520 L 440 592 L 172 592 Z" fill="${fab}" stroke="${P}" stroke-opacity=".75" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M 172 245 L 190 245 L 190 574 L 440 574" fill="none" stroke="${P}" stroke-opacity=".4" stroke-width="1.4"/>
        <path d="M 190 335 L 245 335 M 190 425 L 245 425 M 300 520 L 300 574 M 370 520 L 370 574" stroke="${P}" stroke-opacity=".3" stroke-width="1.2"/>
      </g>
      <circle class="piece pop" cx="360" cy="400" r="58" fill="url(#foMarble)" stroke="${B}" stroke-width="2.4"/>
      ${[270, 456].map((y) => `<g class="piece pop"><rect x="455" y="${y}" width="72" height="76" rx="14" fill="${fab2}" stroke="${P}" stroke-opacity=".7" stroke-width="1.6"/><path d="M 515 ${y + 6} L 515 ${y + 70}" stroke="${P}" stroke-opacity=".35" stroke-width="1.2"/></g>`).join('')}
      <rect class="piece pop" x="600" y="262" width="170" height="116" rx="6" fill="url(#foWalnut)" stroke="${B}" stroke-width="2.2"/>
      ${chairs.map(([x, y]) => `<rect class="piece pop" x="${x - 20}" y="${y - 18}" width="40" height="36" rx="9" fill="${fab2}" stroke="${P}" stroke-opacity=".6" stroke-width="1.4"/>`).join('')}
      <path class="piece pop" d="M 600 ${y1 - t} L 600 ${y1 - t - 60} L ${x1 - t - 60} ${y1 - t - 60} L ${x1 - t - 60} 470 L ${x1 - t} 470 L ${x1 - t} ${y1 - t} Z" fill="url(#foMarble)" stroke="${P}" stroke-opacity=".8" stroke-width="1.6"/>
      <rect class="piece pop" x="620" y="560" width="120" height="50" rx="4" fill="url(#foMarble)" stroke="${B}" stroke-width="2"/>
      ${[640, 680, 720].map((x) => `<circle class="piece pop" cx="${x}" cy="532" r="13" fill="${fab2}" stroke="${P}" stroke-opacity=".6" stroke-width="1.4"/>`).join('')}
      ${[[205, 690], [805, 215]].map(([x, y]) => `<g class="piece pop">${Array.from({ length: 9 }, (_, i) => {
        const a = i / 9 * Math.PI * 2, r = 30;
        return `<path d="M ${x} ${y} Q ${x + Math.cos(a + 0.35) * r * 0.7} ${y + Math.sin(a + 0.35) * r * 0.7} ${x + Math.cos(a) * r} ${y + Math.sin(a) * r} Q ${x + Math.cos(a - 0.35) * r * 0.7} ${y + Math.sin(a - 0.35) * r * 0.7} ${x} ${y}" fill="#3d7a4f" stroke="#7fbf8f" stroke-opacity=".6" stroke-width="1"/>`;
      }).join('')}<circle cx="${x}" cy="${y}" r="8" fill="#2e5c3b"/></g>`).join('')}
      <g class="piece pop lamp"><circle cx="210" cy="215" r="16" fill="${B}" fill-opacity=".9"/><circle cx="210" cy="215" r="24" fill="none" stroke="${B}" stroke-width="1.6" stroke-opacity=".6"/></g>
    </g>

    <!-- walls, with the door swing and windows -->
    <path class="wall" d="M ${x0 + t / 2} ${y0 + t / 2} L ${x1 - t / 2} ${y0 + t / 2} L ${x1 - t / 2} ${y1 - t / 2} L 330 ${y1 - t / 2} M 250 ${y1 - t / 2} L ${x0 + t / 2} ${y1 - t / 2} L ${x0 + t / 2} ${y0 + t / 2}" fill="none" stroke="${P}" stroke-width="${t}" stroke-linejoin="miter" stroke-linecap="square" stroke-opacity=".92"/>
    <path class="door" d="M 250 ${y1 - t} L 250 ${y1 - 90} A 80 80 0 0 1 330 ${y1 - t}" fill="none" stroke="${P}" stroke-opacity=".55" stroke-width="1.4"/>
    <g class="windows">
      <rect x="380" y="${y0}" width="240" height="${t}" fill="#0d1116"/><path d="M 380 ${y0 + 5} L 620 ${y0 + 5} M 380 ${y0 + 11} L 620 ${y0 + 11}" stroke="${C.cyan}" stroke-opacity=".7" stroke-width="1.4"/>
      <rect x="${x1 - t}" y="300" width="${t}" height="130" fill="#0d1116"/><path d="M ${x1 - 11} 300 L ${x1 - 11} 430 M ${x1 - 5} 300 L ${x1 - 5} 430" stroke="${C.cyan}" stroke-opacity=".7" stroke-width="1.4"/>
    </g>

    <!-- the designer's sample book -->
    ${[['marble_01', 330, -9], ['walnut_veneer', 500, 0], ['clay_plaster', 670, 9]].map(([n, x, a], i) => `
      <g transform="rotate(${a} ${x} 880)"><g class="swatch" data-dx="${500 - x}" filter="url(#foShadow)">
        <clipPath id="foSw${i}"><rect x="${x - 72}" y="820" width="144" height="120" rx="12"/></clipPath>
        <image href="${tex(n)}" x="${x - 72}" y="820" width="144" height="120" preserveAspectRatio="xMidYMid slice" clip-path="url(#foSw${i})"/>
        <rect x="${x - 72}" y="820" width="144" height="120" rx="12" fill="none" stroke="${B}" stroke-width="2"/>
      </g></g>`).join('')}`;
  },

  // ~14 s: the shell is drawn, the concrete lifts away to walnut and marble, furniture lands, lights on, samples fan out
  animate(tl, el, T) {
    const $ = (s) => [...el.querySelectorAll(s)];
    const walls = svg.createDrawable($('.wall, .dim, .door'));
    tl.set(walls, { draw: '0 0' }, 0)
      .set($('.windows, .lights, .piece, .swatch, .floor'), { opacity: 0 }, 0)
      .set($('.slab'), { opacity: 1, scale: 1 }, 0);

    // 1. the empty shell: walls and dimensions draw, the concrete floor appears
    tl.add(walls, { draw: ['0 0', '0 1'], duration: 1500, delay: stagger(200), ease: 'inOutQuad' }, T + 500)
      .add($('.floor'), { opacity: [0, 1], duration: 700 }, T + 1200)
      .add($('.windows'), { opacity: [0, 1], duration: 600 }, T + 1900);

    // 2. before -> after: concrete slabs lift away from the centre, revealing walnut and marble
    tl.add($('.slab'), { opacity: [1, 0], scale: [1, 0.5], rotate: [0, 12], duration: 800, delay: stagger(230, { grid: [COLS, ROWS], from: 'center' }), ease: 'inQuad' }, T + 2500);

    // 3. furniture lands piece by piece
    tl.add($('.piece'), { opacity: [0, 1], scale: [1.35, 1], translateY: [-26, 0], duration: 700, delay: stagger(170), ease: 'outBounce' }, T + 4900);

    // 4. the lamp clicks on and warm light fills the room
    tl.add($('.lights'), { opacity: [0, 1, 0.4, 1], duration: 900, ease: 'outSine' }, T + 8900);

    // 5. the sample book fans open
    $('.swatch').forEach((s, i) => {
      tl.add(s, { opacity: [0, 1], translateX: [+s.dataset.dx, 0], translateY: [40, 0], duration: 900, ease: 'outExpo' }, T + 9800 + i * 120);
    });
    return { tagAt: T + 9600 };
  },
};
