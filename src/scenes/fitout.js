// Tamlik Fit-out: the camera stands inside an empty flat and watches it being finished around it. Raw grey walls
// are painted from the ceiling down, the concrete floor turns over tile by tile to oak, a jute rug unrolls, the
// furniture settles into place piece by piece, the downlights come on, the pendants lower and glow, sheer
// curtains stir in the sunset and the last details arrive: books, vases, cushions, prints of the Tamlik tower.
// Real CC0 furniture from Poly Haven, Three.js for the room (shared kit: AO, bloom, HDR reflections), Anime.js
// for every move. animate() adds the motion at T (ms); render() draws the current state.
import { THREE, tex, model, seat, topOf, ready, makeView, aim, shotTween } from '../three/kit.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { stagger } from '../../vendor/anime.esm.min.js';
import { C } from '../brand.js';

const W = 4, D = 3, H = 3;                              // half width, half depth, ceiling height (m)
let V, root3, SHOT;
const rig = {};
const U = { paint: { value: 0 }, sway: { value: 0 } };
const light = { sun: 0.5, warm: 0, pend: 0, down: 0, expo: 0.85 };
const pieces = [], tiles = [], pendants = [], accessories = [], downs = [];
let rug, sky, cove, hemi, sun, floorLamp;

export const fitout = {
  id: 'fitout', name: 'FIT-OUT', accent: C.brass, glow: 'rgba(217,183,121,.14)',
  tagline: 'We shape your <b>space</b>',
  full: true,
  html: () => '<canvas class="room"></canvas><div class="shade top"></div><div class="shade bottom"></div>',

  async init(el, { portrait, record }) {
    V = await makeView(el.querySelector('canvas.room'), { portrait, record, env: 'lebombo', envIntensity: 0.22, bloom: 0.16 });
    const { scene } = V;
    scene.background = new THREE.Color(0x0b0a09);
    root3 = new THREE.Group(); scene.add(root3);
    // portrait frames the sofa wall and the window; landscape takes in the whole room from the corner
    SHOT = portrait
      ? [{ x: 0.9, y: 1.52, z: 4.9, tx: -1.3, ty: 1.02, tz: -2.0 }, { x: 0.35, y: 1.42, z: 3.6, tx: -1.1, ty: 0.98, tz: -2.0 }]
      : [{ x: 3.3, y: 1.6, z: 4.7, tx: 1.5, ty: 0.95, tz: -1.8 }, { x: 2.7, y: 1.5, z: 3.7, tx: 1.35, ty: 0.95, tz: -1.7 }];
    Object.assign(rig, SHOT[0]);

    // --- the shell: walls painted from the ceiling down (a shader paint line at uPaint), a ceiling, a window wall
    const wallMat = new THREE.MeshStandardMaterial({ map: tex('assets/tex3d/plastered_wall/diffuse.jpg', 2, true), normalMap: tex('assets/tex3d/plastered_wall/nor_gl.jpg', 2), roughness: 0.92 });
    wallMat.onBeforeCompile = (sh) => {
      sh.uniforms.uPaint = U.paint;
      sh.vertexShader = 'varying vec3 vWp;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = 'uniform float uPaint; varying vec3 vWp;\n' + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
        float edge = ${H + 0.2} - uPaint * ${H + 0.5};
        float painted = smoothstep(edge - 0.06, edge + 0.06, vWp.y);
        vec3 raw = diffuseColor.rgb * vec3(0.46, 0.47, 0.49);
        vec3 fresh = mix(vec3(1.0), diffuseColor.rgb, 0.25) * vec3(0.96, 0.92, 0.86);
        diffuseColor.rgb = mix(raw, fresh, painted) + vec3(0.2, 0.16, 0.1) * exp(-pow((vWp.y - edge) / 0.04, 2.0)) * step(0.001, uPaint) * step(uPaint, 0.999);`);
    };
    const box = (w, h, d, x, y, z, m = wallMat) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.receiveShadow = b.castShadow = true; root3.add(b); return b; };
    box(2 * W, H, 0.2, 0, H / 2, -D - 0.1);
    box(0.2, H, 2 * D + 2, W + 0.1, H / 2, 0);
    box(0.2, H, 0.8, -W - 0.1, H / 2, -D + 0.4);
    box(0.2, 0.12, 4.8, -W - 0.1, 0.06, 0.2); box(0.2, 0.35, 4.8, -W - 0.1, H - 0.175, 0.2);
    box(0.2, H, 1.6, -W - 0.1, H / 2, 3.4);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: 0.4, metalness: 0.6 });
    for (const z of [-2.2, -1.0, 0.2, 1.4, 2.6]) box(0.08, H - 0.47, 0.06, -W - 0.02, (H - 0.47) / 2 + 0.12, z, frameMat);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(4.8, H - 0.47), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.07 }));
    glass.rotation.y = Math.PI / 2; glass.position.set(-W - 0.05, (H - 0.47) / 2 + 0.12, 0.2); root3.add(glass);
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(2 * W, 2 * D + 2), new THREE.MeshStandardMaterial({ color: 0xf1ede6, roughness: 0.95 }));
    ceiling.rotation.x = Math.PI / 2; ceiling.position.set(0, H, 1); root3.add(ceiling);
    cove = new THREE.Mesh(new THREE.BoxGeometry(2 * W, 0.02, 0.06), new THREE.MeshBasicMaterial({ color: 0xffd9a0, toneMapped: false }));
    cove.position.set(0, H - 0.08, -D + 0.05); root3.add(cove);
    // recessed downlights in the ceiling, switched on one after another
    for (const [x, z] of [[-2.6, -1.8], [-0.2, -1.8], [2.2, -1.8], [-2.6, 0.6], [-0.2, 0.6], [2.2, 0.6]]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 8, 24), new THREE.MeshStandardMaterial({ color: 0xcfcac2, metalness: 0.8, roughness: 0.3 }));
      ring.rotation.x = Math.PI / 2; ring.position.set(x, H - 0.005, z); root3.add(ring);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(0.066, 24), new THREE.MeshBasicMaterial({ color: 0x302d28, toneMapped: false }));
      disc.rotation.x = Math.PI / 2; disc.position.set(x, H - 0.006, z); root3.add(disc); downs.push({ disc, v: { on: 0 } });
    }

    // the view: a sunset over the city through the glazing
    sky = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), new THREE.ShaderMaterial({ depthWrite: false,
      uniforms: { uWarm: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float uWarm; varying vec2 vUv;
        float h(float x){ return fract(sin(x * 91.7) * 43758.5); }
        void main(){
          vec3 top = mix(vec3(0.10, 0.13, 0.22), vec3(0.16, 0.14, 0.26), uWarm), hor = mix(vec3(0.55, 0.52, 0.5), vec3(1.0, 0.58, 0.28), uWarm);
          vec3 c = mix(hor, top, smoothstep(0.34, 0.8, vUv.y));
          c += vec3(1.0, 0.7, 0.4) * uWarm * exp(-pow(length((vUv - vec2(0.42, 0.36)) * vec2(2.4, 5.0)), 2.0)) * 1.4;
          float bx = floor(vUv.x * 60.0), sk = 0.30 + 0.07 * h(bx) + 0.05 * h(bx * 3.1) * step(0.7, h(bx + 9.0));
          if (vUv.y < sk) { c = mix(vec3(0.05, 0.05, 0.07), vec3(0.2, 0.12, 0.09), uWarm * 0.6);
            vec2 wv = fract(vec2(vUv.x * 240.0, vUv.y * 160.0)); c += vec3(1.0, 0.75, 0.4) * step(0.55, h(floor(vUv.x * 240.0) + floor(vUv.y * 160.0) * 7.0)) * step(0.35, wv.x) * step(0.4, wv.y) * 0.5 * uWarm; }
          gl_FragColor = vec4(c, 1.0);
        }` }));
    sky.rotation.y = Math.PI / 2; sky.position.set(-W - 6, 3.5, 0.2); root3.add(sky);

    // --- the floor: 1 m tiles, concrete on top, oak underneath; each turns over
    const cMat = new THREE.MeshStandardMaterial({ map: tex('assets/tex3d/concrete_floor_02/diffuse.jpg', 1, true), normalMap: tex('assets/tex3d/concrete_floor_02/nor_gl.jpg', 1), roughness: 0.9, color: 0x9a9a9a });
    const oMat = new THREE.MeshStandardMaterial({ map: tex('assets/tex3d/wood_floor/diffuse.jpg', 1, true), normalMap: tex('assets/tex3d/wood_floor/nor_gl.jpg', 1), roughnessMap: tex('assets/tex3d/wood_floor/rough.jpg', 1), roughness: 1, envMapIntensity: 0.7 });
    for (let x = -W; x < W; x++) for (let z = -D; z < D + 2; z++) {
      const g = new THREE.Group(); g.position.set(x + 0.5, 0, z + 0.5);
      const top = new THREE.PlaneGeometry(1, 1), bot = new THREE.PlaneGeometry(1, 1);
      for (const [geo, flip] of [[top, 1], [bot, -1]]) {
        const uv = geo.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, (x + uv.getX(i)) * 0.5, (-(z + 1) + (flip > 0 ? uv.getY(i) : 1 - uv.getY(i))) * 0.5);
      }
      const a = new THREE.Mesh(top, cMat); a.rotation.x = -Math.PI / 2; a.receiveShadow = true;
      const b = new THREE.Mesh(bot, oMat); b.rotation.x = Math.PI / 2; b.receiveShadow = true;
      g.add(a, b); root3.add(g); tiles.push({ g, d: Math.hypot(x + 0.5 + W, z + 0.5) });
    }
    tiles.sort((p, q) => p.d - q.d);
    const sub = new THREE.Mesh(new THREE.PlaneGeometry(2 * W, 2 * D + 2), new THREE.MeshStandardMaterial({ color: 0x2b2926, roughness: 1 }));
    sub.rotation.x = -Math.PI / 2; sub.position.set(0, -0.03, 1); root3.add(sub);

    // --- sheer linen curtains at the glazing, stirring in the evening air
    const linen = new THREE.MeshStandardMaterial({ map: tex('assets/tex3d/rough_linen/diffuse.jpg', 2, true), color: 0xf6efe4, roughness: 1, transparent: true, opacity: 0.82, side: THREE.DoubleSide });
    linen.onBeforeCompile = (sh) => {
      sh.uniforms.uSway = U.sway;
      sh.vertexShader = 'uniform float uSway;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        float hang = (1.0 - uv.y);
        transformed.z += sin(position.x * 14.0) * 0.045 + sin(position.x * 5.0 + uSway) * 0.03 * hang;`);
    };
    for (const [z, w] of [[-2.05, 1.1], [2.3, 1.2]]) {
      const c = new THREE.Mesh(new THREE.PlaneGeometry(w, H - 0.2, 60, 8), linen); c.rotation.y = Math.PI / 2; c.position.set(-W + 0.12, (H - 0.2) / 2 + 0.05, z); c.castShadow = true; root3.add(c);
    }
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 5.2, 8), frameMat); rail.rotation.x = Math.PI / 2; rail.position.set(-W + 0.12, H - 0.12, 0.2); root3.add(rail);

    // --- the rug unrolls from under the sofa
    rug = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.012, 2.2), new THREE.MeshStandardMaterial({ map: tex('assets/tex3d/hessian_230/diffuse.jpg', 5, true), normalMap: tex('assets/tex3d/hessian_230/nor_gl.jpg', 5), roughness: 1, color: 0xf2e6d0 }));
    rug.geometry.translate(0, 0.006, 1.1); rug.position.set(-0.2, 0.001, -2.0); rug.receiveShadow = true; root3.add(rug);

    // --- furniture: real models seated on the floor (or on another piece)
    const place = async (n, x, z, ry = 0, s = 1, list = pieces, y = 0) => {
      const h = seat(await model(n), s); h.rotation.y = ry; h.position.set(x, y, z); h.userData = { y, ry }; root3.add(h); list.push(h); return h;
    };
    // a modern low sectional in warm grey wool (Poly Haven only has classic sofas): cushions, a chaise, piping
    const wool = new THREE.MeshStandardMaterial({ map: tex('assets/tex3d/poly_wool_herringbone/diffuse.jpg', 3, true), normalMap: tex('assets/tex3d/poly_wool_herringbone/nor_gl.jpg', 3), roughness: 1, color: 0xf6ece0 });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1b1a19, roughness: 0.35, metalness: 0.8 });
    const sofaG = new THREE.Group();
    const rb = (w, h, d, x, y, z, m = wool, r = 0.06) => { const b = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 5, r), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; sofaG.add(b); };
    rb(2.9, 0.2, 0.98, 0, 0.2, 0, wool, 0.05);
    rb(0.95, 0.2, 1.7, 0.975, 0.2, 0.36, wool, 0.05);
    for (const x of [-1.0, -0.02]) rb(0.96, 0.17, 0.82, x, 0.385, 0.06, wool, 0.075);
    rb(0.93, 0.17, 1.58, 0.975, 0.385, 0.42, wool, 0.075);
    for (const x of [-1.0, -0.02, 0.96]) rb(0.95, 0.46, 0.24, x, 0.62, -0.37, wool, 0.1);
    rb(0.22, 0.52, 0.98, -1.55, 0.36, 0, wool, 0.09);
    for (const [x, z] of [[-1.5, -0.4], [-1.5, 0.4], [1.35, -0.4], [1.35, 1.12], [0.55, 1.12]]) {
      const l = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.012, 0.1, 12), legMat); l.position.set(x, 0.05, z); sofaG.add(l);
    }
    // a folded throw over the chaise
    const throwM = new THREE.MeshStandardMaterial({ map: tex('assets/tex3d/rough_linen/diffuse.jpg', 1.5, true), color: 0xb7875a, roughness: 1 });
    const th = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.05, 0.45, 3, 0.02), throwM); th.position.set(1.05, 0.49, 0.75); th.rotation.y = 0.15; th.castShadow = true; sofaG.add(th);
    const sofa = new THREE.Group(); sofa.add(sofaG); sofa.position.set(-0.3, 0, -2.45); sofa.userData = { y: 0, ry: 0 }; root3.add(sofa); pieces.push(sofa);
    const table = await place('modern_coffee_table_01', -0.2, -0.95, Math.PI / 2, 1.05);
    await place('mid_century_lounge_chair', -2.05, -0.55, Math.PI * 0.62);
    await place('modern_arm_chair_01', 1.75, -0.7, -Math.PI * 0.55);
    await place('side_table_01', 1.25, -2.5, 0);
    const sideboard = await place('modern_wooden_cabinet', 2.0, -2.62, 0, 0.62);
    const shelves = await place('wooden_display_shelves_01', 3.72, -1.25, -Math.PI / 2, 1.1);
    await place('potted_plant_01', -3.45, -2.45, 0.4, 1.25);
    await place('potted_plant_02', 3.45, 0.2, 1.1, 1.3);
    await place('potted_plant_01', -3.4, 1.9, 2.1, 1.05);
    await place('wicker_basket_02', 3.35, -2.3, 0.4, 1.3);
    // an arc floor lamp arching over the lounge chair: marble base, brushed steel arc, a warm dome
    floorLamp = new THREE.Group();
    const steel = new THREE.MeshStandardMaterial({ color: 0xb9b3a8, metalness: 1, roughness: 0.28 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.06, 32), new THREE.MeshStandardMaterial({ map: tex('assets/tex3d/plastered_wall/diffuse.jpg', 1, true), color: 0xf0ede8, roughness: 0.3 }));
    base.position.y = 0.03; base.castShadow = true; floorLamp.add(base);
    const arc = new THREE.CatmullRomCurve3([[0, 0.06, 0], [0.05, 1.2, 0], [0.4, 1.95, 0], [1.05, 2.05, 0], [1.4, 1.75, 0]].map((p) => new THREE.Vector3(...p)));
    const tube = new THREE.Mesh(new THREE.TubeGeometry(arc, 80, 0.012, 10), steel); tube.castShadow = true; floorLamp.add(tube);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x1c1b19, metalness: 0.7, roughness: 0.35, side: THREE.DoubleSide }));
    dome.position.set(1.4, 1.72, 0); dome.castShadow = true; floorLamp.add(dome);
    const bulbF = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd7a0, toneMapped: false })); bulbF.position.set(1.4, 1.64, 0); floorLamp.add(bulbF);
    const fl = new THREE.PointLight(0xffc27a, 0, 5, 1.6); fl.position.set(1.4, 1.55, 0); floorLamp.add(fl); floorLamp.userData = { y: 0, ry: -0.7, light: fl, bulb: bulbF };
    floorLamp.position.set(-3.1, 0, 0.25); floorLamp.rotation.y = -0.7; root3.add(floorLamp); pieces.push(floorLamp);
    // pendants hung from the ceiling
    for (const [x, z] of [[-0.2, -0.95], [-2.2, -0.55]]) {
      const p = await place('modern_ceiling_lamp_01', x, z, 0, 1.2, pendants, H);
      const b = new THREE.Box3().setFromObject(p); p.children[0].position.y -= b.max.y - b.min.y;
      const L = new THREE.PointLight(0xffc27a, 0, 7, 1.6); L.position.set(0, -1.05, 0); p.add(L); p.userData.light = L;
    }
    // accessories, on top of their furniture: cushions, vases, books, the frame, plants
    await place('throw_pillows_01', -0.9, -2.5, 0, 0.9, accessories, 0.45);
    await place('brass_vase_01', -0.35, -0.8, 0, 0.55, accessories, topOf(table));
    const books = new THREE.Group(); books.position.set(-0.05, topOf(table), -1.15); books.userData = { y: topOf(table), ry: 0.3 }; books.rotation.y = 0.3;
    [[0x2d3b35, 0.04], [0xd8cdb8, 0.035], [0x7a4b33, 0.03]].reduce((y, [c, t], i) => {
      const bk = new THREE.Mesh(new RoundedBoxGeometry(0.3 - i * 0.03, t, 0.22 - i * 0.02, 2, 0.004), new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 }));
      bk.position.y = y + t / 2; bk.rotation.y = i * 0.12; bk.castShadow = true; books.add(bk); return y + t;
    }, 0);
    root3.add(books); accessories.push(books);
    await place('ceramic_vase_02', 1.35, -2.62, 0, 1, accessories, topOf(sideboard));
    await place('standing_picture_frame_02', 2.7, -2.7, -0.3, 2.2, accessories, topOf(sideboard));
    await place('potted_plant_04', 1.25, -2.5, 0, 1.2, accessories, 0.55);
    await place('ceramic_vase_03', 3.72, -1.45, 0, 1.2, accessories, topOf(shelves));
    await place('ceramic_vase_04', 3.72, -0.95, 0, 1.0, accessories, topOf(shelves));
    // two framed prints of the Tamlik tower above the sofa (stills from the tower film)
    for (const [x, img] of [[-1.05, 'film_0.4'], [0.45, 'film_0.88']]) {
      const art = new THREE.Group(); art.position.set(x, 1.72, -D + 0.03);
      const fr = new THREE.Mesh(new THREE.BoxGeometry(1.14, 1.14, 0.04), new THREE.MeshStandardMaterial({ color: 0x151412, roughness: 0.5 }));
      const mat = new THREE.Mesh(new THREE.PlaneGeometry(1.06, 1.06), new THREE.MeshStandardMaterial({ color: 0xf3efe8, roughness: 0.9 }));
      const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.86), new THREE.MeshStandardMaterial({ map: tex('assets/posts/' + img + '.jpg', 1, true), roughness: 0.6 }));
      fr.position.z = 0.02; mat.position.z = 0.041; pic.position.z = 0.042; fr.castShadow = true;
      art.add(fr, mat, pic); art.userData = { y: 1.72, ry: 0 }; root3.add(art); accessories.push(art);
    }
    const skirt = new THREE.MeshStandardMaterial({ color: 0xe9e4dc, roughness: 0.6 });
    box(2 * W, 0.1, 0.02, 0, 0.05, -D + 0.01, skirt); box(0.02, 0.1, 2 * D + 2, W - 0.01, 0.05, 0, skirt);

    // --- light: a cool fill for the bare shell, the setting sun through the glass, lamps later
    hemi = new THREE.HemisphereLight(0xdfe6ff, 0x3a3128, 0.5); scene.add(hemi);
    sun = new THREE.DirectionalLight(0xffb070, 0); sun.position.set(-12, 5.5, 2.5); sun.target.position.set(0, 0, -0.5);
    sun.castShadow = true; sun.shadow.mapSize.set(record ? 4096 : 2048, record ? 4096 : 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 4;
    Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
    scene.add(sun, sun.target);
    await ready();
    V.renderer.compile(scene, V.camera);
  },

  // ~14 s: paint, floor, rug, furniture, lights, curtains, accessories; the camera drifts through it all
  animate(tl, el, T) {
    const at = (t) => T + t;
    const hide = (list) => list.forEach((p) => { p.scale.setScalar(0.001); p.visible = false; });
    tl.set(U.paint, { value: 0 }, 0).set(light, { sun: 0.5, warm: 0, pend: 0, down: 0, expo: 0.85 }, 0)
      .set(rig, { ...SHOT[0] }, 0).set(rug.scale, { z: 0.001 }, 0)
      .set(downs.map((d) => d.v), { on: 0 }, 0)
      .set(tiles.map((t) => t.g.rotation), { x: 0 }, 0).set(tiles.map((t) => t.g.position), { y: 0 }, 0)
      .call(() => { hide(pieces); hide(pendants); hide(accessories); }, 0);

    tl.add(rig, { ...shotTween(SHOT[0], SHOT[1]), duration: 15000, ease: 'inOutSine' }, at(-600));
    tl.add(U.sway, { value: [0, 9], duration: 14000, ease: 'linear' }, at(0));
    // 1. paint runs down the walls
    tl.add(U.paint, { value: [0, 1], duration: 2800, ease: 'inOutSine' }, at(600));
    // 2. the floor turns over from concrete to oak, starting at the window: a soft wave
    tiles.forEach((t, i) => tl.add(t.g.rotation, { x: [0, Math.PI], duration: 760, ease: 'inOutSine' }, at(2300 + i * 30))
      .add(t.g.position, { y: [0, 0.16, 0], duration: 760, ease: 'inOutSine' }, at(2300 + i * 30)));
    // 3. the rug unrolls
    tl.add(rug.scale, { z: [0.001, 1], duration: 1100, ease: 'inOutCubic' }, at(4700));
    // 4. furniture settles into place: floats down, turns into position, lands softly
    pieces.forEach((p, i) => {
      const t = at(5000 + i * 270);
      tl.call(() => { p.visible = true; }, t)
        .add(p.scale, { x: [0.82, 1], y: [0.82, 1], z: [0.82, 1], duration: 900, ease: 'outCubic' }, t)
        .add(p.position, { y: [p.userData.y + 0.75, p.userData.y], duration: 1000, ease: 'outCubic' }, t)
        .add(p.rotation, { y: [p.userData.ry + 0.45, p.userData.ry], duration: 1000, ease: 'outCubic' }, t);
    });
    // 5. downlights on one by one, the pendants lower and glow, the sun warms the room
    downs.forEach((d, i) => tl.add(d.v, { on: [0, 1], duration: 300 }, at(8400 + i * 120)));
    pendants.forEach((p, i) => {
      const t = at(8700 + i * 260);
      tl.call(() => { p.visible = true; }, t).add(p.scale, { x: [1, 1], y: [1, 1], z: [1, 1], duration: 1 }, t)
        .add(p.position, { y: [H + 1.4, H], duration: 1100, ease: 'outCubic' }, t);
    });
    tl.add(light, { pend: [0, 1], duration: 800, ease: 'inOutSine' }, at(9800))
      .add(light, { sun: [0.5, 2.6], warm: [0, 1], expo: [0.85, 0.96], duration: 4500, ease: 'inOutSine' }, at(5800));
    // 6. the finishing touches arrive on the surfaces
    accessories.forEach((p, i) => {
      const t = at(10200 + i * 140);
      tl.call(() => { p.visible = true; }, t).add(p.scale, { x: [0.001, 1], y: [0.001, 1], z: [0.001, 1], duration: 650, ease: 'outBack(1.5)' }, t);
    });
    tl.call(() => { for (const l of [pieces, pendants, accessories]) l.forEach((p) => { p.visible = true; }); }, at(13400));
    return { tagAt: at(10500) };
  },

  render() {
    if (!V) return;
    aim(V.camera, rig);
    sun.intensity = light.sun; sun.color.setRGB(1, 0.62 + 0.1 * (1 - light.warm), 0.38 + 0.3 * (1 - light.warm));
    hemi.intensity = 0.55 - 0.15 * light.warm; hemi.color.setRGB(0.87 + 0.13 * light.warm, 0.9, 1 - 0.18 * light.warm);
    sky.material.uniforms.uWarm.value = light.warm;
    cove.material.color.setRGB(1, 0.85, 0.63).multiplyScalar(0.15 + 1.6 * light.pend);
    for (const p of pendants) p.userData.light.intensity = 9 * light.pend;
    floorLamp.userData.light.intensity = 4 * light.pend; floorLamp.userData.bulb.material.color.setRGB(1, 0.84, 0.63).multiplyScalar(0.2 + 2.2 * light.pend);
    for (const d of downs) d.disc.material.color.setRGB(1, 0.93, 0.8).multiplyScalar(0.12 + 2.6 * d.v.on);
    V.renderer.toneMappingExposure = light.expo;
    V.render();
  },
};
