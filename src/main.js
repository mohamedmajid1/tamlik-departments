// Tamlik Departments: stage setup. Every scene is authored on a fixed canvas (1080×1920 portrait or 1920×1080
// landscape, picked from the screen's shape) and scaled to fit, so all sizes below are canvas pixels.
//   ?still=maintenance|media|fitout   shows a scene's finished frame (style frames)
//   ?o=portrait|landscape             forces an orientation
import { logoSVG } from './brand.js';
import { maintenance } from './scenes/maintenance.js';
import { media } from './scenes/media.js';
import { fitout } from './scenes/fitout.js';

const Q = new URLSearchParams(location.search);
const stage = document.getElementById('stage');
const SCENES = [maintenance, media, fitout];

const portrait = Q.get('o') ? Q.get('o') === 'portrait' : innerHeight >= innerWidth;
stage.className = portrait ? 'portrait' : 'landscape';
function fit() {
  const W = portrait ? 1080 : 1920, H = portrait ? 1920 : 1080, k = Math.min(innerWidth / W, innerHeight / H);
  stage.style.transform = `translate(${-W * k / 2}px, ${-H * k / 2}px) scale(${k})`;
}
fit(); addEventListener('resize', fit);

for (const s of SCENES) {
  const el = document.createElement('section');
  el.className = 'scene'; el.id = s.id;
  el.style.setProperty('--accent', s.accent); el.style.setProperty('--glow', s.glow);
  el.innerHTML = `<div class="glow"></div><div class="grid"></div>
    <svg class="art" viewBox="0 0 1000 1000">${s.art()}</svg>
    <div class="lockup">${logoSVG()}<div class="rule"></div><div class="dept">${s.name}</div></div>
    <div class="tagline">${s.tagline}</div>
    <div class="footer">tamlikoman.com</div>`;
  stage.append(el);
  s.el = el;
}

const still = Q.get('still') || SCENES[0].id;
document.getElementById(still)?.classList.add('on');
await document.fonts.ready;
window.__ready = true;
