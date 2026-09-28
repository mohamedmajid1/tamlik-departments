// Tamlik Departments: one master Anime.js timeline that plays forever on the hallway screens.
//   intro (the logo builds, the green roof line glows)  ->  Maintenance  ->  Media  ->  Fit-out
//   ->  outro (the three departments, the contact caption)  ->  fade to black, loop.
// Every scene is authored on a fixed canvas (1080×1920 portrait or 1920×1080 landscape, picked from the screen's
// shape) and scaled to fit, so all sizes are canvas pixels.
//   ?only=maintenance|media|fitout   a single 22 s spot (logo, the department, the caption), for social media
//   ?o=portrait|landscape            force an orientation
//   ?t=12.5                          hold the film at 12.5 s (stills)
//   ?record                          paused; tools/record.mjs drives window.__seek(ms) frame by frame
import { createTimeline, stagger } from '../vendor/anime.esm.min.js';
import { logoSVG, captionHTML } from './brand.js';
import { maintenance } from './scenes/maintenance.js';
import { media } from './scenes/media.js';
import { fitout } from './scenes/fitout.js';

const Q = new URLSearchParams(location.search);
const RECORD = Q.has('record');
const stage = document.getElementById('stage');
const ALL = [maintenance, media, fitout];
const SCENES = Q.get('only') ? ALL.filter((s) => s.id === Q.get('only')) : ALL;

const portrait = Q.get('o') ? Q.get('o') === 'portrait' : innerHeight >= innerWidth;
stage.className = portrait ? 'portrait' : 'landscape';
function fit() {
  const W = portrait ? 1080 : 1920, H = portrait ? 1920 : 1080, k = Math.min(innerWidth / W, innerHeight / H);
  stage.style.transform = `translate(${-W * k / 2}px, ${-H * k / 2}px) scale(${k})`;
}
fit(); addEventListener('resize', fit);

