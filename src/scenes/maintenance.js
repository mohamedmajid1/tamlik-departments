// Tamlik Maintenance: a villa drawn as a white-line blueprint (Omani style: stepped parapets, arched openings),
// its hidden services (water, power, cooling) and four faults that the green line reaches and fixes.
// All art lives in a 1000×1000 box. Classes mark what the timeline animates (see ../main.js).
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

export const maintenance = {
  id: 'maintenance', name: 'MAINTENANCE', accent: C.greenText, glow: 'rgba(1,166,82,.16)',
  tagline: 'We keep it <b>perfect</b>',
  art() {
    const G = 800;                                   // ground line
    const faults = [
      // [kind, icon, fault x, y, marker x, y]
      ['crack', 'hammer', 600, 640, 935, 440],
      ['leak', 'droplet', 352, 716, 150, 470],
      ['power', 'bolt', 575, 402, 470, 245],
      ['cool', 'propeller', 632, 322, 800, 225],
    ];
    return `
    <defs>
      <radialGradient id="mFix" r="0.5"><stop offset="0" stop-color="${C.green}" stop-opacity=".55"/><stop offset="1" stop-color="${C.green}" stop-opacity="0"/></radialGradient>
    </defs>
    <!-- dimension lines, like an architect's drawing -->
    <g class="dims" stroke="${P}" stroke-opacity=".3" stroke-width="1.2" fill="none">
      ${line('M 150 870 L 850 870', 'dim', 1.2, 0.3)}${line('M 150 858 L 150 882 M 850 858 L 850 882 M 500 862 L 500 878', 'dim', 1.2, 0.3)}
      ${line('M 80 800 L 80 340', 'dim', 1.2, 0.3)}${line('M 68 800 L 92 800 M 68 560 L 92 560 M 68 340 L 92 340', 'dim', 1.2, 0.3)}
    </g>
    <!-- ground and a palm -->
    ${line(`M 40 ${G} L 960 ${G}`, 'ground', 2.4, 0.6)}
    ${Array.from({ length: 23 }, (_, i) => line(`M ${60 + i * 40} ${G + 4} l -16 16`, 'hatch', 1.2, 0.22)).join('')}
    ${line('M 925 800 C 921 730 919 670 925 612', 'palm', 2, 0.7)}
    ${line('M 925 612 C 908 594 887 594 870 606 M 925 612 C 942 592 962 592 980 604 M 925 612 C 917 588 900 578 882 578 M 925 612 C 936 586 953 578 970 580 M 925 612 C 925 590 921 578 913 568', 'palm', 2, 0.7)}
    <!-- the villa -->
    ${line(`M 150 ${G} L 150 560 L 850 560 L 850 ${G}`, 'wall')}
    ${line(parapet(150, 230, 560), 'wall', 2, 0.75)}${line(parapet(690, 850, 560), 'wall', 2, 0.75)}
    ${line('M 230 560 L 230 360 L 690 360 L 690 560', 'wall')}
    ${line(parapet(230, 690, 360), 'wall', 2, 0.75)}
    ${line('M 150 575 L 850 575', 'wall', 1.2, 0.4)}${line('M 230 372 L 690 372', 'wall', 1.2, 0.4)}
    <!-- openings -->
    ${line(arch(440, 650, 120, 150), 'wall', 2.2, 0.9)}${line('M 500 668 L 500 800', 'wall', 1.2, 0.5)}
    ${[200, 300, 640, 740].map((x) => line(arch(x, 640, 60, 100), 'wall', 1.8, 0.75)).join('')}
    ${[280, 380, 520, 610].map((x) => line(arch(x, 420, 50, 90), 'wall', 1.8, 0.75)).join('')}
    ${line('M 225 740 L 265 740 M 325 740 L 365 740 M 665 740 L 705 740 M 765 740 L 805 740', 'wall', 1.2, 0.5)}
    <!-- roof kit: water tank and the AC condenser -->
    ${line('M 272 350 L 272 318 Q 272 306 284 306 L 330 306 Q 342 306 342 318 L 342 350', 'wall', 1.8, 0.75)}
    ${line('M 595 358 L 595 296 L 670 296 L 670 358', 'wall', 1.8, 0.75)}
    <circle class="fan" cx="632" cy="322" r="18" fill="none" stroke="${P}" stroke-opacity=".75" stroke-width="1.8"/>
    <g class="fan-blades" transform="translate(632 322)">${[0, 120, 240].map((a) => `<path d="M 0 0 C 6 -6 12 -8 14 -2" transform="rotate(${a})" fill="none" stroke="${P}" stroke-width="1.8" stroke-opacity=".8"/>`).join('')}</g>
    <!-- hidden services, dashed: water from the tank, power to the lights -->
    <g class="services" fill="none" stroke-dasharray="7 7" stroke-width="1.8">
      <path class="pipe" d="M 307 350 L 307 600 L 352 600 L 352 716 L 420 716" stroke="${C.cyan}" stroke-opacity=".7"/>
      <path class="wire" d="M 800 600 L 800 470 L 575 470 L 575 402" stroke="${C.amber}" stroke-opacity=".7"/>
      <path class="wire" d="M 800 600 L 800 690 L 700 690" stroke="${C.amber}" stroke-opacity=".7"/>
    </g>
    <rect x="786" y="600" width="28" height="40" rx="3" fill="none" stroke="${P}" stroke-opacity=".75" stroke-width="1.6"/>
    <g class="lamp">${line('M 575 372 L 575 392', 'wall', 1.6, 0.7)}<path d="M 562 402 L 588 402 L 581 392 L 569 392 Z" fill="${P}" fill-opacity=".85"/></g>
    <circle class="lamp-glow" cx="575" cy="420" r="60" fill="url(#mFix)" opacity=".7"/>
    <!-- the crack, stitched shut -->
    <path class="crack" d="M 600 588 L 588 612 L 606 632 L 592 656 L 611 678 L 600 702" fill="none" stroke="${C.green}" stroke-width="2.4" stroke-linejoin="round"/>
    <g class="stitches" stroke="${C.green}" stroke-width="2.2" stroke-linecap="round">${[604, 628, 652, 674, 694].map((y) => `<path d="M 588 ${y} L 614 ${y - 6}"/>`).join('')}</g>
    <!-- the drip, stopped: a closed valve on the elbow -->
    <circle class="valve" cx="352" cy="716" r="9" fill="${C.ink}" stroke="${C.green}" stroke-width="2.4"/>
    <!-- markers: the green line reaches each fault, the tool fixes it -->
    ${faults.map(([k, ic, fx, fy, mx, my]) => `
      <g class="fault fault-${k}">
        <path class="leader" d="M ${fx} ${fy} L ${mx} ${my}" stroke="${C.green}" stroke-width="1.6" stroke-dasharray="3 5" fill="none"/>
        <circle class="pulse" cx="${fx}" cy="${fy}" r="26" fill="url(#mFix)"/>
        <g class="marker" style="transform-origin:${mx}px ${my}px">
          <circle cx="${mx}" cy="${my}" r="40" fill="${C.ink}" stroke="${C.green}" stroke-width="2.6"/>
          ${icon(ic, mx, my, 40, { color: C.greenText, width: 2.2 })}
        </g>
      </g>`).join('')}
    <!-- always on call: a 24/7 ring -->
    <g class="clock" style="transform-origin:130px 170px">
      <circle cx="130" cy="170" r="62" fill="none" stroke="${P}" stroke-opacity=".2" stroke-width="2"/>
      <circle class="ring" cx="130" cy="170" r="62" fill="none" stroke="${C.green}" stroke-width="3" stroke-linecap="round" transform="rotate(-90 130 170)"/>
      ${icon('clock-24', 130, 170, 60, { color: C.paper, width: 2 })}
    </g>`;
  },
};
