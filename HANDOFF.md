# Tamlik hallway screens: handoff

There are two separate projects. Both are loops that play on the hallway screens with no interaction.

| | **Tower film** (`tamlik-experience`) | **Departments** (`tamlik-departments`, this repo) |
|---|---|---|
| What it is | A 65.7 s cinematic 3D flight over Muscat to the Tamlik tower and penthouse, ending on a drone-show logo and the contact caption | A 53 s ad for Tamlik Maintenance, Tamlik Media and Tamlik Fit-out, in three 3D scenes, ending on the contact caption |
| Repo | https://github.com/mohamedmajid1/tamlik-experience | https://github.com/mohamedmajid1/tamlik-departments |
| Live (3D in the browser) | https://mohamedmajid1.github.io/tamlik-experience/ | https://mohamedmajid1.github.io/tamlik-departments/ |
| Screens (video) | https://tamlik.pages.dev (Cloudflare Pages project `tamlik`) | The videos attached to the latest GitHub release: https://github.com/mohamedmajid1/tamlik-departments/releases |
| Deploys | Push to `main` updates the live page. `tools/release.sh` re-records and deploys the screens | Push to `main` updates the live page. `tools/record.mjs` records the videos; attach them to a release |

**Who does what:** the owner (with Claude) improves the films and pushes to GitHub. Ahmed (GitHub: Ahmedabied) deploys to the screens.

The two projects are independent. The departments repo copied what it needed from the tower film (logo artwork,
colours, textures, film stills, the recording approach) and never changes it.

---

## 1. Departments (this repo)

### What plays

| Time | Scene |
|---|---|
| 0–4 s | Logo intro: the roofs slide together, the wordmark writes on, the three department names appear |
| 4–18 s | **Maintenance**, *We keep it perfect*. An apartment with real problems: a broken pendant sparking and flickering, water dripping from a stained ceiling into a bucket, a wall cracked open to the bricks, grime, cold light. Green rings diagnose each fault, the repair kit arrives (ladder, toolbox, drill, wrench), and a green scan line sweeps the room and fixes everything as it passes; check marks confirm; the room turns warm |
| 18–32 s | **Media**, *We make you seen*. A real-estate film shoot in a studio: softboxes strike, the clapper snaps, the cinema camera rolls on a slider, a drone lifts off over the set, and the director's monitor shows the live shot (really rendered from the cinema camera) with REC, timecode and likes rising |
| 32–46 s | **Fit-out**, *We shape your space*. A walk-through of a flat being finished: walls painted from the ceiling down, concrete floor turning over to oak, rug, furniture settling in, downlights and pendants on, curtains in the sunset, framed prints of the Tamlik tower |
| 46–53 s | The logo with the three departments, then the website, socials and phone; fade to black; loop |

The scenes dissolve into each other behind a soft edge with a green line riding through it. The layout adapts to
portrait (1080×1920) or landscape (1920×1080). Each scene has a lockup (logo + department name) and a tagline.

### Putting it on the screens

The 3D is too heavy for the slow Android screens to run live, so **the screens should play the recorded video**:

1. Download `departments_portrait.mp4` or `departments_landscape.mp4` from the latest release
   (53 s, 60 fps, with sound, loops seamlessly).
2. Play it on a loop on the screen, or add it to the screen player the same way as the tower film.
   (It is not on tamlik.pages.dev yet. Adding it there, or alternating the two films, is an open decision; see *Open items*.)

Sound: the screens need speakers and a player that allows sound without a tap (Fully Kiosk: *Autoplay Audio* on).

### Re-recording the videos (after any change)

Needs Node 22+, Chrome or Edge, ffmpeg and a GPU. On Windows, set `CHROME` to the browser path.

```sh
node tools/record.mjs --o portrait  --fps 60 --blur 2 --scale 2 --crf 12
node tools/record.mjs --o landscape --fps 60 --blur 2 --scale 2 --crf 12
gh release create vX.Y renders/departments_portrait.mp4 renders/departments_landscape.mp4 --title "..." --notes "..."
```

`--scale 2` renders at double resolution then scales down (sharper). `--blur 2` adds motion blur. Recording also turns
on ambient occlusion and 4K shadows. Expect about 45–60 minutes per video on a laptop GPU.
Single-department clips for social media: add `--only maintenance` (or `media`, `fitout`); these have no sound yet.

### Editing

