// Tamlik Maintenance: an apartment with real problems, and the Tamlik team fixing them.
// A broken pendant sparks and flickers, water drips from a stained ceiling into a bucket, a wall is cracked open
// to the bricks with rubble below, grime everywhere, cold dim light. Green rings diagnose each fault, the
// tools arrive, and a green scan line (the roof stroke of the Tamlik logo) sweeps the room: rubble flies back
// into the wall and seals, the lamp swings straight and lights, the leak stops and the puddle dries, the walls
// come up clean, and the room turns warm. animate() adds the motion at T (ms); render() draws the current state.
import { THREE, tex, model, seat, ready, makeView, aim, shotTween, canvasTex, holoRing, GREEN } from '../three/kit.js';
import { stagger } from '../../vendor/anime.esm.min.js';
import { C } from '../brand.js';

const HW = 3.5, HD = 2.75, H = 2.9;                  // half width, half depth, ceiling
let V, SHOT;
const rig = {};
const S = { dirt: 1, warm: 0, flick: 0.15, lamp: 0, scan: -4.2, scanOn: 0, spark: 0, sparkOn: 1, swing: 0, win: 0.35, expo: 0.62 };
const U = { dirt: { value: 1 } };
const F = {};                                          // the faults and their parts
const holos = [], tools = [], debris = [], drips = [], ripples = [];

// grime on walls, floor and ceiling (world-space value noise), cleaned off as uDirt goes to 0
function grime(mat) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uDirt = U.dirt;
    sh.vertexShader = 'varying vec3 vWp;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = `uniform float uDirt; varying vec3 vWp;
      float hsh(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
      float vn(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(hsh(i), hsh(i + vec3(1,0,0)), f.x), mix(hsh(i + vec3(0,1,0)), hsh(i + vec3(1,1,0)), f.x), f.y),
                   mix(mix(hsh(i + vec3(0,0,1)), hsh(i + vec3(1,0,1)), f.x), mix(hsh(i + vec3(0,1,1)), hsh(i + vec3(1,1,1)), f.x), f.y), f.z); }
      ` + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
        float gN = vn(vWp * 2.3) * 0.6 + vn(vWp * 7.0) * 0.4;
        float streak = smoothstep(0.55, 0.9, vn(vec3(vWp.x * 6.0, vWp.y * 0.6, vWp.z * 6.0)));
        diffuseColor.rgb *= mix(vec3(1.0), vec3(0.78, 0.74, 0.66) * (0.72 + 0.35 * gN) - streak * 0.12, uDirt);`);
  };
  return mat;
}

