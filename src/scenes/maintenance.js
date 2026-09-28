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
    <!-- the rest of the house: roof kit, rooms and fixtures, foundations -->
    ${line('M 392 358 L 410 330 L 468 330 L 450 358 Z M 462 358 L 480 330 L 538 330 L 520 358 Z', 'detail', 1.6, 0.75)}
    ${line('M 401 344 L 459 344 M 471 344 L 529 344 M 430 330 L 421 358 M 500 330 L 491 358', 'detail', 1, 0.4)}
    ${line('M 352 358 L 352 324 Q 366 312 380 324 L 380 358 M 352 336 L 380 336', 'detail', 1.6, 0.7)}
    ${line('M 772 552 Q 786 522 812 532 Z M 792 540 L 803 552 L 796 560', 'detail', 1.6, 0.7)}
    ${line('M 368 700 L 432 700 M 375 700 L 381 716 L 419 716 L 425 700 M 412 700 L 412 686 Q 412 680 404 680 L 398 682', 'detail', 1.6, 0.8)}
    ${line('M 244 530 L 336 530 L 330 556 L 250 556 Z M 250 396 L 262 396 L 262 404', 'detail', 1.6, 0.75)}
    ${line('M 252 412 L 248 428 M 258 412 L 258 430 M 264 412 L 268 428', 'detail', 1, 0.4)}
    ${line('M 600 522 L 680 522 L 680 538 L 600 538 Z M 606 533 L 674 533', 'detail', 1.6, 0.8)}
    ${line('M 420 575 L 420 800 M 460 372 L 460 560', 'detail', 1, 0.22)}
    ${line('M 150 800 L 150 832 L 850 832 L 850 800', 'detail', 1.2, 0.3)}
    ${line('M 792 608 L 808 608 M 792 616 L 808 616 M 792 624 L 808 624 M 792 632 L 808 632', 'detail', 1, 0.6)}
    ${[[470, 770], [620, 770], [250, 770], [520, 520]].map(([x, y]) => line(`M ${x} ${y} h 8 v 8 h -8 Z`, 'detail', 1.2, 0.55)).join('')}
    <g class="air" fill="none" stroke="${C.cyan}" stroke-width="1.6" stroke-linecap="round">${[548, 560].map((y) => `<path d="M 608 ${y} q 8 6 16 0 t 16 0 t 16 0 t 16 0"/>`).join('')}</g>
    <!-- north arrow and title block, like a real drawing sheet -->
    <circle class="draw" cx="905" cy="150" r="26" fill="none" stroke="${P}" stroke-opacity=".45" stroke-width="1.4"/>
    <path class="north" d="M 905 126 L 914 160 L 905 153 L 896 160 Z" fill="${P}" fill-opacity=".75"/>
    ${line('M 700 895 L 960 895 L 960 955 L 700 955 Z M 700 915 L 960 915 M 830 915 L 830 955 M 890 915 L 890 955', 'detail', 1.2, 0.4)}
    <path class="titlemark" d="M 718 948 L 745 926 L 772 948" fill="none" stroke="${C.green}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>
    ${line('M 846 928 L 876 928 M 846 940 L 870 940 M 904 928 L 944 928 M 904 940 L 930 940', 'detail', 1.2, 0.35)}
    <!-- hidden services, dashed: water from the tank to the kitchen sink, power to the lights -->
    <g class="services" fill="none" stroke-dasharray="7 7" stroke-width="1.8">
      <path class="flow" d="M 307 350 L 307 600 L 352 600 L 352 716 L 400 716" stroke="${C.cyan}" stroke-opacity=".7"/>
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
          ${icon(ic, mx, my, 40, { color: C.greenText, width: 2.2, cls: 'ico' })}
          <path class="check" d="M ${mx - 15} ${my + 1} L ${mx - 4} ${my + 12} L ${mx + 17} ${my - 11}" fill="none" stroke="${C.greenText}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <circle class="ring2 pop" cx="${mx}" cy="${my}" r="40" fill="none" stroke="${C.green}" stroke-width="2"/>
        <g class="burst">${Array.from({ length: 10 }, (_, j) => { const a = j / 10 * Math.PI * 2; return `<path d="M ${fx + Math.cos(a) * 22} ${fy + Math.sin(a) * 22} L ${fx + Math.cos(a) * 44} ${fy + Math.sin(a) * 44}" stroke="${C.greenText}" stroke-width="2.4" stroke-linecap="round"/>`; }).join('')}</g>
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
      .set(svg.createDrawable($('.check')), { draw: '0 0' }, 0)
      .set($('.ring2, .burst, .air, .north, .titlemark'), { opacity: 0 }, 0)
      .set($('.hatches path, .fan, .services, .lamp, .lamp-glow, .crack, .stitches path, .drip, .valve, .fault .bad, .fault .good, .fault .leader, .marker, .clock'), { opacity: 0 }, 0)
      .set($('.crack'), { stroke: C.amber }, 0)
      .set($('.marker, .valve, .clock'), { scale: 0.2 }, 0);

    // 1. the blueprint draws itself
    tl.add(lines, { draw: ['0 0', '0 1'], duration: 1300, delay: stagger(17), ease: 'inOutQuad' }, T + 400)
      .add($('.north, .titlemark'), { opacity: [0, 1], duration: 600 }, T + 2200)
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
        .add(q('.good'), { opacity: [0, 1], scale: [0.4, 1.25, 1], duration: 700 }, t + 550)
        .add(q('.burst'), { opacity: [1, 0], scale: [0.5, 1.5], duration: 650, ease: 'outCubic' }, t + 550)
        .add(q('.ring2'), { opacity: [0.9, 0], scale: [1, 1.9], duration: 800, ease: 'outCubic' }, t + 600)
        .add(q('.ico'), { opacity: [1, 0], duration: 250 }, t + 750)
        .add(svg.createDrawable(q('.check')), { draw: ['0 0', '0 1'], duration: 420, ease: 'outQuad' }, t + 850);
      const k = f.classList[1];
      if (k === 'fault-leak') tl.add($('.valve'), { opacity: [0, 1], scale: [0.2, 1], duration: 500, ease: 'outBack(2)' }, t + 500);
      if (k === 'fault-crack') tl.add($('.crack'), { stroke: [C.amber, C.green], duration: 500 }, t + 500)
        .add($('.stitches path'), { opacity: [0, 1], scale: [0.2, 1], duration: 300, delay: stagger(70) }, t + 550);
      if (k === 'fault-power') tl.add($('.lamp-glow'), { opacity: [0, 1], scale: [0.6, 1], duration: 600 }, t + 550);
      if (k === 'fault-cool') tl.add($('.air'), { opacity: [0, 1], duration: 500 }, t + 600)
        .add($('.air path'), { translateX: [0, 16], duration: 800, loop: 5, ease: 'linear' }, t + 600)
        .add($('.fan'), { rotate: [200, 200 + 360 * 7], duration: 7000 - (t - T - 6100), ease: 'linear' }, t + 550);
    });

    // 5. always on call: the 24/7 ring closes around the clock
    tl.add($('.clock'), { opacity: [0, 1], scale: [0.4, 1], duration: 600, ease: 'outBack(1.8)' }, T + 10500)
      .add(svg.createDrawable($('.clock .ring')), { draw: ['0 0', '0 1'], duration: 1400, ease: 'inOutQuad' }, T + 10700);
    return { tagAt: T + 10300 };
  },
};
