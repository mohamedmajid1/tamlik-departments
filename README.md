# Tamlik Departments

A 53-second animated loop (Anime.js 4) advertising three Tamlik departments on the hallway screens. It plays
forever with no interaction and has its own soundtrack.

| Time | Scene |
|---|---|
| 0–4 s | The Tamlik logo builds: the roofs slide together, the wordmark writes on, the three department names |
| 4–18 s | **Tamlik Maintenance**, *We keep it perfect*: a villa blueprint draws itself on a drawing sheet (solar panels, water heater, dish, kitchen, bathroom, split AC, breaker panel, sockets, foundations, north arrow, title block), its hidden pipes and wiring appear, four faults (a leak, a crack, a flickering light, a stuttering AC) turn amber, then green markers land, each fault bursts green and the tool turns into a check mark; a 24/7 ring closes |
| 18–32 s | **Tamlik Media**, *We make you seen*: a phone rises with a Tamlik feed (stills from the tower film), likes float up, Instagram, TikTok, LinkedIn and Facebook join, a growth line climbs, and a circuit from a Tamlik chip lights a laptop, a display and a website |
| 32–46 s | **Tamlik Fit-out**, *We shape your space*: a 3D walk-through. The camera stands in an empty flat: raw walls are painted from the ceiling down, the concrete floor flips over tile by tile to oak, a jute rug unrolls, real furniture drops into place, the pendants lower and switch on, and the sunset fills the window. Framed prints of the Tamlik tower go up on the wall |
| 46–53 s | The logo returns with the three departments and the contact caption, then fades to black and loops |

A green line wipes across the screen between scenes. The layout adapts to portrait (1080×1920) or landscape (1920×1080).

This is a separate project from `tamlik-experience` (the tower film). It copies what it needs from there (logo
artwork, colours, textures, film stills, music, the recording approach) and never changes it.

## Playing it

- **Live page:** open `index.html` from any static server (GitHub Pages serves it). It animates live in the browser and
  is light enough for the screens. Sound starts on its own where the browser allows autoplay with sound (kiosk
  browsers such as Fully Kiosk: turn on *Autoplay Audio*), otherwise on the first tap.
- **Video:** `renders/departments_portrait.mp4` and `renders/departments_landscape.mp4` (with sound), attached to the
  GitHub release. For screens that play video files.

URL options: `?o=portrait|landscape` forces a layout, `?only=maintenance|media|fitout` plays a single department spot
(for social media), `?t=20` freezes at 20 s, `?mute` silences it.

## Tools

- `node tools/record.mjs --o portrait` (or `landscape`, add `--only media` for a spot): frame-exact video with motion
  blur and the soundtrack, into `renders/`. Set `CHROME` to a Chrome/Edge path on Windows.
- `node tools/mix-audio.mjs`: rebuilds `assets/audio/loop.m4a`. **If the timing in `src/main.js` changes, update `L`
  and the cue times there.**
- `node tools/sheet.mjs portrait out 6 20 35`: frames at chosen seconds, for checking.

## Code

- `src/main.js`: builds the layers and the master timeline (intro, wipes, outro, loop, sound, recording hooks).
- `src/scenes/*.js`: each department's artwork and its `animate(tl, el, T)`. Maintenance and Media are SVG (a 1000×1000 box);
  Fit-out is a Three.js room (`init`, `render`) whose objects Anime.js moves directly.
- `node tools/fetch-assets.mjs`: downloads the furniture, textures (Poly Haven) and the music source.
- `src/brand.js`: logo, colours, icons, caption. `src/style.css`: layout for both orientations.

## Credits

- [Anime.js](https://animejs.com) 4.5.0 (MIT), `vendor/`.
- [Tabler Icons](https://tabler.io/icons) (MIT), `assets/icons/`.
- Furniture models and textures: [Poly Haven](https://polyhaven.com) (CC0), `assets/models/`, `assets/tex3d/`, `assets/tex/`.
- Music: "Once More With You" by [Loyalty Freak Music](https://archive.org/details/LoyaltyFreakMusic-minimalAmbientBounce) (CC0). Sound effects are
  synthesised in `tools/mix-audio.mjs`.
- Film stills: rendered from the Tamlik tower film, `assets/posts/`.
