// Build the soundtrack: one seamless loop exactly as long as the film (53 s), every sound placed on the film's own
// timeline (seconds from the start, see src/main.js and src/scenes/*).   node tools/mix-audio.mjs -> assets/audio/loop.m4a
// Music: "Cosmic Waves" by HoliznaCC0 (CC0), the same bed as the tower film. Every effect is synthesised here and
// tuned to the music (A minor). Needs ffmpeg.
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rmSync, mkdirSync } from 'node:fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'assets', 'audio', 'loop.m4a');
const L = 53;            // film length: 4 s intro + 3 × 14 s departments + 7 s outro
const XF = 4;            // music crossfade across the loop seam
mkdirSync(dirname(OUT), { recursive: true });

const env = (keys) => {
  let e = String(keys[keys.length - 1][1]);
  for (let i = keys.length - 2; i >= 0; i--) {
    const [t0, v0] = keys[i], [t1, v1] = keys[i + 1];
    e = `if(lt(t,${t1}),${v0}+${v1 - v0}*(t-${t0})/${t1 - t0},${e})`;
  }
  return `if(lt(t,${keys[0][0]}),${keys[0][1]},${e})`;
};
const place = (at) => `adelay=${Math.round(at * 1000)}|${Math.round(at * 1000)},apad,atrim=0:${L}`;
const g = [], layers = [];
let n = 0;
const layer = (chain) => { const id = `l${n++}`; g.push(`${chain}[${id}]`); layers.push(`[${id}]`); };
// a synthesised one-shot: expr is a function of t (seconds), gain, pan (-1 left … 1 right)
const shot = (at, expr, d, gain = 1, pan = 0) => layer(
  `aevalsrc=exprs='${gain}*(${expr})':d=${d}:s=48000,pan=stereo|c0=${(1 - pan) / 2 + 0.25}*c0|c1=${(1 + pan) / 2 + 0.25}*c0,${place(at)}`);

// the sound palette
const pop = (at, gain = 0.25, pan = 0) => shot(at, 'sin(2*PI*(520*t+2600*t*t))*exp(-26*t)', 0.25, gain, pan);
const plink = (at, f = 1760, gain = 0.12, pan = 0) => shot(at, `sin(2*PI*${f}*t)*exp(-16*t)*min(t/0.003,1)`, 0.45, gain, pan);
const thud = (at, gain = 0.34, pan = 0) => shot(at, 'sin(2*PI*(95*t-70*t*t))*exp(-13*t)*min(t/0.004,1)', 0.4, gain, pan);
const click = (at, gain = 0.2) => shot(at, '(random(0)*2-1)*exp(-160*t)', 0.06, gain);
const blip = (at, f = 1318.5, gain = 0.08, pan = 0) => shot(at, `sin(2*PI*${f}*t)*lt(t,0.07)*min(t/0.005,1)*min((0.07-t)/0.01,1)`, 0.08, gain, pan);
const bell = (at, f, gain) => layer(
  `sine=f=${f}:d=4:r=48000,aformat=channel_layouts=stereo,volume='${gain}*exp(-1.9*t)*min(t/0.004,1)':eval=frame,aecho=0.8:0.6:70|130|210:0.35|0.25|0.15,${place(at)}`);
const chime = (at, gain, notes = [659.26, 880, 1318.5]) => notes.forEach((f, i) => bell(at + i * 0.16, f, gain * [1, 0.8, 0.35][i]));
const whoosh = (at, d, gain, i) => layer(
  `anoisesrc=c=pink:a=0.8:seed=${21 + i}:d=${d}:r=48000,highpass=f=300,lowpass=f=3600,aformat=channel_layouts=stereo,` +
  `volume='${gain}*pow(sin(PI*min(t/${d},1)),3)':eval=frame,apulsator=mode=sine:hz=${(0.5 / d).toFixed(3)}:width=0.7,${place(at)}`);
const hiss = (at, d, gain, i) => layer(          // a pen drawing on paper
  `anoisesrc=c=white:a=0.5:seed=${41 + i}:d=${d}:r=48000,highpass=f=2500,lowpass=f=7000,aformat=channel_layouts=stereo,` +
  `volume='${gain}*sin(PI*t/${d})*(0.6+0.4*sin(2*PI*9*t))':eval=frame,${place(at)}`);
const boom = (at, gain) => layer(`sine=f=55:d=4:r=48000,aformat=channel_layouts=stereo,volume='${gain}*exp(-1.6*t)*min(t/0.03,1)':eval=frame,${place(at)}`);
const pad = (freqs, at, d, keys) => freqs.forEach((f, i) => layer(
  `sine=f=${f}:d=${d}:r=48000,aformat=channel_layouts=stereo,tremolo=f=${4.5 + i * 0.7}:d=0.18,volume='${env(keys)}':eval=frame,aecho=0.8:0.7:90|160:0.3|0.2,${place(at)}`));