// letters / words as spans, so they can be staggered
const chars = (s) => [...s].map((c) => `<span class="ch">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
const words = (html) => html.split(/(<b>.*?<\/b>|\s+)/).filter((w) => w && !/^\s+$/.test(w))
  .map((w) => `<span class="wd">${w}</span>`).join(' ');

// ---- build the layers -------------------------------------------------------------------------------
stage.innerHTML = `
  <section id="intro" class="layer">
    <div class="glow"></div>
    <div class="big">${logoSVG('biglogo')}</div>
    <div class="depts">${ALL.map((s) => `<span style="color:${s.accent}">${s.name}</span>`).join('<i></i>')}</div>
  </section>`;
for (const s of SCENES) {
  const el = document.createElement('section');
  el.className = 'scene layer'; el.id = s.id;
  el.style.setProperty('--accent', s.accent); el.style.setProperty('--glow', s.glow);
  if (s.full) el.classList.add('full');
  el.innerHTML = `<div class="glow"></div><div class="grid"></div>
    ${s.full ? s.html() : `<svg class="art" viewBox="0 0 1000 1000">${s.art()}</svg>`}
    <div class="lockup">${logoSVG()}<div class="rule"></div><div class="dept">${chars(s.name)}</div></div>
    <div class="tagline">${words(s.tagline)}</div>
    <div class="footer">tamlikoman.com</div>`;
  stage.append(el);
  s.el = el;
}
stage.insertAdjacentHTML('beforeend', `
  <section id="outro" class="scene layer">
    <div class="glow"></div>
    <div class="big">${logoSVG('biglogo')}</div>
    <div class="trio">${ALL.map((s) => `<div class="dep" style="--accent:${s.accent}"><span class="dot"></span>${s.name}</div>`).join('')}</div>
    ${captionHTML()}
  </section>
  <div id="vignette"></div>
  <div id="sweep"></div>
  <div id="black"></div>`);
const $ = (sel, root = stage) => [...root.querySelectorAll(sel)];

await document.fonts.ready;
for (const s of SCENES) if (s.init) await s.init(s.el, { portrait, record: RECORD });

// ---- the master timeline ----------------------------------------------------------------------------
const INTRO = 4000, SCENE = 14000, OUTRO = 7000;
const END = INTRO + SCENES.length * SCENE + OUTRO;
const tl = createTimeline({ autoplay: false, loop: !RECORD, defaults: { ease: 'outQuad' } });

// the wipe: a green line crosses the screen and uncovers the next layer behind it
function wipe(el, at) {
  tl.set(el, { '--in': 0 }, 0)
    .add(el, { '--in': [0, 100], duration: 1100, ease: 'inOutCubic' }, at)
    .add(stage, { '--sw': [0, 100], duration: 1100, ease: 'inOutCubic' }, at)
    .add(stage, { '--swo': [{ to: 1, duration: 150 }, { to: 1, duration: 800 }, { to: 0, duration: 150 }] }, at);
}
tl.set(stage, { '--sw': 0, '--swo': 0 }, 0);

// intro: the roofs slide together, the wordmark writes on, the three departments appear under it
const intro = stage.querySelector('#intro');
tl.set($('#black'), { opacity: 1 }, 0)
  .set($('.depts span, .depts i, .roof-left, .roof-right', intro), { opacity: 0 }, 0)
  .set($('.wordmark', intro), { clipPath: 'inset(0% 100% 0% 0%)' }, 0)
  .add($('#black'), { opacity: [1, 0], duration: 700, ease: 'linear' }, 0)
  .add($('.roof-left', intro), { translateX: [-160, 0], translateY: [60, 0], opacity: [0, 1], duration: 1300, ease: 'outExpo' }, 250)
  .add($('.roof-right', intro), { translateX: [160, 0], translateY: [60, 0], opacity: [0, 1], duration: 1300, ease: 'outExpo' }, 350)
  .add($('.wordmark', intro), { clipPath: ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)'], duration: 1100, ease: 'inOutQuart' }, 900)
  .add($('.depts span, .depts i', intro), { opacity: [0, 1], translateY: [24, 0], duration: 700, delay: stagger(110) }, 1800)
  .add($('.roof-right', intro), { filter: ['drop-shadow(0 0 0px rgba(1,166,82,0))', 'drop-shadow(0 0 28px rgba(1,166,82,.95))', 'drop-shadow(0 0 0px rgba(1,166,82,0))'], duration: 1200 }, 2600);

// the department scenes
SCENES.forEach((s, i) => {
  const T = INTRO + i * SCENE, el = s.el;
  wipe(el, T - 600);
  tl.set($('.lockup .logo, .lockup .rule, .dept .ch, .tagline .wd, .footer', el), { opacity: 0 }, 0)
    .add($('.lockup .logo', el), { opacity: [0, 1], translateY: [-30, 0], duration: 900, ease: 'outExpo' }, T + 100)
    .add($('.lockup .rule', el), { opacity: [0, 1], scaleX: [0, 1], duration: 700, ease: 'inOutQuad' }, T + 400)
    .add($('.dept .ch', el), { opacity: [0, 1], translateY: [18, 0], filter: ['blur(6px)', 'blur(0px)'], duration: 600, delay: stagger(45) }, T + 600);
  const { tagAt } = s.animate(tl, el, T);
  tl.add($('.tagline .wd', el), { opacity: [0, 1], translateY: [40, 0], filter: ['blur(8px)', 'blur(0px)'], duration: 900, delay: stagger(140), ease: 'outExpo' }, tagAt)
    .add($('.footer', el), { opacity: [0, 1], duration: 900 }, tagAt + 600);
});

// outro: the logo returns with its three departments, then the contact details
const outro = stage.querySelector('#outro'), TO = INTRO + SCENES.length * SCENE;
wipe(outro, TO - 600);
tl.set($('.big, .dep, .caption .site, .caption .row span', outro), { opacity: 0 }, 0)
  .add($('.big', outro), { opacity: [0, 1], scale: [0.9, 1], duration: 1200, ease: 'outExpo' }, TO + 100)
  .add($('.dep', outro), { opacity: [0, 1], translateY: [30, 0], duration: 800, delay: stagger(160), ease: 'outExpo' }, TO + 700)
  .add($('.caption .site', outro), { opacity: [0, 1], translateY: [20, 0], duration: 900, ease: 'outExpo' }, TO + 1700)
  .add($('.caption .row span', outro), { opacity: [0, 1], translateY: [16, 0], duration: 800, delay: stagger(140) }, TO + 2000)
  .add($('#black'), { opacity: [0, 1], duration: 900, ease: 'linear' }, END - 900)
  .call(() => {}, END);

// ---- sound ------------------------------------------------------------------------------------------
// assets/audio/loop.m4a (tools/mix-audio.mjs) is exactly one film long, its sounds placed on the film's timeline.
// It follows the timeline's clock. Browsers only allow sound after a first touch or key press (unless a kiosk
// browser is set to allow it), so if autoplay is refused it joins in at the right moment on the first touch.
// ?mute keeps it silent; recording never plays it (tools/record.mjs adds the same file to the video).
const sound = (() => {
  if (RECORD || Q.has('mute') || Q.has('t') || Q.has('only')) return null;
  const a = new Audio('assets/audio/loop.m4a');
  a.preload = 'auto'; a.loop = true;
  const filmTime = () => (tl.iterationCurrentTime ?? tl.currentTime % END) / 1000;
  const sync = () => { if (Math.abs(a.currentTime - filmTime()) > 0.12) a.currentTime = filmTime(); };
  const start = () => { sync(); return a.play(); };
  const unlock = () => { if (a.paused) start().catch(() => {}); };
  for (const ev of ['pointerdown', 'mousedown', 'click', 'keydown', 'touchend']) addEventListener(ev, unlock, { passive: true, capture: true });
  setInterval(() => { if (!a.paused) sync(); }, 2000);
  window.__sound = a;
  return { start };
})();

// 3D scenes draw themselves only while on screen (live: every frame; recording: after every seek)
const live3d = SCENES.map((s, i) => ({ s, from: INTRO + i * SCENE - 1200, to: INTRO + (i + 1) * SCENE + 600 })).filter((x) => x.s.render);
function drawScenes(ms) { for (const x of live3d) if (ms >= x.from && ms <= x.to) x.s.render(); }
if (!RECORD && live3d.length) (function loop() { drawScenes(tl.iterationCurrentTime ?? 0); requestAnimationFrame(loop); })();

// ---- play ---------------------------------------------------------------------------------------------
window.__duration = END;
window.__seek = (ms) => { tl.seek(ms); drawScenes(ms); };
if (Q.has('t')) tl.seek(+Q.get('t') * 1000);
else if (!RECORD) { tl.play(); sound?.start().catch(() => {}); }
stage.classList.add('ready');
if (RECORD) document.getElementById('loading')?.remove(); else document.getElementById('loading')?.classList.add('gone');
window.__ready = true;
