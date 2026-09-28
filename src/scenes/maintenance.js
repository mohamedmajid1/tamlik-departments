// Tamlik Maintenance: a villa drawn as a white-line blueprint (Omani style: stepped parapets, arched openings),
// its hidden services (water, power, cooling) and four faults that the green line reaches and fixes.
// Art lives in a 1000×1000 box; animate() adds this scene's motion to the master timeline at time T (ms).
import { svg, stagger } from '../../vendor/anime.esm.min.js';
import { C, icon } from '../brand.js';

const P = C.paper;
const line = (d, cls = 'wall', w = 2.2, o = 0.85) => `<path class="draw ${cls}" d="${d}" fill="none" stroke="${P}" stroke-opacity="${o}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;

// stepped Omani parapet along a roof edge from x0 to x1 at height y
function parapet(x0, x1, y, step = 26, h = 14) {
  let d = `M ${x0} ${y}`;
  for (let x = x0; x < x1 - 1; x += step * 2) {
    const xe = Math.min(x + step, x1);
    d += ` L ${x} ${y - h} L ${xe} ${y - h} L ${xe} ${y}`;
    if (xe < x1) d += ` L ${Math.min(xe + step, x1)} ${y}`;
  }
  return d;
}
// arched opening (Omani pointed-round arch)
const arch = (x, y, w, h) => `M ${x} ${y + h} L ${x} ${y + w * 0.5} Q ${x} ${y} ${x + w / 2} ${y} Q ${x + w} ${y} ${x + w} ${y + w * 0.5} L ${x + w} ${y + h} Z`;

// [kind, icon, fault x, y, marker x, y]
const FAULTS = [
  ['leak', 'droplet', 352, 716, 150, 470],
  ['crack', 'hammer', 600, 640, 935, 440],
  ['power', 'bolt', 575, 402, 470, 245],
  ['cool', 'propeller', 632, 322, 800, 225],
];

export const maintenance = {
  id: 'maintenance', name: 'MAINTENANCE', accent: C.greenText, glow: 'rgba(1,166,82,.16)',
  tagline: 'We keep it <b>perfect</b>',
  art() {
    const G = 800;                                   // ground line
    return `
    <defs>
      <radialGradient id="mFix" r="0.5"><stop offset="0" stop-color="${C.green}" stop-opacity=".55"/><stop offset="1" stop-color="${C.green}" stop-opacity="0"/></radialGradient>
      <radialGradient id="mBad" r="0.5"><stop offset="0" stop-color="${C.amber}" stop-opacity=".6"/><stop offset="1" stop-color="${C.amber}" stop-opacity="0"/></radialGradient>
    </defs>
    <!-- dimension lines, like an architect's drawing -->
    ${line('M 150 870 L 850 870 M 150 858 L 150 882 M 850 858 L 850 882 M 500 862 L 500 878', 'dim', 1.2, 0.3)}
    ${line('M 80 800 L 80 340 M 68 800 L 92 800 M 68 560 L 92 560 M 68 340 L 92 340', 'dim', 1.2, 0.3)}
    <!-- ground and a palm -->
    ${line(`M 40 ${G} L 960 ${G}`, 'ground', 2.4, 0.6)}
    <g class="hatches">${Array.from({ length: 23 }, (_, i) => `<path d="M ${60 + i * 40} ${G + 4} l -16 16" stroke="${P}" stroke-opacity=".22" stroke-width="1.2"/>`).join('')}</g>
    ${line('M 925 800 C 921 730 919 670 925 612', 'palm', 2, 0.7)}
    ${line('M 925 612 C 908 594 887 594 870 606 M 925 612 C 942 592 962 592 980 604 M 925 612 C 917 588 900 578 882 578 M 925 612 C 936 586 953 578 970 580 M 925 612 C 925 590 921 578 913 568', 'palm', 2, 0.7)}
    <!-- the villa -->
    ${line(`M 150 ${G} L 150 560 L 850 560 L 850 ${G}`, 'wall')}
    ${line(parapet(150, 230, 560), 'wall', 2, 0.75)}${line(parapet(690, 850, 560), 'wall', 2, 0.75)}
    ${line('M 230 560 L 230 360 L 690 360 L 690 560', 'wall')}
    ${line(parapet(230, 690, 360), 'wall', 2, 0.75)}
    ${line('M 150 575 L 850 575', 'wall', 1.2, 0.4)}${line('M 230 372 L 690 372', 'wall', 1.2, 0.4)}
    ${line(arch(440, 650, 120, 150), 'wall', 2.2, 0.9)}${line('M 500 668 L 500 800', 'wall', 1.2, 0.5)}
    ${[200, 300, 640, 740].map((x) => line(arch(x, 640, 60, 100), 'wall', 1.8, 0.75)).join('')}
    ${[280, 380, 520, 610].map((x) => line(arch(x, 420, 50, 90), 'wall', 1.8, 0.75)).join('')}
    ${line('M 225 740 L 265 740 M 325 740 L 365 740 M 665 740 L 705 740 M 765 740 L 805 740', 'wall', 1.2, 0.5)}
    <!-- roof kit: water tank and the AC condenser -->
    ${line('M 272 350 L 272 318 Q 272 306 284 306 L 330 306 Q 342 306 342 318 L 342 350', 'wall', 1.8, 0.75)}
    ${line('M 595 358 L 595 296 L 670 296 L 670 358', 'wall', 1.8, 0.75)}
    <circle class="draw" cx="632" cy="322" r="18" fill="none" stroke="${P}" stroke-opacity=".75" stroke-width="1.8"/>
    <g transform="translate(632 322)"><g class="spin fan"><circle r="19" fill="none"/>${[0, 120, 240].map((a) => `<path d="M 0 0 C 6 -6 12 -8 14 -2" transform="rotate(${a})" fill="none" stroke="${P}" stroke-width="1.8" stroke-opacity=".8"/>`).join('')}</g></g>
    <!-- hidden services, dashed: water from the tank, power to the lights -->
    <g class="services" fill="none" stroke-dasharray="7 7" stroke-width="1.8">
      <path class="flow" d="M 307 350 L 307 600 L 352 600 L 352 716 L 420 716" stroke="${C.cyan}" stroke-opacity=".7"/>
      <path class="flow" d="M 800 600 L 800 470 L 575 470 L 575 402" stroke="${C.amber}" stroke-opacity=".7"/>
      <path class="flow" d="M 800 600 L 800 690 L 700 690" stroke="${C.amber}" stroke-opacity=".7"/>
    </g>
    <rect class="draw" x="786" y="600" width="28" height="40" rx="3" fill="none" stroke="${P}" stroke-opacity=".75" stroke-width="1.6"/>
    <g class="lamp">${line('M 575 372 L 575 392', 'wall', 1.6, 0.7)}<path d="M 562 402 L 588 402 L 581 392 L 569 392 Z" fill="${P}" fill-opacity=".85"/></g>
    <circle class="lamp-glow" cx="575" cy="420" r="60" fill="url(#mFix)"/>
    <!-- the faults -->
    <path class="crack" d="M 600 588 L 588 612 L 606 632 L 592 656 L 611 678 L 600 702" fill="none" stroke="${C.amber}" stroke-width="2.4" stroke-linejoin="round"/>
    <g class="stitches" stroke="${C.green}" stroke-width="2.2" stroke-linecap="round">${[604, 628, 652, 674, 694].map((y) => `<path d="M 588 ${y} L 614 ${y - 6}"/>`).join('')}</g>
    <g class="drips">${[0, 1, 2].map(() => `<path class="drip" d="M 352 728 q -5 8 0 12 q 5 -4 0 -12 Z" fill="${C.cyan}"/>`).join('')}</g>
    <circle class="valve pop" cx="352" cy="716" r="9" fill="${C.ink}" stroke="${C.green}" stroke-width="2.4"/>
    <!-- markers: the green line reaches each fault, the tool fixes it -->
    ${FAULTS.map(([k, ic, fx, fy, mx, my]) => `
      <g class="fault fault-${k}">
        <circle class="bad" cx="${fx}" cy="${fy}" r="30" fill="url(#mBad)"/>
        <circle class="good" cx="${fx}" cy="${fy}" r="30" fill="url(#mFix)"/>
        <path class="leader" d="M ${mx} ${my} L ${fx} ${fy}" stroke="${C.green}" stroke-width="1.6" stroke-dasharray="3 5" fill="none"/>
        <g class="marker pop">
          <circle cx="${mx}" cy="${my}" r="40" fill="${C.ink}" stroke="${C.green}" stroke-width="2.6"/>
          ${icon(ic, mx, my, 40, { color: C.greenText, width: 2.2 })}
        </g>
      </g>`).join('')}
    <!-- always on call: a 24/7 ring -->
    <g class="clock pop">
      <circle cx="130" cy="170" r="62" fill="none" stroke="${P}" stroke-opacity=".2" stroke-width="2"/>
      <circle class="ring" cx="130" cy="170" r="62" fill="none" stroke="${C.green}" stroke-width="3" stroke-linecap="round" transform="rotate(-90 130 170)"/>
      ${icon('clock-24', 130, 170, 60, { color: C.paper, width: 2 })}
    </g>`;
  },

  // ~14 s: draw the blueprint, show the services and the faults, then fix them one by one
  animate(tl, el, T) {
    const $ = (s) => [...el.querySelectorAll(s)];
    const art = el.querySelector('svg.art');
    const lines = svg.createDrawable($('svg.art .draw'));
    tl.set(lines, { draw: '0 0' }, 0)
      .set($('.hatches path, .fan, .services, .lamp, .lamp-glow, .crack, .stitches path, .drip, .valve, .fault .bad, .fault .good, .fault .leader, .marker, .clock'), { opacity: 0 }, 0)
      .set($('.crack'), { stroke: C.amber }, 0)
      .set($('.marker, .valve, .clock'), { scale: 0.2 }, 0);

    // 1. the blueprint draws itself
    tl.add(lines, { draw: ['0 0', '0 1'], duration: 1400, delay: stagger(28), ease: 'inOutQuad' }, T + 500)
      .add($('.hatches path'), { opacity: [0, 1], duration: 500, delay: stagger(20) }, T + 1400)
      .add($('.lamp, .fan'), { opacity: [0, 1], duration: 400 }, T + 2400);

    // 2. hidden services appear and flow
    tl.add($('.services'), { opacity: [0, 1], duration: 600 }, T + 2900)
      .add($('.services .flow'), { strokeDashoffset: [0, -140], duration: 11000, ease: 'linear' }, T + 2900);

    // 3. faults, in amber: a crack creeps, a pipe drips, the light flickers, the fan stutters
    const bad = $('.fault .bad');
    tl.add(bad, { opacity: [0, 1], scale: [0.4, 1], duration: 500, delay: stagger(160) }, T + 3600)
      .add($('.crack'), { opacity: [0, 1], duration: 150 }, T + 3600)
      .add(svg.createDrawable($('.crack')), { draw: ['0 0', '0 1'], duration: 900, ease: 'inOutSine' }, T + 3600)
      .add($('.drip'), { opacity: [{ to: 1, duration: 60 }, { to: 0, duration: 380, delay: 200 }], translateY: [0, 46], duration: 640, delay: stagger(210), loop: 3, ease: 'inQuad' }, T + 3800)
      .add($('.lamp-glow'), { opacity: [0, 0.9, 0.1, 0.7, 0, 0.8, 0.05, 0.5, 0], duration: 2600, ease: 'linear' }, T + 3800)
      .add($('.fan'), { rotate: [0, 50, 40, 130, 120, 200], duration: 2600, ease: 'linear' }, T + 3800);

    // 4. the fixes: each marker lands, its leader reaches the fault, amber turns green
    const fixes = $('.fault');
    fixes.forEach((f, i) => {
      const t = T + 6100 + i * 1050, q = (s) => f.querySelector(s);
      tl.add(q('.marker'), { opacity: [0, 1], scale: [0.2, 1], duration: 650, ease: 'outBack(2.2)' }, t)
        .add(q('.leader'), { opacity: [0, 1], strokeDashoffset: [40, 0], duration: 500 }, t + 250)
        .add(q('.bad'), { opacity: 0, duration: 400 }, t + 550)
        .add(q('.good'), { opacity: [0, 1], scale: [0.4, 1.25, 1], duration: 700 }, t + 550);
      const k = f.classList[1];
      if (k === 'fault-leak') tl.add($('.valve'), { opacity: [0, 1], scale: [0.2, 1], duration: 500, ease: 'outBack(2)' }, t + 500);
      if (k === 'fault-crack') tl.add($('.crack'), { stroke: [C.amber, C.green], duration: 500 }, t + 500)
        .add($('.stitches path'), { opacity: [0, 1], scale: [0.2, 1], duration: 300, delay: stagger(70) }, t + 550);
      if (k === 'fault-power') tl.add($('.lamp-glow'), { opacity: [0, 1], scale: [0.6, 1], duration: 600 }, t + 550);
      if (k === 'fault-cool') tl.add($('.fan'), { rotate: [200, 200 + 360 * 7], duration: 7000 - (t - T - 6100), ease: 'linear' }, t + 550);
    });

    // 5. always on call: the 24/7 ring closes around the clock
    tl.add($('.clock'), { opacity: [0, 1], scale: [0.4, 1], duration: 600, ease: 'outBack(1.8)' }, T + 10500)
      .add(svg.createDrawable($('.clock .ring')), { draw: ['0 0', '0 1'], duration: 1400, ease: 'inOutQuad' }, T + 10700);
    return { tagAt: T + 10300 };
  },
};
