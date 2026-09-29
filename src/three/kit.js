// Shared 3D kit for the department scenes: a renderer with film-like finishing (ACES tone mapping, soft shadows,
// multisampled edges, a gentle bloom on lights, ambient occlusion when recording), studio reflections from a real
// HDR, and loaders that remember everything they fetch so a scene only starts once every asset has arrived.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export { THREE };
const pending = [];
const texLoader = new THREE.TextureLoader(), gltf = new GLTFLoader(), rgbe = new RGBELoader();
const texCache = new Map(), modelCache = new Map(), hdrCache = new Map();

// a tiled texture (cached per path + repeat)
export function tex(path, repeat = 1, srgb = false) {
  const key = path + '|' + repeat;
  if (texCache.has(key)) return texCache.get(key);
  const t = texLoader.load(path);
  pending.push(new Promise((res) => { const i = setInterval(() => { if (t.image && t.image.complete !== false) { clearInterval(i); res(); } }, 40); }));
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, t); return t;
}
// a Poly Haven model (assets/models/<name>): returns a fresh copy, shadows on, sitting on its own base (y = 0)
export async function model(name) {
  if (!modelCache.has(name)) modelCache.set(name, gltf.loadAsync(`assets/models/${name}/${name}.gltf`).then((g) => g.scene));
  const o = (await modelCache.get(name)).clone(true);
  o.traverse((m) => { if (m.isMesh) { m.castShadow = m.receiveShadow = true; } });
  return o;
}
// wrap an object in a holder whose origin is the centre of its base: rotate / scale / drop it cleanly
export function seat(o, s = 1) {
  o.scale.multiplyScalar(s);
  const b = new THREE.Box3().setFromObject(o), c = b.getCenter(new THREE.Vector3());
  o.position.x -= c.x; o.position.z -= c.z; o.position.y -= b.min.y;
  const h = new THREE.Group(); h.add(o); return h;
}
export const topOf = (o) => new THREE.Box3().setFromObject(o).max.y;
export const ready = () => Promise.all(pending);

async function hdr(name) {
  if (!hdrCache.has(name)) hdrCache.set(name, rgbe.loadAsync(`assets/hdr/${name}.hdr`));
  return hdrCache.get(name);
}

// a renderer + composer for one scene canvas
export async function makeView(canvas, { portrait, record, fov = [62, 40], env = 'studio_small_09', envIntensity = 1, bloom = 0.35 }) {
  const W = portrait ? 1080 : 1920, H = portrait ? 1920 : 1080;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: record });
  const pr = record ? devicePixelRatio : Math.min(devicePixelRatio, 1.5);
  renderer.setPixelRatio(pr); renderer.setSize(W, H, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromEquirectangular(await hdr(env)).texture;
  scene.environmentIntensity = envIntensity;
  const camera = new THREE.PerspectiveCamera(portrait ? fov[0] : fov[1], W / H, 0.05, 80);

  // finishing: multisampled render target, AO for the recorded film, a soft bloom on bright lamps
  const rt = new THREE.WebGLRenderTarget(W * pr, H * pr, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.setPixelRatio(pr); composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, camera));
  if (record) {
    const ao = new GTAOPass(scene, camera, W * pr, H * pr);
    ao.updateGtaoMaterial({ radius: 0.5, distanceExponent: 1.6, thickness: 1.2, scale: 1.0, samples: 16 });
    ao.blendIntensity = 0.8; composer.addPass(ao);
  }
  const bl = new UnrealBloomPass(new THREE.Vector2(W, H), bloom, 0.28, 1.0);   // only the brightest points glow
  composer.addPass(bl);
  composer.addPass(new OutputPass());
  return { renderer, scene, camera, composer, bloom: bl, W, H, render: () => composer.render() };
}

// a camera rig: position + aim, both animatable plain objects
export const rig = (a) => ({ ...a });
export function aim(camera, r) { camera.position.set(r.x, r.y, r.z); camera.lookAt(r.tx, r.ty, r.tz); }
// animate a rig through a shot: [start, end] objects with the same keys
export const shotTween = (s0, s1) => Object.fromEntries(Object.keys(s0).map((k) => [k, [s0[k], s1[k]]]));

// a flat canvas texture drawn by a function (labels, UI on screens, check marks)
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const redraw = (...a) => { const x = c.getContext('2d'); x.clearRect(0, 0, w, h); draw(x, w, h, ...a); t.needsUpdate = true; };
  redraw(); t.userData.redraw = redraw; return t;
}

// the Tamlik green: a glowing ring hologram and a check mark, used to mark and confirm each repair
export const GREEN = new THREE.Color(0x19d67a);
export function holoRing(r = 0.35) {
  const g = new THREE.Group();
  const m = new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.9, depthWrite: false, toneMapped: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 64), m); g.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(r * 1.25, 0.006, 8, 64), m.clone()); g.add(ring2);
  const tick = canvasTex(256, 256, (x, w, h) => {
    x.strokeStyle = '#3dff9c'; x.lineWidth = 22; x.lineCap = x.lineJoin = 'round'; x.shadowColor = '#19d67a'; x.shadowBlur = 24;
    x.beginPath(); x.moveTo(w * 0.26, h * 0.53); x.lineTo(w * 0.44, h * 0.7); x.lineTo(w * 0.76, h * 0.32); x.stroke();
  });
  const check = new THREE.Mesh(new THREE.PlaneGeometry(r * 1.3, r * 1.3), new THREE.MeshBasicMaterial({ map: tick, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
  g.add(check);
  g.userData = { ring, ring2, check };
  return g;
}
