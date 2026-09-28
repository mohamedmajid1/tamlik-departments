// Tamlik Media: marketing and technical solutions. A phone shows a Tamlik feed (stills from the tower film),
// likes float up, the channels orbit it, a growth line climbs, and a circuit links the phone to every screen:
// laptop, display, website. All art lives in a 1000×1000 box.
import { C, icon } from '../brand.js';

const P = C.paper, A = C.cyan;
const img = (n) => `assets/posts/film_${n}.jpg`;

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
      <linearGradient id="mdFade" x1="0" y1="0" x2="0" y2="1"><stop offset=".7" stop-color="${C.ink}" stop-opacity="0"/><stop offset="1" stop-color="${C.ink}" stop-opacity=".95"/></linearGradient>
      <radialGradient id="mdGlow" r=".5"><stop offset="0" stop-color="${A}" stop-opacity=".35"/><stop offset="1" stop-color="${A}" stop-opacity="0"/></radialGradient>
    </defs>

    <!-- the circuit: every screen fed from one Tamlik chip -->
    <g class="circuit" fill="none" stroke="${A}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".8">
      <path class="draw trace" d="M 500 ${Y + H} L 500 815"/>
      <path class="draw trace" d="M 470 845 L 250 845 Q 230 845 230 865 L 230 880"/>
      <path class="draw trace" d="M 530 845 L 750 845 Q 770 845 770 865 L 770 880"/>
      <path class="draw trace" d="M 500 875 L 500 905"/>
      <path class="draw trace thin" d="M 470 830 L 400 830 Q 380 830 380 810 L 380 790" stroke-opacity=".4"/>
      <path class="draw trace thin" d="M 530 830 L 600 830 Q 620 830 620 810 L 620 790" stroke-opacity=".4"/>
    </g>
    ${[[230, 880], [770, 880], [500, 905], [380, 790], [620, 790]].map(([x, y]) => `<circle class="node" cx="${x}" cy="${y}" r="5" fill="${A}"/>`).join('')}
    <g class="chip"><rect x="470" y="815" width="60" height="60" rx="10" fill="${C.ink}" stroke="${A}" stroke-width="2.2"/>
      <path d="M 481 856 L 500 838 L 519 856" fill="none" stroke="${C.green}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>
    <g class="device">${icon('device-laptop', 230, 930, 84, { color: P, width: 2 })}</g>
    <g class="device">${icon('device-desktop', 500, 950, 84, { color: P, width: 2 })}</g>
    <g class="device">${icon('world-www', 770, 930, 84, { color: P, width: 2 })}</g>

    <!-- the phone and its feed -->
    <circle cx="500" cy="${Y + H / 2}" r="360" fill="url(#mdGlow)" opacity=".5"/>
    <g class="phone">
      <rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="42" fill="#0e1014" stroke="${P}" stroke-opacity=".85" stroke-width="2.4"/>
      <g clip-path="url(#mdScreen)">
        <rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="#0b0c0f"/>
        <path d="M ${X + 30} ${Y + 58} L ${X + 42} ${Y + 48} L ${X + 54} ${Y + 58}" fill="none" stroke="${C.green}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="${X + 64}" y="${Y + 48}" width="86" height="11" rx="5.5" fill="${P}" fill-opacity=".8"/>
        ${icon('heart', X + W - 66, Y + 54, 22, { color: P, width: 1.8 })}${icon('message-circle', X + W - 34, Y + 54, 22, { color: P, width: 1.8 })}
        ${stories.map((n, i) => `<circle cx="${X + 52 + i * 59}" cy="${Y + 108}" r="26" fill="none" stroke="${i ? A : C.green}" stroke-width="2.4"/>
          <image href="${img(n)}" x="${X + 30 + i * 59}" y="${Y + 86}" width="44" height="44" preserveAspectRatio="xMidYMid slice" clip-path="url(#mdSt${i})"/>`).join('')}
        <g class="post">
          <circle cx="${X + 34}" cy="${Y + 164}" r="12" fill="${C.green}"/>
          <rect x="${X + 54}" y="${Y + 158}" width="70" height="10" rx="5" fill="${P}" fill-opacity=".75"/>
          <image class="post-img" href="${img('0.4')}" x="${X + 12}" y="${Y + 188}" width="${W - 24}" height="${W - 24}" preserveAspectRatio="xMidYMid slice"/>
          <g class="post-like">${icon('heart', X + 38, Y + 466, 30, { color: C.green, width: 2.2 })}</g>
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
    <g class="hearts">
      ${[[680, 560, 44, 1], [720, 470, 34, 0.8], [660, 400, 28, 0.6], [740, 350, 22, 0.4], [700, 290, 18, 0.25]].map(([x, y, s, o]) =>
        `<g class="heart" opacity="${o}"><path transform="translate(${x - s / 2} ${y - s / 2}) scale(${s / 24})" d="M12 20.5 L4.6 13.2 A4.6 4.6 0 0 1 12 6.6 A4.6 4.6 0 0 1 19.4 13.2 Z" fill="${C.green}"/></g>`).join('')}
    </g>

    <!-- the channels -->
    ${[['brand-instagram', 220, 420], ['brand-tiktok', 170, 560], ['brand-linkedin', 230, 690], ['brand-facebook', 830, 690]].map(([n, x, y]) =>
      `<g class="channel"><circle cx="${x}" cy="${y}" r="44" fill="${C.ink}" stroke="${A}" stroke-opacity=".75" stroke-width="2"/>${icon(n, x, y, 44, { color: P, width: 1.8 })}</g>`).join('')}

    <!-- the megaphone, announcing -->
    <g class="megaphone">
      ${icon('speakerphone', 180, 250, 92, { color: A, width: 2.2 })}
      <path d="M 238 214 Q 262 250 238 286 M 256 196 Q 290 250 256 304" fill="none" stroke="${A}" stroke-width="2.2" stroke-linecap="round" stroke-opacity=".7"/>
    </g>

    <!-- growth: a line that keeps climbing -->
    <g class="chart">
      <path d="M 720 140 L 720 280 L 930 280" fill="none" stroke="${P}" stroke-opacity=".4" stroke-width="1.6"/>
      <path class="draw growth" d="M 725 262 L 765 248 L 800 255 L 840 215 L 872 222 L 915 160" fill="none" stroke="${C.green}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 898 160 L 915 160 L 915 177" fill="none" stroke="${C.green}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
      ${[[765, 248], [800, 255], [840, 215], [872, 222]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${C.ink}" stroke="${C.green}" stroke-width="2.4"/>`).join('')}
    </g>`;
  },
};