// music: a loop cut with an equal-power crossfade over the seam; dips under the fade to black
const inputs = ['-i', join(root, 'assets', 'audio', 'src', 'music.m4a')];
g.push(`[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[m0][m1]`);
g.push(`[m0]atrim=0:${L},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=${XF}:curve=qsin[mA]`);
g.push(`[m1]atrim=${L}:${L + XF},asetpts=PTS-STARTPTS,afade=t=out:st=0:d=${XF}:curve=qsin[mB]`);
layer(`[mA][mB]amix=inputs=2:duration=first:normalize=0,volume='${env([[0, 0.85], [45, 0.85], [47, 1.0], [53, 0.9]])}':eval=frame`);

// intro: the roofs land, the wordmark writes on, the three names
boom(0.3, 0.45); whoosh(0.2, 1.4, 0.18, 0); chime(1.9, 0.07);
[1.8, 1.91, 2.02].forEach((t, i) => blip(t, [880, 1046.5, 1318.5][i], 0.05));
// the wipes between departments
[3.4, 17.4, 31.4, 45.4].forEach((t, i) => whoosh(t, 1.3, 0.3, i + 1));

// Maintenance (T = 4): the blueprint draws, faults appear, four fixes, the 24/7 ring
hiss(4.5, 1.5, 0.05, 0);
shot(7.6, 'sin(2*PI*233*t)*sin(2*PI*247*t)*exp(-3*t)', 1.2, 0.12);          // a low, uneasy warning
for (let lp = 0; lp < 4; lp++) for (let d = 0; d < 3; d++) plink(7.8 + d * 0.21 + lp * 0.64 + 0.3, 2093, 0.07, -0.4);   // drips
[10.1, 11.15, 12.2, 13.25].forEach((t, i) => { click(t + 0.1, 0.22); bell(t + 0.55, [659.26, 783.99, 880, 1046.5][i], 0.09); });
chime(14.5, 0.06);

// Media (T = 18): the phone rises, a like, hearts, the channels, growth, the circuit
whoosh(18.5, 1.0, 0.14, 6); pop(20.5, 0.3);
for (let i = 0; i < 9; i++) for (let lp = 0; lp < 2; lp++) plink(20.7 + i * 0.19 + lp * 1.8, [1760, 1975.5, 2093][i % 3], 0.05, 0.4);
[21.6, 21.74, 21.88, 22.02].forEach((t, i) => pop(t, 0.2, i < 3 ? -0.5 : 0.6));
pop(21.9, 0.22, -0.6);
shot(23.2, 'sin(2*PI*(440*t+330*t*t))*exp(-1.2*t)*min(t/0.02,1)', 1.3, 0.06, 0.5);   // the growth line climbs
blip(25.35, 880, 0.1); [25.7, 25.81, 25.92].forEach((t) => blip(t, 1318.5, 0.05));
[26.5, 26.65, 26.8].forEach((t, i) => pop(t, 0.18, [-0.6, 0, 0.6][i]));
for (let i = 0; i < 3; i++) for (let lp = 0; lp < 4; lp++) blip(27 + i * 0.25 + lp * 0.9, 1760, 0.035, [-0.6, 0, 0.6][i]);

// Fit-out (T = 32): the shell draws, the concrete lifts, furniture lands, the lamp, the samples
hiss(32.5, 2.2, 0.05, 1);
layer(`anoisesrc=c=brown:a=0.6:seed=77:d=2.6:r=48000,lowpass=f=900,aformat=channel_layouts=stereo,volume='0.35*sin(PI*t/2.6)':eval=frame,${place(34.5)}`);
for (let i = 0; i < 20; i++) thud(36.9 + i * 0.17 + 0.25, 0.24, (i % 5 - 2) * 0.25);
click(40.9, 0.3);
pad([220, 329.63, 440], 40.9, 5, [[0, 0], [1.2, 0.03], [3.5, 0.025], [5, 0]]);
whoosh(41.8, 1.0, 0.12, 9);

// outro: the logo, the three names, the caption
chime(46.1, 0.08); [46.7, 46.86, 47.02].forEach((t, i) => blip(t, [880, 1046.5, 1318.5][i], 0.05));

// mix, measure, then set the level (about -20 LUFS: calm under a hallway) and limit the peaks
g.push(`${layers.join('')}amix=inputs=${layers.length}:duration=longest:normalize=0,atrim=0:${L}[mix]`);
const tmp = join(root, 'assets', 'audio', '_mix.wav');
execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', g.join(';'), '-map', '[mix]', '-ar', '48000', '-c:a', 'pcm_f32le', tmp], { stdio: 'inherit' });
const report = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', tmp, '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const I = +((/I:\s+(-?[\d.]+) LUFS\s*\n\s*Threshold/.exec(report) || [])[1] ?? -20);
const gain = (-20 - I).toFixed(2);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-af', `volume=${gain}dB,alimiter=limit=0.84:level=false`, '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', OUT], { stdio: 'inherit' });
rmSync(tmp);
console.log(`soundtrack: ${OUT} (${L}s, ${layers.length} layers, measured ${I} LUFS, gain ${gain} dB)`);
