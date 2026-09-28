// Tamlik Fit-out: the camera stands inside an empty flat and watches it being finished around it. Raw grey walls
// are painted from the ceiling down, the concrete floor flips over tile by tile to oak, a rug unrolls, the
// furniture drops into place, the pendants lower and switch on as the sunset fills the window.
// Real CC0 furniture from Poly Haven (assets/models), Three.js for the room, Anime.js for every move.
// animate() adds the motion to the master timeline at T (ms); render() draws the current state.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { stagger } from '../../vendor/anime.esm.min.js';
import { C } from '../brand.js';

const W = 4, D = 3, H = 3;                              // half width, half depth, ceiling height (m)
let renderer, scene, camera, canvas, root3;
const rig = { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0 };  // camera and its aim
let SHOT;                                               // [start, end] rig for this orientation
const U = { paint: { value: 0 } };                      // wall paint line, 0 = raw, 1 = painted to the floor
const light = { sun: 0.5, warm: 0, pend: 0, expo: 0.85 };
const pieces = [], tiles = [], pendants = [], accessories = [];
let rug;

const loading = [];                                    // every texture must arrive before the film starts (else it draws black)
const tex = (loader, path, repeat, srgb) => {
  const t = loader.load(path, undefined, undefined, () => console.warn('texture failed', path));
  loading.push(new Promise((res) => { const i = setInterval(() => { if (t.image && t.image.complete !== false) { clearInterval(i); res(); } }, 50); })); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};

