// Download the 3D furniture and textures for the Fit-out room (Poly Haven, CC0) and the music (Internet Archive, CC0)
// into assets/.   node tools/fetch-assets.mjs
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
async function save(path, url) {
  if (existsSync(path)) return;
  mkdirSync(dirname(path), { recursive: true });
  const r = await fetch(url); if (!r.ok) throw new Error(`${r.status} ${url}`);
  writeFileSync(path, Buffer.from(await r.arrayBuffer()));
  console.log('saved', path.slice(root.length + 1));
}

// furniture (1k glTF)
const MODELS = ['mid_century_lounge_chair', 'modern_arm_chair_01', 'modern_coffee_table_01', 'side_table_01',
  'modern_ceiling_lamp_01', 'modern_wooden_cabinet', 'potted_plant_01',
  'potted_plant_02', 'potted_plant_04', 'brass_vase_01', 'ceramic_vase_02',
  'throw_pillows_01', 'standing_picture_frame_02'];
// surfaces (1k jpg): diffuse, OpenGL normal, roughness
const TEXTURES = ['wood_floor', 'marble_01', 'plastered_wall', 'concrete_floor_02', 'poly_wool_herringbone', 'hessian_230', 'walnut_veneer'];

for (const name of MODELS) {
  const g = (await (await fetch(`https://api.polyhaven.com/files/${name}`)).json()).gltf['1k'].gltf;
  await save(join(root, 'models', name, `${name}.gltf`), g.url);
  for (const [rel, v] of Object.entries(g.include || {})) await save(join(root, 'models', name, rel), v.url);
}
for (const name of TEXTURES) {
  const f = await (await fetch(`https://api.polyhaven.com/files/${name}`)).json();
  for (const [m, file] of [[f.Diffuse ? 'Diffuse' : 'col_1', 'diffuse'], ['nor_gl', 'nor_gl'], ['Rough', 'rough']]) if (f[m]) await save(join(root, 'tex3d', name, `${file}.jpg`), f[m]['1k'].jpg.url);
}

// music: "Once More With You" by Loyalty Freak Music (CC0), album Minimal Ambient Bounce
const src = join(root, 'audio', 'src', 'music.mp3'), out = join(root, 'audio', 'src', 'music.m4a');
await save(src, 'https://archive.org/download/LoyaltyFreakMusic-minimalAmbientBounce/Loyalty_Freak_Music_-_01_-_Once_more_with_you.mp3');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-vn', '-t', '90', '-c:a', 'aac', '-b:a', '192k', out]);
console.log('music ready:', out);
