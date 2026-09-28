# Tamlik Departments

An Anime.js 4 advertising loop for three Tamlik departments, played on the hallway screens:

- **Tamlik Maintenance**: *We keep it perfect.* A villa blueprint; the green line finds and fixes each fault.
- **Tamlik Media**: *We make you seen.* A Tamlik feed, the channels, growth, and a circuit to every screen.
- **Tamlik Fit-out**: *We shape your space.* An empty floor plan becomes a finished room.

The idea: the green roof stroke of the Tamlik logo is one line that builds every department's world.

This is a separate project from `tamlik-experience` (the tower film). It copies what it needs from there
(logo artwork, colours, textures, film stills, the recording helper) and never changes it.

## Status

Style frames (finished frame of each scene, portrait and landscape): `frames/`. Animation comes next.

## Preview

Serve the folder with any static server and open `index.html?still=maintenance` (or `media`, `fitout`);
add `&o=landscape` for the landscape layout. Or render stills: `node tools/still.mjs media portrait out.png`
(set `CHROME` to a Chrome/Edge path on Windows).

## Credits

- [Anime.js](https://animejs.com) 4.5.0 (MIT), `vendor/`.
- [Tabler Icons](https://tabler.io/icons) (MIT), `assets/icons/`.
- Textures: [Poly Haven](https://polyhaven.com) (CC0), `assets/tex/`.
- Film stills: rendered from the Tamlik tower film, `assets/posts/`.