// the damage on the back wall, painted into a canvas: a hole down to the bricks, peeled plaster, long cracks
function damageTexture() {
  const brick = new Image(); brick.src = 'assets/tex3d/red_brick_03/diffuse.jpg';
  const t = canvasTex(1536, 1280, (x, w, h) => {
    const rnd = (() => { let s = 11; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    const cx = w * 0.5, cy = h * 0.5;
    // an irregular but natural outline: a sum of slow waves plus small chips
    const outline = (R, jag) => { const p = []; for (let i = 0; i < 90; i++) { const a = i / 90 * Math.PI * 2;
      const r = R * (1 + 0.16 * Math.sin(a * 3 + 1.1) + 0.1 * Math.sin(a * 5 + 2.3) + 0.06 * Math.sin(a * 9) + jag * (rnd() - 0.5));
      p.push([cx + Math.cos(a) * r * 1.2, cy + Math.sin(a) * r * 0.9]); } return p; };
    const path = (p) => { x.beginPath(); p.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); };
    // a dirty, water-marked halo around the damage
    const halo = x.createRadialGradient(cx, cy, 120, cx, cy, 620); halo.addColorStop(0, 'rgba(70,58,44,.35)'); halo.addColorStop(1, 'rgba(70,58,44,0)');
    x.fillStyle = halo; x.fillRect(0, 0, w, h);
    // long cracks running out across the wall: dark hairline with a lit lower edge (so they read as depth)
    for (let k = 0; k < 11; k++) {
      let a = k / 11 * Math.PI * 2 + rnd() * 0.4, px = cx + Math.cos(a) * 250, py = cy + Math.sin(a) * 190, lw = 6;
      const seg = [[px, py]];
      for (let s = 0; s < 16; s++) { a += (rnd() - 0.5) * 0.7; px += Math.cos(a) * 30; py += Math.sin(a) * 30; seg.push([px, py]); }
      for (const [off, col] of [[2, 'rgba(235,228,215,.55)'], [0, 'rgba(24,19,15,.9)']]) {
        let lwi = lw; x.strokeStyle = col; x.lineCap = 'round';
        for (let s = 1; s < seg.length; s++) { x.lineWidth = Math.max(1, lwi * (off ? 0.6 : 1)); x.beginPath(); x.moveTo(seg[s - 1][0], seg[s - 1][1] + off); x.lineTo(seg[s][0], seg[s][1] + off); x.stroke(); lwi *= 0.86; }
      }
    }
    // peeled plaster around the hole: a rough, paler band
    const outer = outline(300, 0.08), inner = outline(220, 0.14);
    path(outer); x.fillStyle = '#b9ad99'; x.fill();
    x.lineWidth = 3; x.strokeStyle = 'rgba(60,50,40,.55)'; x.stroke();
    // the hole itself: bricks, in shadow at the edges
    x.save(); path(inner); x.clip();
    if (brick.complete && brick.naturalWidth) x.drawImage(brick, 0, 0, w, w * brick.naturalHeight / brick.naturalWidth); else { x.fillStyle = '#6b3a2a'; x.fillRect(0, 0, w, h); }
    const g = x.createRadialGradient(cx, cy, 40, cx, cy, 300); g.addColorStop(0, 'rgba(0,0,0,.1)'); g.addColorStop(0.7, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,.85)');
    x.fillStyle = g; x.fillRect(0, 0, w, h); x.restore();
    path(inner); x.lineWidth = 7; x.strokeStyle = 'rgba(225,216,200,.85)'; x.stroke();
  });
  brick.onload = () => t.userData.redraw();
  return t;
}
// a water stain on the ceiling: pale, spreading tide marks
const stainTexture = () => canvasTex(512, 512, (x, w, h) => {
  for (let i = 0; i < 4; i++) {
    const r = 235 - i * 45;
    const g = x.createRadialGradient(w / 2, h / 2, r * 0.2, w / 2, h / 2, r);
    g.addColorStop(0, 'rgba(150,118,70,.10)'); g.addColorStop(0.82, 'rgba(150,115,65,.12)'); g.addColorStop(0.93, 'rgba(120,88,45,.38)'); g.addColorStop(1, 'rgba(120,88,45,0)');
    x.fillStyle = g; x.beginPath(); x.ellipse(w / 2 + i * 6, h / 2 - i * 4, r, r * 0.86, i * 0.7, 0, Math.PI * 2); x.fill();
  }
});

export const maintenance = {
  id: 'maintenance', name: 'MAINTENANCE', accent: C.greenText, glow: 'rgba(1,166,82,.16)',
  tagline: 'We keep it <b>perfect</b>',
  full: true,
  html: () => '<canvas class="room"></canvas><div class="shade top"></div><div class="shade bottom"></div>',

  async init(el, { portrait, record }) {
    V = await makeView(el.querySelector('canvas.room'), { portrait, record, env: 'lebombo', envIntensity: 0.35, bloom: 0.18 });
    const { scene } = V;
    scene.background = new THREE.Color(0x07080a);
    SHOT = portrait
      ? [{ x: 0.7, y: 1.4, z: 4.9, tx: -0.15, ty: 1.12, tz: -2.2 }, { x: 0.3, y: 1.35, z: 3.7, tx: -0.1, ty: 1.15, tz: -2.2 }]
      : [{ x: 1.6, y: 1.6, z: 4.7, tx: 1.55, ty: 1.2, tz: -2.0 }, { x: 1.0, y: 1.5, z: 3.6, tx: 1.35, ty: 1.25, tz: -2.0 }];
    Object.assign(rig, SHOT[0]);

    // --- the room: grimy plaster walls, an oak floor, a window on the left wall
    const wallMat = grime(new THREE.MeshStandardMaterial({ map: tex('assets/tex3d/plastered_wall/diffuse.jpg', 2, true), normalMap: tex('assets/tex3d/plastered_wall/nor_gl.jpg', 2), roughness: 0.93, color: 0xf2ece2 }));
    const floorMat = grime(new THREE.MeshStandardMaterial({ map: tex('assets/tex3d/wood_floor/diffuse.jpg', 3, true), normalMap: tex('assets/tex3d/wood_floor/nor_gl.jpg', 3), roughnessMap: tex('assets/tex3d/wood_floor/rough.jpg', 3), roughness: 1 }));
    const box = (w, h, d, x, y, z, m = wallMat) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.receiveShadow = b.castShadow = true; scene.add(b); return b; };
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(2 * HW, 2 * HD + 3), floorMat); floor.rotation.x = -Math.PI / 2; floor.position.z = 1.5; floor.receiveShadow = true; scene.add(floor);
    box(2 * HW, H, 0.2, 0, H / 2, -HD - 0.1);                                  // back wall
    box(0.2, H, 2 * HD + 3, HW + 0.1, H / 2, 1.5);                              // right wall
    box(0.2, 0.95, 2.2, -HW - 0.1, 0.475, -0.8); box(0.2, 0.55, 2.2, -HW - 0.1, H - 0.275, -0.8);   // left wall around the window
    box(0.2, H, HD - 1.9 + 0.001, -HW - 0.1, H / 2, -HD + (HD - 1.9) / 2); box(0.2, H, 4.6, -HW - 0.1, H / 2, 2.6);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(2 * HW, 2 * HD + 3), grime(new THREE.MeshStandardMaterial({ color: 0xefebe4, roughness: 0.95 })));
    ceil.rotation.x = Math.PI / 2; ceil.position.set(0, H, 1.5); scene.add(ceil);
    const skirt = new THREE.MeshStandardMaterial({ color: 0xe6e0d6, roughness: 0.6 });
    box(2 * HW, 0.09, 0.02, 0, 0.045, -HD + 0.01, skirt); box(0.02, 0.09, 2 * HD + 3, HW - 0.01, 0.045, 1.5, skirt);
    // window: frame, glass, a pale sky behind
    const frame = new THREE.MeshStandardMaterial({ color: 0xdedad2, roughness: 0.5 });
    for (const [y, h] of [[0.97, 0.05], [2.33, 0.05]]) box(0.12, h, 2.2, -HW - 0.02, y, -0.8, frame);
    for (const z of [-1.88, -0.8, 0.28]) box(0.12, 1.4, 0.05, -HW - 0.02, 1.65, z, frame);
    F.sky = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), new THREE.MeshBasicMaterial({ color: 0xbfd2e6, toneMapped: false }));
    F.sky.rotation.y = Math.PI / 2; F.sky.position.set(-HW - 2.5, 1.8, -0.8); scene.add(F.sky);

    // --- furniture: an armchair by the window, a side table and plant, a long cabinet
    const put = async (name, x, z, ry = 0, s = 1, y = 0) => { const h = seat(await model(name), s); h.position.set(x, y, z); h.rotation.y = ry; scene.add(h); return h; };
    await put('modern_arm_chair_01', -2.5, -1.3, 0.55);
    await put('side_table_01', -2.6, -2.25, 0.2);
    await put('potted_plant_02', -2.6, -2.25, 0, 0.62, 0.55);
    await put('modern_wooden_cabinet', 2.25, -2.5, 0, 0.5);
    await put('ceramic_vase_03', 1.7, -2.5, 0, 1, 0.34);
    await put('potted_plant_01', 3.0, -1.4, 1.4, 1.1);

    // --- fault 1: the wall, cracked open to the bricks, rubble on the floor
    const HX = -1.3, HY = 1.25;
    F.damage = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.0), new THREE.MeshStandardMaterial({ map: damageTexture(), transparent: true, roughness: 0.95, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    F.damage.position.set(HX, HY, -HD + 0.002); scene.add(F.damage);
    const chunkMat = new THREE.MeshStandardMaterial({ color: 0xcfc6b8, roughness: 0.95 }), brickMat = new THREE.MeshStandardMaterial({ color: 0x8a4a34, roughness: 0.9 });
    let sd = 3; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 22; i++) {
      const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.025 + rnd() * 0.05, 0), i % 4 ? chunkMat : brickMat);
      m.scale.set(1 + rnd(), 0.6 + rnd() * 0.5, 1 + rnd()); m.castShadow = true;
      const home = new THREE.Vector3(HX + (rnd() - 0.5) * 0.9, 0.03, -HD + 0.12 + rnd() * 0.55);
      const wall = new THREE.Vector3(HX + (rnd() - 0.5) * 0.7, HY + (rnd() - 0.5) * 0.5, -HD + 0.02);
      m.position.copy(home); m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); scene.add(m); debris.push({ m, home, wall });
    }

    // --- fault 2: the broken pendant, hanging crooked, sparking, flickering
    const LX = 0.05, LZ = -0.9;
    F.lampPivot = new THREE.Group(); F.lampPivot.position.set(LX, H, LZ); scene.add(F.lampPivot);
    const lamp = seat(await model('modern_ceiling_lamp_01'), 1.15);
    const lb = new THREE.Box3().setFromObject(lamp); lamp.position.y = -(lb.max.y - lb.min.y); F.lampPivot.add(lamp);
    F.bulb = new THREE.PointLight(0xffc98a, 0, 9, 1.6); F.bulb.position.set(0, -(lb.max.y - lb.min.y) + 0.12, 0); F.bulb.castShadow = true; F.bulb.shadow.mapSize.set(1024, 1024); F.bulb.shadow.bias = -0.002;
    F.lampPivot.add(F.bulb);
    F.glowBulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd7a0, toneMapped: false }));
    F.glowBulb.position.copy(F.bulb.position); F.lampPivot.add(F.glowBulb);
    // sparks: a burst of hot points (positions computed in the shader from seeded velocities)
    const N = 70, sp = new Float32Array(N * 3), vel = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const a = rnd() * Math.PI * 2, u = rnd(); vel.set([Math.cos(a) * (0.4 + u), 0.2 + rnd() * 1.4, Math.sin(a) * (0.4 + u)], i * 3); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); sg.setAttribute('vel', new THREE.BufferAttribute(vel, 3));
    F.sparkU = { uT: { value: 0 }, uOn: { value: 1 } };
    F.sparks = new THREE.Points(sg, new THREE.ShaderMaterial({ uniforms: F.sparkU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute vec3 vel; uniform float uT; varying float vA;
        void main(){ vec3 p = position + vel * uT * 0.9 + vec3(0.0, -2.6, 0.0) * uT * uT; vA = (1.0 - uT);
          vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = (3.0 + 5.0 * vA) * (4.0 / -mv.z); }`,
      fragmentShader: `uniform float uOn; varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
          gl_FragColor = vec4(vec3(1.0, 0.72, 0.32) * 3.0, (1.0 - d * 2.0) * vA * uOn); }` }));
    F.sparks.position.copy(F.bulb.position); F.sparks.frustumCulled = false; F.lampPivot.add(F.sparks);

    // --- fault 3: the leak: a stain on the ceiling, drips into a bucket, a puddle
    const WX = 1.05, WZ = -1.25;
    F.stain = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), new THREE.MeshStandardMaterial({ map: stainTexture(), roughness: 1, transparent: true, depthWrite: false }));
    F.stain.rotation.x = Math.PI / 2; F.stain.position.set(WX, H - 0.004, WZ); scene.add(F.stain);
    F.bucket = seat(await model('wooden_bucket_02'), 0.62); F.bucket.position.set(WX, 0, WZ); scene.add(F.bucket);
    const water = new THREE.MeshPhysicalMaterial({ color: 0x7e8f9b, roughness: 0.02, metalness: 0.1, transparent: true, opacity: 0.6, clearcoat: 1, envMapIntensity: 1.3 });
    F.puddle = new THREE.Mesh(new THREE.CircleGeometry(0.62, 48), water); F.puddle.rotation.x = -Math.PI / 2; F.puddle.position.set(WX + 0.42, 0.004, WZ + 0.38); F.puddle.scale.set(1.3, 0.85, 1); scene.add(F.puddle);
    const dropGeo = new THREE.SphereGeometry(0.03, 14, 10); dropGeo.scale(1, 1.7, 1);
    for (let i = 0; i < 3; i++) { const d = new THREE.Mesh(dropGeo, water.clone()); d.material.opacity = 0.85; d.position.set(WX + (i - 1) * 0.02, H - 0.02, WZ); scene.add(d); drips.push(d); }
    // a thin trickle running from the stain into the bucket
    F.stream = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.009, H - 0.33, 10, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xcfe3f0, roughness: 0.02, transparent: true, opacity: 0.55, envMapIntensity: 1.6 }));
    F.stream.geometry.translate(0, -(H - 0.33) / 2, 0); F.stream.position.set(WX + 0.03, H, WZ); scene.add(F.stream);
    for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.028, 32), new THREE.MeshBasicMaterial({ color: 0xdfefff, transparent: true, opacity: 0, depthWrite: false }));
      r.rotation.x = -Math.PI / 2; r.position.set(WX, 0.25, WZ); scene.add(r); ripples.push(r); }

    // --- the repair kit arrives: ladder under the lamp, toolbox, drill, wrench
    const kit = async (name, x, z, ry, s = 1, y = 0, rx = 0) => { const h = seat(await model(name), s); h.position.set(x, y, z); h.rotation.set(rx, ry, 0); h.userData.y = y; scene.add(h); tools.push(h); return h; };
    await kit('ladder_sectioned_01', 0.75, -1.6, -0.35, 1.0, 0, -0.22);
    const tb = await kit('metal_toolbox', -0.35, 0.35, 0.4, 1.1);
    await kit('Drill_01', -0.3, 0.33, 1.2, 1.2, 0.24);
    await kit('adjustable_wrench', 0.05, 0.62, 0.9, 1.3, 0.01, -Math.PI / 2);
    await kit('cardboard_box_01', 2.2, -1.2, 0.3, 0.9);

    // --- diagnosis rings at each fault, and the green scan line
    for (const [x, y, z] of [[HX, HY, -HD + 0.25], [LX, 2.05, LZ], [WX, 1.2, WZ]]) { const h = holoRing(0.32); h.position.set(x, y, z); scene.add(h); holos.push(h); }
    F.scan = new THREE.Mesh(new THREE.PlaneGeometry(0.05, H), new THREE.MeshBasicMaterial({ color: 0x5dffb0, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
    F.scan.rotation.y = Math.PI / 2; F.scan.scale.x = 1;
    const scanWall = new THREE.Mesh(new THREE.PlaneGeometry(2 * HD + 1, H), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, blending: THREE.AdditiveBlending }));
    scanWall.rotation.y = Math.PI / 2; scanWall.position.set(0, H / 2, 0);
    F.scanG = new THREE.Group(); F.scanG.add(scanWall); scene.add(F.scanG);
    for (const [y, z] of [[0.01, 0], [H - 0.01, 0]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 2 * HD + 1), new THREE.MeshBasicMaterial({ color: 0x7dffc2, toneMapped: false })); l.position.set(0, y, z); F.scanG.add(l); }
    const bk = new THREE.Mesh(new THREE.BoxGeometry(0.02, H, 0.02), new THREE.MeshBasicMaterial({ color: 0x7dffc2, toneMapped: false })); bk.position.set(0, H / 2, -HD + 0.02); F.scanG.add(bk);
    F.scanLight = new THREE.PointLight(0x39ff9a, 0, 5, 1.5); F.scanLight.position.set(0, 1.4, -1); F.scanG.add(F.scanLight);

    // --- light: cold dim daylight from the window; the room fill warms once it's fixed
    F.hemi = new THREE.HemisphereLight(0xcfd9ea, 0x2b2621, 0.4); scene.add(F.hemi);
    F.sun = new THREE.DirectionalLight(0xdce8ff, 1.1); F.sun.position.set(-9, 4.5, -0.5); F.sun.target.position.set(0, 0, -0.8);
    F.sun.castShadow = true; F.sun.shadow.mapSize.set(2048, 2048); F.sun.shadow.bias = -0.0005; F.sun.shadow.normalBias = 0.03;
    Object.assign(F.sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 25 });
    scene.add(F.sun, F.sun.target);
    F.fill = new THREE.PointLight(0xffd6a8, 0, 12, 1.2); F.fill.position.set(0.5, 2.6, 1.5); scene.add(F.fill);
    await ready();
    V.renderer.compile(scene, V.camera);
    Object.assign(F, { HX, LX, WX });
  },

  // ~14 s: the problems, the diagnosis, the kit, the scan line fixing everything, a warm clean room
  animate(tl, el, T) {
    const at = (t) => T + t;
    const scanX = (x) => 6200 + ((x + HW + 0.7) / (2 * HW + 1.4)) * 3600;    // when the scan line passes x
    // start state: everything broken
    tl.set(S, { dirt: 1, warm: 0, flick: 0.15, lamp: 0, scan: -HW - 0.7, scanOn: 0, spark: 0, sparkOn: 1, swing: 0, win: 0.35, expo: 0.62 }, 0)
      .set(rig, { ...SHOT[0] }, 0)
      .set(F.damage.material, { opacity: 1 }, 0).set(F.stain.material, { opacity: 1 }, 0).set(F.puddle.scale, { x: 1.3, y: 0.85 }, 0)
      .set(F.bucket.scale, { x: 1, y: 1, z: 1 }, 0).set(F.stream.scale, { y: 1 }, 0).set(F.stream.material, { opacity: 0.55 }, 0).set(F.lampPivot.rotation, { z: 0.42, x: 0.12 }, 0)
      .set(holos.map((h) => h.scale), { x: 0.001, y: 0.001, z: 0.001 }, 0)
      .set(tools.map((t) => t.scale), { x: 0.001, y: 0.001, z: 0.001 }, 0)
      .set(debris.map((d) => d.m.scale), { x: 1, y: 1, z: 1 }, 0);
    debris.forEach((d) => tl.set(d.m.position, { x: d.home.x, y: d.home.y, z: d.home.z }, 0));
    holos.forEach((h) => tl.set(h.userData.check.material, { opacity: 0 }, 0));
    holos.forEach((h) => tl.set(h.userData.ring.material, { opacity: 0.9 }, 0).set(h.userData.ring.scale, { x: 1, y: 1 }, 0));
    tl.set(drips.map((d) => d.material), { opacity: 0.85 }, 0);

    tl.add(rig, { ...shotTween(SHOT[0], SHOT[1]), duration: 15000, ease: 'inOutSine' }, at(-600));

    // 1. the problems: the lamp swings and flickers and sparks, water drips, ripples in the bucket
    tl.add(F.lampPivot.rotation, { z: [0.42, 0.3, 0.42], duration: 1800, loop: 3, ease: 'inOutSine' }, at(0))
      .add(S, { flick: [0.15, 0.9, 0.05, 0.6, 0.02, 0.85, 0.1, 0.4, 0.02, 0.7, 0.05], duration: 1500, loop: 4, ease: 'linear' }, at(0));
    [300, 1500, 2400, 3900, 5100, 6600].forEach((t) => tl.add(F.sparkU.uT, { value: [0, 1], duration: 520, ease: 'outQuad' }, at(t)));
    const fixLeak = scanX(F.WX);
    drips.forEach((d, i) => tl.add(d.position, { y: [H - 0.02, 0.3], duration: 640, loop: Math.floor((fixLeak - 800) / 1300), loopDelay: 660, ease: 'inQuad' }, at(200 + i * 430)));
    ripples.forEach((r, i) => tl.add(r.scale, { x: [1, 7], y: [1, 7], duration: 900, loop: Math.floor((fixLeak - 1200) / 1300), loopDelay: 400, ease: 'outQuad' }, at(840 + i * 430))
      .add(r.material, { opacity: [0.7, 0], duration: 900, loop: Math.floor((fixLeak - 1200) / 1300), loopDelay: 400 }, at(840 + i * 430)));

    // 2. diagnosis: a green ring on each fault
    holos.forEach((h, i) => tl.add(h.scale, { x: [0.001, 1], y: [0.001, 1], z: [0.001, 1], duration: 700, ease: 'outBack(1.8)' }, at(4100 + i * 260))
      .add(h.userData.ring2.scale, { x: [1, 1.12, 1], y: [1, 1.12, 1], duration: 900, loop: 3, ease: 'inOutSine' }, at(4800 + i * 260)));

    // 3. the Tamlik kit arrives
    tools.forEach((t, i) => tl.add(t.scale, { x: [0.001, 1], y: [0.001, 1], z: [0.001, 1], duration: 600, ease: 'outBack(1.4)' }, at(5200 + i * 150))
      .add(t.position, { y: [t.userData.y + 0.5, t.userData.y], duration: 650, ease: 'outCubic' }, at(5200 + i * 150)));

    // 4. the scan line sweeps the room, fixing everything it passes
    tl.add(S, { scanOn: [0, 1], duration: 300 }, at(6000))
      .add(S, { scan: [-HW - 0.7, HW + 0.7], duration: 3600, ease: 'inOutSine' }, at(6200))
      .add(S, { scanOn: [1, 0], duration: 400 }, at(9800))
      .add(S, { dirt: [1, 0], duration: 3600, ease: 'inOutSine' }, at(6200));
    const confirm = (h, t) => tl.add(h.userData.ring.scale, { x: [1, 1.6], y: [1, 1.6], duration: 600, ease: 'outCubic' }, at(t))
      .add(h.userData.ring.material, { opacity: [0.9, 0.25], duration: 600 }, at(t))
      .add(h.userData.check.material, { opacity: [0, 1], duration: 400 }, at(t + 150))
      .add(h.userData.check.scale, { x: [0.4, 1], y: [0.4, 1], duration: 500, ease: 'outBack(2)' }, at(t + 150));
    // the wall: rubble flies back into the hole, the damage seals
    const tw = scanX(F.HX);
    debris.forEach((d, i) => tl.add(d.m.position, { x: [d.home.x, d.wall.x], y: [d.home.y, d.wall.y], z: [d.home.z, d.wall.z], duration: 700, ease: 'inOutQuad' }, at(tw - 250 + i * 18))
      .add(d.m.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 250 }, at(tw + 400 + i * 18)));
    tl.add(F.damage.material, { opacity: [1, 0], duration: 900, ease: 'inOutSine' }, at(tw + 350));
    confirm(holos[0], tw + 500);
    // the lamp: swings straight, sparks stop, light on
    const tlp = scanX(F.LX);
    tl.add(F.lampPivot.rotation, { z: [0.42, 0], x: [0.12, 0], duration: 1100, ease: 'outElastic(1, .5)' }, at(tlp))
      .add(S, { sparkOn: [1, 0], duration: 200 }, at(tlp))
      .add(S, { lamp: [0, 1], flick: [0.3, 1], duration: 500 }, at(tlp + 300));
    confirm(holos[1], tlp + 400);
    // the leak: drips stop, the stain fades, the puddle dries, the bucket goes
    tl.add(drips.map((d) => d.material), { opacity: 0, duration: 200 }, at(fixLeak))
      .add(F.stream.scale, { y: [1, 0.001], duration: 500, ease: 'inQuad' }, at(fixLeak))
      .add(F.stain.material, { opacity: [1, 0], duration: 900 }, at(fixLeak))
      .add(F.puddle.scale, { x: [1.3, 0.001], y: [0.85, 0.001], duration: 1000, ease: 'inQuad' }, at(fixLeak + 100))
      .add(F.bucket.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 500, ease: 'inBack(1.5)' }, at(fixLeak + 600));
    confirm(holos[2], fixLeak + 300);

    // 5. the room warms up, the kit and the rings clear away
    tl.add(S, { warm: [0, 1], win: [0.35, 1], expo: [0.62, 0.92], duration: 2600, ease: 'inOutSine' }, at(8800))
      .add(tools.map((t) => t.scale), { x: 0.001, y: 0.001, z: 0.001, duration: 500, delay: stagger(90), ease: 'inBack(1.6)' }, at(11200))
      .add(holos.map((h) => h.scale), { x: 0.001, y: 0.001, z: 0.001, duration: 500, delay: stagger(120), ease: 'inBack(1.6)' }, at(12000));
    return { tagAt: at(10500) };
  },

  render() {
    if (!V) return;
    aim(V.camera, rig);
    U.dirt.value = S.dirt;
    const on = S.lamp > 0 ? S.flick : S.flick * 0.7;
    F.bulb.intensity = 7 * on; F.glowBulb.material.color.setRGB(1, 0.84, 0.63).multiplyScalar(0.25 + 2.4 * on);
    F.sparkU.uOn.value = S.sparkOn;
    F.stream.material.opacity = 0.38 + 0.18 * S.flick;   // a shimmer, driven by the timeline
    F.scanG.position.x = S.scan; F.scanG.visible = S.scanOn > 0.01; F.scanLight.intensity = 6 * S.scanOn;
    F.scanG.children[0].material.opacity = 0.09 * S.scanOn;
    F.hemi.intensity = 0.3 + 0.4 * S.warm; F.hemi.color.setRGB(0.81 + 0.19 * S.warm, 0.85 + 0.07 * S.warm, 0.92 - 0.12 * S.warm);
    F.sun.intensity = 0.7 + 1.3 * S.warm; F.sun.color.setRGB(0.86 + 0.14 * S.warm, 0.9 - 0.05 * S.warm, 1 - 0.25 * S.warm);
    F.fill.intensity = 3 * S.warm;
    F.sky.material.color.setRGB(0.75 + 0.25 * S.win, 0.82 + 0.1 * S.win, 0.9 - 0.08 * S.win);
    V.renderer.toneMappingExposure = S.expo;
    for (const h of holos) h.quaternion.copy(V.camera.quaternion);          // rings face the camera
    V.render();
  },
};
