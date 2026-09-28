// Tamlik Media: marketing and technical solutions. A phone shows a Tamlik feed (stills from the tower film),
// likes float up, the channels orbit it, a growth line climbs, and a circuit links the phone to every screen:
// laptop, display, website. Art lives in a 1000×1000 box; animate() adds the motion at time T (ms).
import { svg, stagger } from '../../vendor/anime.esm.min.js';
import { C, icon } from '../brand.js';

const P = C.paper, A = C.cyan;
const img = (n) => `assets/posts/film_${n}.jpg`;
const HEART = 'M12 20.5 L4.6 13.2 A4.6 4.6 0 0 1 12 6.6 A4.6 4.6 0 0 1 19.4 13.2 Z';
const TRACES = [
  'M 500 750 L 500 815',
  'M 470 845 L 250 845 Q 230 845 230 865 L 230 880',
  'M 530 845 L 750 845 Q 770 845 770 865 L 770 880',
  'M 500 875 L 500 905',
];

export const media = {
  id: 'media', name: 'MEDIA', accent: A, glow: 'rgba(58,215,255,.13)',
  tagline: 'We make you <b>seen</b>',
  art() {
    const X = 360, Y = 150, W = 280, H = 600;            // the phone
    const stories = ['0.1', '0.25', '0.5', '0.88'];
    return `
    <defs>
      <clipPath id="mdScreen"><rect x="${X + 12}" y="${Y + 12}" width="${W - 24}" height="${H - 24}" rx="30"/></clipPath>
      ${stories.map((n, i) => `<clipPath id="mdSt${i}"><circle cx="${X + 52 + i * 59}" cy="${Y + 108}" r="22"/></clipPath>`).join('')}
      <clipPath id="mdPost"><rect x="${X + 12}" y="${Y + 188}" width="${W - 24}" height="${W - 24}"/></clipPath>
      <linearGradient id="mdFade" x1="0" y1="0" x2="0" y2="1"><stop offset=".7" stop-color="${C.ink}" stop-opacity="0"/><stop offset="1" stop-color="${C.ink}" stop-opacity=".95"/></linearGradient>
      <radialGradient id="mdGlow" r=".5"><stop offset="0" stop-color="${A}" stop-opacity=".35"/><stop offset="1" stop-color="${A}" stop-opacity="0"/></radialGradient>
    </defs>

    <!-- the circuit: every screen fed from one Tamlik chip -->
    <g class="circuit" fill="none" stroke="${A}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".8">
      ${TRACES.map((d) => `<path class="trace" d="${d}"/>`).join('')}
      <path class="trace" d="M 470 830 L 400 830 Q 380 830 380 810 L 380 790" stroke-opacity=".4"/>
      <path class="trace" d="M 530 830 L 600 830 Q 620 830 620 810 L 620 790" stroke-opacity=".4"/>
    </g>
    ${[[230, 880], [770, 880], [500, 905], [380, 790], [620, 790]].map(([x, y]) => `<circle class="node pop" cx="${x}" cy="${y}" r="5" fill="${A}"/>`).join('')}
    <g class="chip pop"><rect x="470" y="815" width="60" height="60" rx="10" fill="${C.ink}" stroke="${A}" stroke-width="2.2"/>
      <path d="M 481 856 L 500 838 L 519 856" fill="none" stroke="${C.green}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>
    ${TRACES.slice(1).map(() => `<circle class="spark" r="5" fill="#bff3ff"/>`).join('')}
    <g class="device pop">${icon('device-laptop', 230, 930, 84, { color: P, width: 2 })}</g>
    <g class="device pop">${icon('device-desktop', 500, 950, 84, { color: P, width: 2 })}</g>
    <g class="device pop">${icon('world-www', 770, 930, 84, { color: P, width: 2 })}</g>

    <!-- the phone and its feed -->
    <circle class="phone-glow" cx="500" cy="${Y + H / 2}" r="360" fill="url(#mdGlow)" opacity=".5"/>
    <g class="phone pop">
      <rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="42" fill="#0e1014" stroke="${P}" stroke-opacity=".85" stroke-width="2.4"/>
      <g clip-path="url(#mdScreen)">
        <rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="#0b0c0f"/>
        <g class="feed">
          <path d="M ${X + 30} ${Y + 58} L ${X + 42} ${Y + 48} L ${X + 54} ${Y + 58}" fill="none" stroke="${C.green}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="${X + 64}" y="${Y + 48}" width="86" height="11" rx="5.5" fill="${P}" fill-opacity=".8"/>
          ${icon('heart', X + W - 66, Y + 54, 22, { color: P, width: 1.8 })}${icon('message-circle', X + W - 34, Y + 54, 22, { color: P, width: 1.8 })}
          ${stories.map((n, i) => `<g class="story"><circle class="story-ring" cx="${X + 52 + i * 59}" cy="${Y + 108}" r="26" fill="none" stroke="${i ? A : C.green}" stroke-width="2.4" transform="rotate(-90 ${X + 52 + i * 59} ${Y + 108})"/>
            <image href="${img(n)}" x="${X + 30 + i * 59}" y="${Y + 86}" width="44" height="44" preserveAspectRatio="xMidYMid slice" clip-path="url(#mdSt${i})"/></g>`).join('')}
          <circle cx="${X + 34}" cy="${Y + 164}" r="12" fill="${C.green}"/>
          <rect x="${X + 54}" y="${Y + 158}" width="70" height="10" rx="5" fill="${P}" fill-opacity=".75"/>
          <g clip-path="url(#mdPost)"><image class="post-img" href="${img('0.4')}" x="${X + 12}" y="${Y + 188}" width="${W - 24}" height="${W - 24}" preserveAspectRatio="xMidYMid slice"/></g>
          <g class="post-like pop"><path transform="translate(${X + 23} ${Y + 451}) scale(1.25)" d="${HEART}" fill="${C.green}"/></g>
          ${icon('message-circle', X + 78, Y + 466, 28, { color: P, width: 1.8 })}${icon('bell', X + 118, Y + 466, 28, { color: P, width: 1.8 })}
          <rect x="${X + 24}" y="${Y + 496}" width="150" height="9" rx="4.5" fill="${P}" fill-opacity=".6"/>
          <rect x="${X + 24}" y="${Y + 514}" width="200" height="9" rx="4.5" fill="${P}" fill-opacity=".35"/>
          <image href="${img('0.6')}" x="${X + 12}" y="${Y + 540}" width="${W - 24}" height="${W - 24}" preserveAspectRatio="xMidYMid slice"/>
        </g>
        <rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="url(#mdFade)"/>
      </g>
      <rect x="${X + W / 2 - 40}" y="${Y + 20}" width="80" height="18" rx="9" fill="${C.ink}"/>
    </g>

    <!-- likes floating up from the post -->
    ${Array.from({ length: 9 }, (_, i) => `<g class="heart"><path transform="translate(${640 + (i % 3) * 30} ${560 - (i % 2) * 20}) scale(${1.1 + (i % 3) * 0.35})" d="${HEART}" fill="${C.green}"/></g>`).join('')}

    <!-- the channels -->
    ${[['brand-instagram', 220, 420], ['brand-tiktok', 170, 560], ['brand-linkedin', 230, 690], ['brand-facebook', 830, 690]].map(([n, x, y]) =>
      `<g class="channel pop"><circle cx="${x}" cy="${y}" r="44" fill="${C.ink}" stroke="${A}" stroke-opacity=".75" stroke-width="2"/>${icon(n, x, y, 44, { color: P, width: 1.8 })}</g>`).join('')}

    <!-- the megaphone, announcing -->
    <g class="megaphone pop">${icon('speakerphone', 180, 250, 92, { color: A, width: 2.2 })}</g>
    <path class="wave" d="M 238 214 Q 262 250 238 286" fill="none" stroke="${A}" stroke-width="2.4" stroke-linecap="round"/>
    <path class="wave" d="M 256 196 Q 290 250 256 304" fill="none" stroke="${A}" stroke-width="2.4" stroke-linecap="round"/>

    <!-- growth: a line that keeps climbing -->
    <g class="chart">
      <path class="axis" d="M 720 140 L 720 280 L 930 280" fill="none" stroke="${P}" stroke-opacity=".4" stroke-width="1.6"/>
      <path class="growth" d="M 725 262 L 765 248 L 800 255 L 840 215 L 872 222 L 915 160" fill="none" stroke="${C.green}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="arrow" d="M 898 160 L 915 160 L 915 177" fill="none" stroke="${C.green}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
      ${[[765, 248], [800, 255], [840, 215], [872, 222]].map(([x, y]) => `<circle class="dot pop" cx="${x}" cy="${y}" r="5" fill="${C.ink}" stroke="${C.green}" stroke-width="2.4"/>`).join('')}
    </g>`;
  },

  // ~14 s: the phone rises, the feed fills, likes pour in, the channels and the chart join, the circuit lights up
  animate(tl, el, T) {
    const $ = (s) => [...el.querySelectorAll(s)];
    const traces = svg.createDrawable($('.trace')), rings = svg.createDrawable($('.story-ring'));
    const draws = svg.createDrawable($('.chart .axis, .chart .growth, .chart .arrow'));
    tl.set(traces, { draw: '0 0' }, 0).set(rings, { draw: '0 0' }, 0).set(draws, { draw: '0 0' }, 0)
      .set($('.phone, .chip, .node, .device, .channel, .megaphone, .post-like, .dot'), { opacity: 0, scale: 0.3 }, 0)
      .set($('.feed, .phone-glow, .heart, .wave, .spark'), { opacity: 0 }, 0);

    // 1. the phone rises into place and its feed loads
    tl.add($('.phone'), { opacity: [0, 1], scale: [0.7, 1], translateY: [180, 0], duration: 1100, ease: 'outExpo' }, T + 500)
      .add($('.phone-glow'), { opacity: [0, 0.5], duration: 1400 }, T + 700)
      .add($('.feed'), { opacity: [0, 1], duration: 500 }, T + 1300)
      .add(rings, { draw: ['0 0', '0 1'], duration: 800, delay: stagger(120), ease: 'inOutQuad' }, T + 1500)
      .add($('.post-img'), { scale: [1.18, 1], duration: 2600, ease: 'outQuart' }, T + 1300);

    // 2. a like, then likes pour out and float up
    tl.add($('.post-like'), { opacity: [0, 1], scale: [0.2, 1.4, 1], duration: 600, ease: 'outBack(2)' }, T + 2500);
    $('.heart').forEach((h, i) => {
      tl.add(h, { opacity: [{ to: 0.95, duration: 200 }, { to: 0, duration: 900, delay: 700 }], translateY: [0, -330 - (i % 3) * 60],
        translateX: [0, (i % 2 ? 1 : -1) * (20 + (i % 4) * 14)], duration: 1800, ease: 'outSine', loop: 3 }, T + 2700 + i * 190);
    });

    // 3. the channels pop in around it; the megaphone calls
    tl.add($('.channel'), { opacity: [0, 1], scale: [0.3, 1], duration: 650, delay: stagger(140), ease: 'outBack(2)' }, T + 3600)
      .add($('.channel'), { translateY: [0, -12, 0], duration: 2400, delay: stagger(300), loop: 3, ease: 'inOutSine' }, T + 4400)
      .add($('.megaphone'), { opacity: [0, 1], scale: [0.3, 1], duration: 650, ease: 'outBack(2)' }, T + 3900)
      .add($('.wave'), { opacity: [0, 1, 0], scale: [0.9, 1.15], duration: 900, delay: stagger(180), loop: 6, ease: 'outSine' }, T + 4300);

    // 4. growth: the line climbs
    tl.add(draws, { draw: ['0 0', '0 1'], duration: 1300, delay: stagger(350), ease: 'inOutQuad' }, T + 5200)
      .add($('.dot'), { opacity: [0, 1], scale: [0.2, 1], duration: 400, delay: stagger(170), ease: 'outBack(2)' }, T + 5500);

    // 5. technical solutions: the circuit lights every screen from one Tamlik chip
    tl.add(traces.slice(0, 1), { draw: ['0 0', '0 1'], duration: 450, ease: 'inQuad' }, T + 7000)
      .add($('.chip'), { opacity: [0, 1], scale: [0.3, 1], duration: 600, ease: 'outBack(2)' }, T + 7350)
      .add(traces.slice(1), { draw: ['0 0', '0 1'], duration: 900, delay: stagger(110), ease: 'inOutQuad' }, T + 7700)
      .add($('.node'), { opacity: [0, 1], scale: [0.2, 1], duration: 350, delay: stagger(90) }, T + 8400)
      .add($('.device'), { opacity: [0, 1], scale: [0.4, 1], translateY: [30, 0], duration: 700, delay: stagger(150), ease: 'outBack(1.6)' }, T + 8500);
    // data sparks run from the chip to each screen
    $('.spark').forEach((s, i) => {
      const path = el.querySelectorAll('.trace')[i + 1];
      tl.add(s, { ...svg.createMotionPath(path), opacity: [{ to: 1, duration: 100 }, { to: 1, duration: 600 }, { to: 0, duration: 200 }],
        duration: 900, ease: 'inOutSine', loop: 4 }, T + 9000 + i * 250);
    });
    return { tagAt: T + 9800 };
  },
};