| To change | Edit |
|---|---|
| A department's scene, props, lights, camera move | `src/scenes/maintenance.js`, `media.js`, `fitout.js` (each: `init` builds the 3D, `animate` adds the moves to the timeline, `render` draws) |
| Shared 3D quality (reflections, shadows, glow, AO, loaders) | `src/three/kit.js` |
| Intro, transitions, outro, loop, sound sync | `src/main.js` |
| Colours, logo, caption text, icons | `src/brand.js` |
| Layout of the text for portrait and landscape | `src/style.css` |
| The soundtrack | `tools/mix-audio.mjs` then `node tools/mix-audio.mjs` |
| New furniture, textures, HDRs, music source | `tools/fetch-assets.mjs` then `node tools/fetch-assets.mjs` |

Checking a change without recording: `node tools/sheet.mjs portrait out 6 12 20 35` saves frames at those seconds.
URL options on the live page: `?o=portrait|landscape`, `?t=20` (freeze at 20 s), `?only=media`, `?mute`, `?record`.

### Things that break easily

- **Timing and sound are coupled.** The film is 4 s + 3 × 14 s + 7 s = 53 s, and every sound in `tools/mix-audio.mjs`
  sits on a film timestamp. If you change a scene's timing or length, update `L` and the cue times, then rebuild.
- **Everything animated must be reset at time 0** (`tl.set(..., 0)` at the top of each `animate`), or the second loop
  starts in the finished state.
- **A texture that hasn't loaded draws black.** Always load through `tex()` / `model()` in `kit.js`, which the page
  waits for before starting.
- **The glow (bloom) is deliberately subtle** (threshold 1.0). Raising it washes the rooms out white.
- **Anime.js 4 syntax:** named imports, `ease: steps(2)` (not the string), and never pass an array of numbers as a target.
- The first visit downloads about 15–20 MB (models, textures, HDRs) behind the logo loading screen; after that the
  browser caches it.

---

## 2. Tower film (`tamlik-experience`)

- Live 3D page: https://mohamedmajid1.github.io/tamlik-experience/ (updates on every push to `main`).
- Screens: https://tamlik.pages.dev, a video player that caches the film and plays it offline, deployed by
  `tools/release.sh` (renders three masters with motion blur, encodes, adds the soundtrack, deploys with wrangler
  to the Tamlik Cloudflare account). About 3 hours with motion blur.
- Soundtrack: `assets/audio/loop.m4a`, exactly one loop (65.7 s = 3942 frames). If shot timing changes, check the
  `loop closes at` line from `record.mjs`, update `L` in `tools/mix-audio.mjs`, rebuild.
- The live page adapts its quality to the device (drops AO, then resolution, behind the closed curtains); the
  recorded film always renders full quality. `?hq` forces full quality live.
- Constraints from the owner: the tower's look is final; no on-screen text except the closing caption; no pauses;
  nobody interacts with the screens.
- `Play Tamlik.bat` (Windows) opens the live film full screen in Edge with sound allowed.

---

## Open items

1. **Tower film, not yet on the screens.** The screens still show the version from 24 September, without sound, the
   flicker fix or the street detail. Ahmed: pull, run `tools/release.sh` (tracked in
   https://github.com/mohamedmajid1/tamlik-experience/issues/2).
2. **Departments, not on the screens yet.** Decide how the screens get it: a second screen player/page, alternating
   with the tower film, or a separate set of screens. The videos are ready on the releases page.
3. **Sound on the screens** needs speakers and autoplay-with-sound enabled on each screen (Fully Kiosk *Autoplay
   Audio*, or install the player from Chrome's menu and open it from that icon).
4. **Music** for the departments is "Once More With You" (Loyalty Freak Music, CC0), chosen by measurement; the owner
   should confirm they like it. To swap it, change the download URL in `tools/fetch-assets.mjs` (the same CC0 album,
   *Minimal Ambient Bounce*, has six more tracks), run it, then `node tools/mix-audio.mjs`.
5. **Single-department clips** (`--only`) have no soundtrack yet.
6. **Cloudflare login:** only Ahmed's machine is logged in to the Tamlik Cloudflare account (`npx wrangler login`).

## Credits and licences

All third-party material is free for commercial use.

- Anime.js 4.5.0 (MIT), Three.js 0.160 (MIT, from jsDelivr), Tabler Icons (MIT).
- Poly Haven models, textures and HDRs (CC0).
- Music: "Once More With You" by Loyalty Freak Music (CC0). Tower film: "Cosmic Waves" by HoliznaCC0 (CC0) plus
  public-domain field recordings. All sound effects are synthesised.