export const fitout = {
  id: 'fitout', name: 'FIT-OUT', accent: C.brass, glow: 'rgba(217,183,121,.14)',
  tagline: 'We shape your <b>space</b>',
  full: true,                                           // full-bleed 3D instead of the 1000×1000 art box
  html: () => '<canvas class="room"></canvas><div class="shade top"></div><div class="shade bottom"></div>',

  async init(el, { portrait, record }) {
    canvas = el.querySelector('canvas.room');
    const Wpx = portrait ? 1080 : 1920, Hpx = portrait ? 1920 : 1080;
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: record });
    renderer.setPixelRatio(record ? devicePixelRatio : Math.min(devicePixelRatio, 1.5));   // recording supersamples
    renderer.setSize(Wpx, Hpx, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene();
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
    scene.background = new THREE.Color(0x0b0a09);
    camera = new THREE.PerspectiveCamera(portrait ? 64 : 42, Wpx / Hpx, 0.05, 60);
    root3 = new THREE.Group(); scene.add(root3);
    // portrait frames the sofa wall and the window; landscape takes in the whole room from the corner
    SHOT = portrait
      ? [{ x: 0.9, y: 1.52, z: 4.9, tx: -1.3, ty: 1.02, tz: -2.0 }, { x: 0.35, y: 1.42, z: 3.6, tx: -1.1, ty: 0.98, tz: -2.0 }]
      : [{ x: 3.3, y: 1.6, z: 4.7, tx: 1.5, ty: 0.95, tz: -1.8 }, { x: 2.7, y: 1.5, z: 3.7, tx: 1.35, ty: 0.95, tz: -1.7 }];
    Object.assign(rig, SHOT[0]);
    const tl = new THREE.TextureLoader();

    // --- the shell: walls painted from the ceiling down (shader line at uPaint), a ceiling, a window wall
    const wallMat = new THREE.MeshStandardMaterial({ map: tex(tl, 'assets/tex3d/plastered_wall/diffuse.jpg', 2, true),
      normalMap: tex(tl, 'assets/tex3d/plastered_wall/nor_gl.jpg', 2), roughness: 0.92 });
    wallMat.onBeforeCompile = (sh) => {
      sh.uniforms.uPaint = U.paint;
      sh.vertexShader = 'varying vec3 vWp;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = 'uniform float uPaint; varying vec3 vWp;\n' + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
        float edge = ${H + 0.2} - uPaint * ${H + 0.5};                         // the paint line moves down the wall
        float painted = smoothstep(edge - 0.04, edge + 0.04, vWp.y);
        vec3 raw = diffuseColor.rgb * vec3(0.46, 0.47, 0.49);
        vec3 fresh = mix(vec3(1.0), diffuseColor.rgb, 0.25) * vec3(0.96, 0.92, 0.86);
        diffuseColor.rgb = mix(raw, fresh, painted) + vec3(0.25, 0.2, 0.12) * exp(-pow((vWp.y - edge) / 0.03, 2.0)) * step(0.001, uPaint) * step(uPaint, 0.999);`);
    };
    const box = (w, h, d, x, y, z, m = wallMat) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.receiveShadow = true; b.castShadow = true; root3.add(b); return b; };
    box(2 * W, H, 0.2, 0, H / 2, -D - 0.1);                          // back wall
    box(0.2, H, 2 * D + 2, W + 0.1, H / 2, 0);                        // right wall
    // left wall: floor-to-ceiling glazing between z = -2.2 and 2.6, with a low sill and a header
    box(0.2, H, 0.8, -W - 0.1, H / 2, -D + 0.4);
    box(0.2, 0.12, 4.8, -W - 0.1, 0.06, 0.2); box(0.2, 0.35, 4.8, -W - 0.1, H - 0.175, 0.2);
    box(0.2, H, 1.6, -W - 0.1, H / 2, 3.4);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: 0.4, metalness: 0.6 });
    for (const z of [-2.2, -1.0, 0.2, 1.4, 2.6]) box(0.08, H - 0.47, 0.06, -W - 0.02, (H - 0.47) / 2 + 0.12, z, frameMat);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(4.8, H - 0.47), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0, transmission: 0, transparent: true, opacity: 0.08 }));
    glass.rotation.y = Math.PI / 2; glass.position.set(-W - 0.05, (H - 0.47) / 2 + 0.12, 0.2); root3.add(glass);
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(2 * W, 2 * D + 2), new THREE.MeshStandardMaterial({ color: 0xf1ede6, roughness: 0.95 }));
    ceiling.rotation.x = Math.PI / 2; ceiling.position.set(0, H, 1); root3.add(ceiling);
    const cove = new THREE.Mesh(new THREE.BoxGeometry(2 * W, 0.02, 0.06), new THREE.MeshBasicMaterial({ color: 0xffd9a0 }));   // warm cove strip
    cove.position.set(0, H - 0.08, -D + 0.05); root3.add(cove); fitout._cove = cove;

    // the view: a sunset over the city through the glazing
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), new THREE.ShaderMaterial({ depthWrite: false,
      uniforms: { uWarm: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float uWarm; varying vec2 vUv;
        float h(float x){ return fract(sin(x * 91.7) * 43758.5); }
        void main(){
          vec3 top = mix(vec3(0.10, 0.13, 0.22), vec3(0.16, 0.14, 0.26), uWarm), hor = mix(vec3(0.55, 0.52, 0.5), vec3(1.0, 0.58, 0.28), uWarm);
          vec3 c = mix(hor, top, smoothstep(0.34, 0.8, vUv.y));
          c += vec3(1.0, 0.7, 0.4) * uWarm * exp(-pow(length((vUv - vec2(0.42, 0.36)) * vec2(2.4, 5.0)), 2.0)) * 1.4;   // the sun
          float bx = floor(vUv.x * 60.0), sky = 0.30 + 0.07 * h(bx) + 0.05 * h(bx * 3.1) * step(0.7, h(bx + 9.0));
          if (vUv.y < sky) { c = mix(vec3(0.05, 0.05, 0.07), vec3(0.2, 0.12, 0.09), uWarm * 0.6);
            vec2 wv = fract(vec2(vUv.x * 240.0, vUv.y * 160.0)); c += vec3(1.0, 0.75, 0.4) * step(0.55, h(floor(vUv.x * 240.0) + floor(vUv.y * 160.0) * 7.0)) * step(0.35, wv.x) * step(0.4, wv.y) * 0.5 * uWarm; }
          gl_FragColor = vec4(c, 1.0);
        }` }));
    sky.rotation.y = Math.PI / 2; sky.position.set(-W - 6, 3.5, 0.2); root3.add(sky); fitout._sky = sky;

    // --- the floor: 1 m tiles, concrete on top, oak underneath; each flips over
    const concrete = [tex(tl, 'assets/tex3d/concrete_floor_02/diffuse.jpg', 1, true), tex(tl, 'assets/tex3d/concrete_floor_02/nor_gl.jpg', 1)];
    const oak = [tex(tl, 'assets/tex3d/wood_floor/diffuse.jpg', 1, true), tex(tl, 'assets/tex3d/wood_floor/nor_gl.jpg', 1), tex(tl, 'assets/tex3d/wood_floor/rough.jpg', 1)];
    const cMat = new THREE.MeshStandardMaterial({ map: concrete[0], normalMap: concrete[1], roughness: 0.9, color: 0x9a9a9a });
    const oMat = new THREE.MeshStandardMaterial({ map: oak[0], normalMap: oak[1], roughnessMap: oak[2], roughness: 1, envMapIntensity: 0.6 });
    for (let x = -W; x < W; x++) for (let z = -D; z < D + 2; z++) {
      const g = new THREE.Group(); g.position.set(x + 0.5, 0, z + 0.5);
      const top = new THREE.PlaneGeometry(1, 1), bot = new THREE.PlaneGeometry(1, 1);
      const scale = 0.5;                                              // world-anchored UVs: one texture across the tiles
      for (const [geo, flip] of [[top, 1], [bot, -1]]) {
        const uv = geo.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, (x + uv.getX(i)) * scale, (-(z + 1) + (flip > 0 ? uv.getY(i) : 1 - uv.getY(i))) * scale);
      }
      const a = new THREE.Mesh(top, cMat); a.rotation.x = -Math.PI / 2; a.receiveShadow = true;
      const b = new THREE.Mesh(bot, oMat); b.rotation.x = Math.PI / 2; b.receiveShadow = true;
      g.add(a, b); root3.add(g); tiles.push({ g, d: Math.hypot(x + 0.5 + W, z + 0.5) });   // flips spread from the window
    }
    tiles.sort((p, q) => p.d - q.d);

    // --- the rug unrolls from under the sofa
    const fab = tex(tl, 'assets/tex3d/hessian_230/diffuse.jpg', 5, true);   // a natural jute rug
    rug = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.012, 2.2), new THREE.MeshStandardMaterial({ map: fab, normalMap: tex(tl, 'assets/tex3d/hessian_230/nor_gl.jpg', 5), roughness: 1, color: 0xf2e6d0 }));
    rug.geometry.translate(0, 0.006, 1.1); rug.position.set(-0.2, 0.001, -2.0); rug.receiveShadow = true; root3.add(rug);

    // --- furniture: real models, seated on the floor (or on another piece), each drops in on its own
    const gl = new GLTFLoader(), models = {};
    const names = ['mid_century_lounge_chair', 'modern_arm_chair_01', 'modern_coffee_table_01', 'side_table_01', 
      'modern_ceiling_lamp_01', 'modern_wooden_cabinet', 'potted_plant_01', 'potted_plant_02', 'potted_plant_04',
      'brass_vase_01', 'ceramic_vase_02', 'throw_pillows_01', 'standing_picture_frame_02'];
    await Promise.all(names.map(async (n) => { models[n] = (await gl.loadAsync(`assets/models/${n}/${n}.gltf`)).scene; }));
    const place = (n, x, z, ry = 0, s = 1, list = pieces, y = 0) => {
      const o = models[n].clone(true); o.scale.setScalar(s); o.rotation.y = ry;
      o.traverse((m) => { if (m.isMesh) { m.castShadow = m.receiveShadow = true; } });
      const holder = new THREE.Group(); holder.add(o);
      const bb = new THREE.Box3().setFromObject(o); o.position.y -= bb.min.y;               // seat it on its base
      holder.position.set(x, y, z); holder.userData.y = y; root3.add(holder); list.push(holder); return holder;
    };
    const top = (h) => new THREE.Box3().setFromObject(h).max.y;
    // a modern low sectional in warm grey wool (Poly Haven only has classic sofas): seat cushions, back cushions, a chaise
    const boucle = new THREE.MeshStandardMaterial({ map: tex(tl, 'assets/tex3d/poly_wool_herringbone/diffuse.jpg', 3, true),
      normalMap: tex(tl, 'assets/tex3d/poly_wool_herringbone/nor_gl.jpg', 3), roughness: 1, color: 0xf6ece0 });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1b1a19, roughness: 0.35, metalness: 0.8 });
    const sofaG = new THREE.Group();
    const rb = (w, h, d, x, y, z, m = boucle, r = 0.06) => { const b = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; sofaG.add(b); };
    rb(2.9, 0.2, 0.98, 0, 0.2, 0, boucle, 0.05);                                    // base
    rb(0.95, 0.2, 1.7, 0.975, 0.2, 0.36, boucle, 0.05);                              // chaise base
    for (const x of [-1.0, -0.02]) rb(0.96, 0.17, 0.82, x, 0.385, 0.06, boucle, 0.07);   // seat cushions
    rb(0.93, 0.17, 1.58, 0.975, 0.385, 0.42, boucle, 0.07);                          // chaise cushion
    for (const x of [-1.0, -0.02, 0.96]) rb(0.95, 0.46, 0.24, x, 0.62, -0.37, boucle, 0.09);   // back cushions
    rb(0.22, 0.52, 0.98, -1.55, 0.36, 0, boucle, 0.08);                              // arm
    for (const [x, z] of [[-1.5, -0.4], [-1.5, 0.4], [1.35, -0.4], [1.35, 1.12], [0.55, 1.12]]) {
      const l = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.012, 0.1, 8), legMat); l.position.set(x, 0.05, z); sofaG.add(l);
    }
    const sofa = new THREE.Group(); sofa.add(sofaG); sofa.position.set(-0.3, 0, -2.45); sofa.userData.y = 0; root3.add(sofa); pieces.unshift(sofa);
    place('modern_coffee_table_01', -0.2, -0.95, Math.PI / 2, 1.05);
    place('mid_century_lounge_chair', -2.05, -0.55, Math.PI * 0.62);
    place('modern_arm_chair_01', 1.75, -0.7, -Math.PI * 0.55);
    place('side_table_01', 1.25, -2.5, 0);
    const sideboard = place('modern_wooden_cabinet', 2.0, -2.62, 0, 0.62);
    place('potted_plant_01', -3.45, -2.45, 0.4, 1.25);
    place('potted_plant_02', 3.45, -1.2, 1.1, 1.3);
    place('potted_plant_01', -3.4, 1.9, 2.1, 1.05);
    for (const [x, z] of [[-0.2, -0.95], [-2.2, -0.55]]) {
      const p = place('modern_ceiling_lamp_01', x, z, 0, 1.2, pendants, H);                 // hung from the ceiling
      const b = new THREE.Box3().setFromObject(p); p.children[0].position.y -= b.max.y - b.min.y;
      p.userData.y = H; const L = new THREE.PointLight(0xffc27a, 0, 7, 1.6); L.position.set(0, -1.05, 0); L.castShadow = false; p.add(L); p.userData.light = L;
    }
    // accessories, on top of their furniture
    place('throw_pillows_01', -0.9, -2.5, 0, 0.9, accessories, 0.45);
    place('brass_vase_01', -0.25, -0.85, 0, 0.55, accessories, 0.4);
    place('ceramic_vase_02', 1.35, -2.62, 0, 1, accessories, top(sideboard));
    place('standing_picture_frame_02', 2.7, -2.7, -0.3, 2.2, accessories, top(sideboard));
    place('potted_plant_04', 1.25, -2.5, 0, 1.2, accessories, 0.55);

    // two framed prints of the Tamlik tower above the sofa (stills from the tower film)
    for (const [x, img] of [[-1.05, 'film_0.4'], [0.45, 'film_0.88']]) {
      const art = new THREE.Group(); art.position.set(x, 1.72, -D + 0.03);
      const fr = new THREE.Mesh(new THREE.BoxGeometry(1.14, 1.14, 0.04), new THREE.MeshStandardMaterial({ color: 0x151412, roughness: 0.5 }));
      const mat = new THREE.Mesh(new THREE.PlaneGeometry(1.06, 1.06), new THREE.MeshStandardMaterial({ color: 0xf3efe8, roughness: 0.9 }));
      const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.86), new THREE.MeshStandardMaterial({ map: tex(tl, 'assets/posts/' + img + '.jpg', 1, true), roughness: 0.6 }));
      fr.position.z = 0.02; mat.position.z = 0.041; pic.position.z = 0.042; fr.castShadow = true;
      art.add(fr, mat, pic); art.userData.y = 1.72; root3.add(art); accessories.push(art);
    }
    const skirt = new THREE.MeshStandardMaterial({ color: 0xe9e4dc, roughness: 0.6 });
    box(2 * W, 0.1, 0.02, 0, 0.05, -D + 0.01, skirt); box(0.02, 0.1, 2 * D + 2, W - 0.01, 0.05, 0, skirt);
    const sub = new THREE.Mesh(new THREE.PlaneGeometry(2 * W, 2 * D + 2), new THREE.MeshStandardMaterial({ color: 0x2b2926, roughness: 1 }));
    sub.rotation.x = -Math.PI / 2; sub.position.set(0, -0.03, 1); root3.add(sub);

    // --- light: a cool fill for the bare shell, the setting sun through the glass, pendants later
    fitout._hemi = new THREE.HemisphereLight(0xdfe6ff, 0x3a3128, 0.5); scene.add(fitout._hemi);
    const sun = new THREE.DirectionalLight(0xffb070, 0); sun.position.set(-12, 5.5, 2.5); sun.target.position.set(0, 0, -0.5);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
    Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
    scene.add(sun, sun.target); fitout._sun = sun;
    await Promise.all(loading);
    renderer.compile(scene, camera);
  },

  // ~14 s: paint, floor, rug, furniture, pendants and light, accessories; the camera drifts through it all
  animate(tl, el, T) {
    const hide = (list) => list.forEach((p) => { p.scale.setScalar(0.001); p.visible = false; });
    // start state: bare shell (everything is set at time 0 so the loop always restarts clean)
    tl.set(U.paint, { value: 0 }, 0).set(light, { sun: 0.5, warm: 0, pend: 0, expo: 0.85 }, 0)
      .set(rig, { ...SHOT[0] }, 0)
      .set(rug.scale, { z: 0.001 }, 0)
      .set(tiles.map((t) => t.g.rotation), { x: 0 }, 0).set(tiles.map((t) => t.g.position), { y: 0 }, 0)
      .call(() => { hide(pieces); hide(pendants); hide(accessories); }, 0);

    // the camera: a slow dolly in with a gentle pan, the whole shot
    tl.add(rig, { ...Object.fromEntries(Object.keys(SHOT[0]).map((k) => [k, [SHOT[0][k], SHOT[1][k]]])), duration: 15000, ease: 'inOutSine' }, T - 600);
    // 1. paint runs down the walls
    tl.add(U.paint, { value: [0, 1], duration: 2600, ease: 'inOutSine' }, T + 700);
    // 2. the floor flips from concrete to oak, starting at the window
    tiles.forEach((t, i) => {
      tl.add(t.g.rotation, { x: [0, Math.PI], duration: 520, ease: 'inOutQuad' }, T + 2500 + i * 34)
        .add(t.g.position, { y: [0, 0.35, 0], duration: 520, ease: 'inOutSine' }, T + 2500 + i * 34);
    });
    // 3. the rug unrolls
    tl.add(rug.scale, { z: [0.001, 1], duration: 900, ease: 'outCubic' }, T + 4700);
    // 4. furniture drops into place, one piece after another
    pieces.forEach((p, i) => {
      const at = T + 5200 + i * 230;
      tl.call(() => { p.visible = true; }, at)
        .add(p.scale, { x: [0.6, 1], y: [0.6, 1], z: [0.6, 1], duration: 650, ease: 'outBack(1.6)' }, at)
        .add(p.position, { y: [p.userData.y + 1.6, p.userData.y], duration: 750, ease: 'outBounce' }, at);
    });
    // 5. the pendants lower from the ceiling and switch on; the sun warms the room
    pendants.forEach((p, i) => {
      const at = T + 8600 + i * 250;
      tl.call(() => { p.visible = true; }, at)
        .add(p.scale, { x: [1, 1], y: [1, 1], z: [1, 1], duration: 1 }, at)
        .add(p.position, { y: [H + 1.4, H], duration: 900, ease: 'outCubic' }, at);
    });
    tl.add(light, { pend: [0, 1, 0.3, 1], duration: 700, ease: 'linear' }, T + 9700)
      .add(light, { sun: [0.5, 2.6], warm: [0, 1], expo: [0.85, 1.12], duration: 4000, ease: 'inOutSine' }, T + 6000);
    // 6. the finishing touches pop onto the surfaces
    accessories.forEach((p, i) => {
      const at = T + 10300 + i * 170;
      tl.call(() => { p.visible = true; }, at).add(p.scale, { x: [0.001, 1], y: [0.001, 1], z: [0.001, 1], duration: 600, ease: 'outBack(2.2)' }, at);
    });
    // visibility flags are not interpolated, so re-apply them when the timeline is scrubbed backwards
    tl.call(() => { pieces.forEach((p) => { p.visible = true; }); pendants.forEach((p) => { p.visible = true; }); accessories.forEach((p) => { p.visible = true; }); }, T + 13200);
    return { tagAt: T + 10500 };
  },

  // draw the current state (called every frame while the scene is on screen, and after every recorder seek)
  render() {
    if (!renderer) return;
    camera.position.set(rig.x, rig.y, rig.z); camera.lookAt(rig.tx, rig.ty, rig.tz);
    fitout._sun.intensity = light.sun; fitout._sun.color.setRGB(1, 0.62 + 0.1 * (1 - light.warm), 0.38 + 0.3 * (1 - light.warm));
    fitout._hemi.intensity = 0.55 - 0.15 * light.warm; fitout._hemi.color.setRGB(0.87 + 0.13 * light.warm, 0.9, 1 - 0.18 * light.warm);
    fitout._sky.material.uniforms.uWarm.value = light.warm;
    fitout._cove.material.color.setRGB(1, 0.85, 0.63).multiplyScalar(0.15 + 1.6 * light.pend);
    for (const p of pendants) p.userData.light.intensity = 9 * light.pend;
    renderer.toneMappingExposure = light.expo;
    renderer.render(scene, camera);
  },
};
