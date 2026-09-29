# Tamlik Departments

A 53-second animated loop (Anime.js 4) advertising three Tamlik departments on the hallway screens. It plays
forever with no interaction and has its own soundtrack.

| Time | Scene |
|---|---|
| 0–4 s | The Tamlik logo builds: the roofs slide together, the wordmark writes on, the three department names |
| 4–18 s | **Tamlik Maintenance**, *We keep it perfect*: a 3D apartment with real problems: a broken pendant sparks and flickers, water drips from a stained ceiling into a bucket, a wall is cracked open to the bricks with rubble below, grime everywhere. Green rings diagnose each fault, the Tamlik kit arrives (ladder, toolbox, drill), and a green scan line sweeps the room: the rubble flies back and the wall seals, the lamp swings straight and lights, the leak stops and the puddle dries, the walls come up clean and the room turns warm |
| 18–32 s | **Tamlik Media**, *We make you seen*: a real-estate film shoot in a 3D studio. A staged living room with a big print of the Tamlik tower; the softboxes strike one by one, the clapper snaps, the cinema camera rolls and glides along its slider, a drone lifts off and hovers over the set, and the director's monitor shows the live shot (really rendered from the cinema camera) with likes rising over it |
| 32–46 s | **Tamlik Fit-out**, *We shape your space*: a 3D walk-through of a flat being finished: raw walls painted from the ceiling down, the concrete floor turning over to oak, a jute rug, furniture settling into place (sectional sofa with a throw, lounge and arm chairs, coffee table with books, sideboard, display shelves, arc floor lamp, plants), downlights and pendants coming on, sheer curtains stirring in the sunset, prints of the Tamlik tower |
| 46–53 s | The logo returns with the three departments and the contact caption, then fades to black and loops |

Scenes dissolve into each other behind a soft, feathered edge with a green line riding through it. The layout adapts to portrait (1080×1920) or landscape (1920×1080).

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
- `src/scenes/*.js`: each department is a Three.js scene (`init`, `animate(tl, el, T)`, `render`) whose objects Anime.js
  moves directly. `src/three/kit.js` is shared: renderer, HDR reflections, soft shadows, bloom, AO when recording, loaders.
- `node tools/fetch-assets.mjs`: downloads the furniture, textures (Poly Haven) and the music source.
- `src/brand.js`: logo, colours, icons, caption. `src/style.css`: layout for both orientations.

## Credits

- [Anime.js](https://animejs.com) 4.5.0 (MIT), `vendor/`.
- [Tabler Icons](https://tabler.io/icons) (MIT), `assets/icons/`.
- Furniture and tool models, textures and HDR environments: [Poly Haven](https://polyhaven.com) (CC0), `assets/models/`, `assets/tex3d/`, `assets/hdr/`.
- Music: "Once More With You" by [Loyalty Freak Music](https://archive.org/details/LoyaltyFreakMusic-minimalAmbientBounce) (CC0). Sound effects are
  synthesised in `tools/mix-audio.mjs`.
- Film stills: rendered from the Tamlik tower film, `assets/posts/`.
