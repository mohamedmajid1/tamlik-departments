// Tamlik Media: a real-estate film shoot in the Tamlik studio. A staged living room (with a big print of the Tamlik
// tower) stands in a dark studio. The softboxes switch on one by one, the clapper snaps, the cinema camera starts
// recording and glides along its slider, a drone lifts off and hovers over the set, and the director's monitor
// shows the live shot (really rendered from the cinema camera) with likes rising over it: the shoot becomes the
// campaign. animate() adds the motion at T (ms); render() draws the current state.
import { THREE, tex, model, seat, ready, makeView, aim, shotTween, canvasTex } from '../three/kit.js';
import { stagger, steps } from '../../vendor/anime.esm.min.js';
import { C } from '../brand.js';

let V, SHOT;
const rig = {};
const S = { studio: 0.12, s0: 0, s1: 0, s2: 0, set: 0, rec: 0, blink: 0, slide: 0, clap: 0.5, clapY: -1, fly: 0, prop: 0, tc: 0, hearts: 0, screen: 0 };
const F = {};
const softboxes = [];
const black = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.55, metalness: 0.4 });
const metal = new THREE.MeshStandardMaterial({ color: 0x2a2b2f, roughness: 0.35, metalness: 0.9 });
const chrome = new THREE.MeshStandardMaterial({ color: 0x9a9da3, roughness: 0.2, metalness: 1 });
const fabric = new THREE.MeshStandardMaterial({ color: 0x0e0e10, roughness: 1 });

const cyl = (r1, r2, h, m, seg = 20) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m); c.castShadow = c.receiveShadow = true; return c; };
const bx = (w, h, d, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.castShadow = b.receiveShadow = true; return b; };
// a light stand: three splayed legs, a column
function stand(h) {
  const g = new THREE.Group();
  const col = cyl(0.016, 0.02, h, metal); col.position.y = h / 2 + 0.1; g.add(col);
  for (let i = 0; i < 3; i++) {
    const leg = cyl(0.01, 0.012, 0.62, metal, 8); const a = i / 3 * Math.PI * 2;
    leg.position.set(Math.cos(a) * 0.24, 0.25, Math.sin(a) * 0.24); leg.rotation.set(Math.sin(a) * 0.95, 0, -Math.cos(a) * 0.95); g.add(leg);
  }
  const collar = cyl(0.03, 0.03, 0.06, metal); collar.position.y = 0.52; g.add(collar);
  return g;
}

export const media = {
  id: 'media', name: 'MEDIA', accent: C.cyan, glow: 'rgba(58,215,255,.13)',
  tagline: 'We make you <b>seen</b>',
  full: true,
  html: () => '<canvas class="room"></canvas><div class="shade top"></div><div class="shade bottom"></div>',

  async init(el, { portrait, record }) {
    V = await makeView(el.querySelector('canvas.room'), { portrait, record, env: 'studio_small_09', envIntensity: 0.35, bloom: 0.22 });
    const { scene } = V;
    scene.background = new THREE.Color(0x060708);
    SHOT = portrait
      ? [{ x: -2.75, y: 1.55, z: 3.6, tx: -0.55, ty: 1.0, tz: -1.2 }, { x: 0.7, y: 1.45, z: 3.1, tx: 1.55, ty: 1.25, tz: 0.6 }]
      : [{ x: -3.7, y: 1.7, z: 3.9, tx: 0.1, ty: 1.05, tz: -1.2 }, { x: 0.2, y: 1.5, z: 3.3, tx: 2.6, ty: 1.2, tz: 0.4 }];
    Object.assign(rig, SHOT[0]);

    // --- the studio: polished dark concrete, a curved grey cyclorama fading into the dark
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ map: tex('assets/tex3d/concrete_floor_02/diffuse.jpg', 8, true),
      normalMap: tex('assets/tex3d/concrete_floor_02/nor_gl.jpg', 8), color: 0x55565a, roughness: 0.38, metalness: 0.1 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const cyc = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 8, 64, 1, true, Math.PI * 0.6, Math.PI * 0.8), new THREE.MeshStandardMaterial({ color: 0x1b1c20, roughness: 0.95, side: THREE.BackSide }));
    cyc.position.set(0, 4, 2); scene.add(cyc);

    // --- the set: a staged living-room corner with a big print of the Tamlik tower
    const plaster = new THREE.MeshStandardMaterial({ map: tex('assets/tex3d/plastered_wall/diffuse.jpg', 1.5, true), normalMap: tex('assets/tex3d/plastered_wall/nor_gl.jpg', 1.5), color: 0xf1ebe1, roughness: 0.92 });
    const back = bx(4.2, 2.6, 0.08, plaster); back.position.set(0, 1.3, -2.4); scene.add(back);
    const side = bx(0.08, 2.6, 2.4, plaster); side.position.set(-2.1, 1.3, -1.2); scene.add(side);
    const frameM = new THREE.MeshStandardMaterial({ color: 0x131210, roughness: 0.5 });
    const fr = bx(2.3, 1.36, 0.05, frameM); fr.position.set(0.3, 1.45, -2.33); scene.add(fr);
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(2.18, 1.24), new THREE.MeshStandardMaterial({ map: tex('assets/posts/film_0.88.jpg', 1, true), roughness: 0.55 }));
    pic.position.set(0.3, 1.45, -2.30); scene.add(pic);
    pic.material.map.repeat.set(1, 0.57); pic.material.map.offset.set(0, 0.25);
    const rug = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.012, 2.0), new THREE.MeshStandardMaterial({ map: tex('assets/tex3d/hessian_230/diffuse.jpg', 4, true), color: 0xf0e2c8, roughness: 1 }));
    rug.position.set(0.1, 0.006, -1.2); rug.receiveShadow = true; scene.add(rug);
    const put = async (name, x, z, ry = 0, s = 1, y = 0) => { const h = seat(await model(name), s); h.position.set(x, y, z); h.rotation.y = ry; scene.add(h); return h; };
    await put('mid_century_lounge_chair', -0.55, -1.35, 0.35);
    await put('side_table_01', 0.55, -1.75, 0);
    await put('brass_vase_01', 0.55, -1.75, 0, 0.6, 0.55);
    await put('potted_plant_01', -1.6, -1.9, 0.5, 1.3);
    await put('throw_pillows_01', 1.35, -1.6, -0.4, 0.8);
    await put('ceramic_vase_04', 1.1, -2.1, 0, 1.2);
    F.practical = new THREE.PointLight(0xffc98f, 0, 5, 1.6); F.practical.position.set(0.6, 1.4, -1.6); scene.add(F.practical);

    // --- softboxes (octagonal, black shell, glowing diffuser) on stands, and a fresnel rim light
    for (const [x, z, h, yaw] of [[-2.6, 0.6, 2.0, -0.85], [2.4, 0.2, 1.9, 0.95]]) {
      const g = stand(h); g.position.set(x, 0, z); scene.add(g);
      const head = new THREE.Group(); head.position.set(0, h + 0.2, 0); head.rotation.set(0.22, Math.PI + yaw, 0); g.add(head);
      const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.14, 0.5, 8, 1, true), fabric); shell.rotation.x = -Math.PI / 2; shell.position.z = 0.25; shell.castShadow = true; head.add(shell);
      const diff = new THREE.Mesh(new THREE.CircleGeometry(0.55, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })); diff.position.z = 0.5; head.add(diff);
      const L = new THREE.SpotLight(0xfff4e6, 0, 14, 0.8, 1, 1.6); L.position.set(0, 0, 0.55); L.castShadow = true; L.shadow.mapSize.set(1024, 1024); L.shadow.bias = -0.0008;
      const tgt = new THREE.Object3D(); tgt.position.set(0, 0, 5); head.add(L, tgt); L.target = tgt;
      softboxes.push({ diff, L });
    }
    const rim = stand(2.3); rim.position.set(1.6, 0, -3.3); scene.add(rim);
    const fres = new THREE.Group(); fres.position.set(0, 2.5, 0); fres.rotation.set(0.5, -0.5, 0); rim.add(fres);
    const body = cyl(0.14, 0.14, 0.3, black); body.rotation.x = Math.PI / 2; fres.add(body);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.12, 32), new THREE.MeshBasicMaterial({ color: 0xffe2b0, toneMapped: false })); lens.position.z = 0.151; fres.add(lens);
    for (const [x, y, rz] of [[0, 0.17, 0], [0, -0.17, 0], [0.17, 0, Math.PI / 2], [-0.17, 0, Math.PI / 2]]) { const d = bx(0.26, 0.004, 0.14, black); d.position.set(x, y, 0.22); d.rotation.z = rz; fres.add(d); }
    const rimL = new THREE.SpotLight(0xffd4a0, 0, 12, 0.5, 0.6, 1.6); rimL.position.set(0, 0, 0.2); const rt0 = new THREE.Object3D(); rt0.position.set(0, 0, 4); fres.add(rimL, rt0); rimL.target = rt0;
    softboxes.push({ diff: lens, L: rimL });

    // --- the cinema camera on a slider: body, lens with focus rings, matte box, handle, side monitor, tally light
    const slider = new THREE.Group(); slider.position.set(-1.9, 0, 1.2); slider.rotation.y = -0.18; scene.add(slider);
    for (const x of [-0.8, 0.8]) { const t = stand(0.72); t.position.set(x, 0, 0); t.scale.setScalar(0.9); slider.add(t); }
    for (const z of [-0.035, 0.035]) { const r = cyl(0.012, 0.012, 1.7, chrome, 12); r.rotation.z = Math.PI / 2; r.position.set(0, 0.84, z); slider.add(r); }
    for (const x of [-0.85, 0.85]) { const e = bx(0.05, 0.05, 0.14, black); e.position.set(x, 0.84, 0); slider.add(e); }
    F.carriage = new THREE.Group(); F.carriage.position.set(-0.6, 0.87, 0); slider.add(F.carriage);
    F.carriage.add(bx(0.16, 0.03, 0.14, metal));
    const cam = new THREE.Group(); cam.position.y = 0.1; F.carriage.add(cam); F.cam = cam; F.slider = slider;
    const cb = bx(0.13, 0.14, 0.22, new THREE.MeshStandardMaterial({ color: 0x1c1d20, roughness: 0.45, metalness: 0.6 })); cam.add(cb);
    const lensG = new THREE.Group(); lensG.position.z = 0.19; cam.add(lensG);
    const lb = cyl(0.048, 0.052, 0.17, black, 32); lb.rotation.x = Math.PI / 2; lensG.add(lb);
    for (const z of [-0.05, 0, 0.05]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.006, 8, 32), metal); ring.position.z = z; lensG.add(ring); }
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.04, 32), new THREE.MeshPhysicalMaterial({ color: 0x1d2b3a, roughness: 0.02, metalness: 0.6, clearcoat: 1 })); glass.position.z = 0.086; lensG.add(glass);
    const mb = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.07, 0.1, 4, 1, true), black); mb.rotation.set(Math.PI / 2, Math.PI / 4, 0); mb.position.z = 0.33; mb.scale.set(1.3, 1, 0.8); cam.add(mb);
    const handle = bx(0.03, 0.03, 0.2, black); handle.position.set(0, 0.11, 0.02); cam.add(handle);
    const bat = bx(0.1, 0.1, 0.05, metal); bat.position.z = -0.135; cam.add(bat);
    const sm = bx(0.13, 0.085, 0.015, black); sm.position.set(-0.13, 0.05, 0.02); sm.rotation.y = 0.6; cam.add(sm);
    F.camView = new THREE.Mesh(new THREE.PlaneGeometry(0.115, 0.07), new THREE.MeshBasicMaterial({ toneMapped: false })); F.camView.position.set(-0.126, 0.05, 0.03); F.camView.rotation.y = 0.6; F.camView.translateZ(0.008); cam.add(F.camView);
    F.tally = new THREE.Mesh(new THREE.SphereGeometry(0.009, 12, 8), new THREE.MeshBasicMaterial({ color: 0xff2020, toneMapped: false })); F.tally.position.set(0.04, 0.075, 0.1); cam.add(F.tally);
    // the cinema camera's own view: this is what the monitors show
    F.cine = new THREE.PerspectiveCamera(38, 16 / 9, 0.05, 40); F.cine.position.set(0, 0, 0.3); F.cine.rotation.y = Math.PI; cam.add(F.cine);
    F.rt = new THREE.WebGLRenderTarget(960, 540, { type: THREE.HalfFloatType, samples: 4 }); F.rt.texture.colorSpace = THREE.SRGBColorSpace;
    F.camView.material.map = F.rt.texture;

    // --- the director's monitor on a stand: the live shot plus recording UI and likes rising
    const mon = stand(1.15); mon.position.set(1.85, 0, 0.9); mon.rotation.y = -0.55; scene.add(mon);
    const screen = new THREE.Group(); screen.position.set(0, 1.42, 0); screen.rotation.set(-0.06, 0, 0); mon.add(screen);
    const bezel = bx(0.72, 0.43, 0.04, black); screen.add(bezel);
    F.monitor = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.3825), new THREE.MeshBasicMaterial({ map: F.rt.texture, toneMapped: false })); F.monitor.position.z = 0.021; screen.add(F.monitor);
    F.ui = canvasTex(1024, 576, drawUI);
    F.overlay = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.3825), new THREE.MeshBasicMaterial({ map: F.ui, transparent: true, toneMapped: false, depthWrite: false })); F.overlay.position.z = 0.022; screen.add(F.overlay);
    const hood = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.45, 0.14, 1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x0c0c0d, roughness: 0.9, side: THREE.BackSide })); hood.position.z = 0.07; hood.scale.z = 1; screen.add(hood);

    // --- the drone: body, four arms, motors, spinning props, a gimbal camera, nav lights
    F.drone = new THREE.Group(); F.drone.position.set(0.6, 0.03, 1.2); F.drone.scale.setScalar(1.6); scene.add(F.drone);
    const white = new THREE.MeshStandardMaterial({ color: 0xe8e8ea, roughness: 0.35, metalness: 0.1 });
    const db = bx(0.2, 0.06, 0.26, white); db.position.y = 0.09; F.drone.add(db);
    F.props = [];
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + i * Math.PI / 2, ax = Math.cos(a) * 0.2, az = Math.sin(a) * 0.2;
      const arm = bx(0.26, 0.018, 0.022, white); arm.position.set(ax / 2, 0.1, az / 2); arm.rotation.y = -a; F.drone.add(arm);
      const mot = cyl(0.022, 0.022, 0.035, metal, 12); mot.position.set(ax, 0.12, az); F.drone.add(mot);
      const legD = cyl(0.006, 0.006, 0.09, black, 6); legD.position.set(ax * 0.55, 0.045, az * 0.55); F.drone.add(legD);
      const p = new THREE.Group(); p.position.set(ax, 0.145, az);
      const blade = bx(0.19, 0.003, 0.018, new THREE.MeshStandardMaterial({ color: 0x222226, roughness: 0.4, transparent: true, opacity: 0.9 })); p.add(blade);
      const blur = new THREE.Mesh(new THREE.CircleGeometry(0.1, 32), new THREE.MeshBasicMaterial({ color: 0x9aa0a8, transparent: true, opacity: 0, depthWrite: false })); blur.rotation.x = -Math.PI / 2; p.add(blur);
      F.drone.add(p); F.props.push({ p, blur });
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), new THREE.MeshBasicMaterial({ color: i < 2 ? 0x30ff7a : 0xff3030, toneMapped: false })); led.position.set(ax, 0.1, az); F.drone.add(led);
    }
    const gim = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), black); gim.position.y = 0.04; F.drone.add(gim);

    // --- the clapperboard: slate with the Tamlik Media label, striped arm on a hinge
    const slateTex = canvasTex(512, 360, (x, w, h) => {
      x.fillStyle = '#111'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#eee'; x.lineWidth = 4; x.strokeRect(16, 16, w - 32, h - 32);
      x.beginPath(); x.moveTo(16, h * 0.55); x.lineTo(w - 16, h * 0.55); x.moveTo(w / 2, h * 0.55); x.lineTo(w / 2, h - 16); x.stroke();
      x.strokeStyle = '#01A652'; x.lineWidth = 10; x.lineJoin = 'round'; x.beginPath(); x.moveTo(60, 150); x.lineTo(105, 110); x.lineTo(150, 150); x.stroke();
      x.fillStyle = '#eee'; x.font = '600 58px Manrope, sans-serif'; x.fillText('TAMLIK MEDIA', 170, 150);
      x.font = '500 40px Manrope, sans-serif'; x.fillText('SCENE  01', 44, 270); x.fillText('TAKE  01', w / 2 + 28, 270);
    });
    const stripe = canvasTex(512, 64, (x, w, h) => { x.fillStyle = '#111'; x.fillRect(0, 0, w, h); x.fillStyle = '#eee'; for (let i = -1; i < 9; i++) { x.beginPath(); x.moveTo(i * 64, h); x.lineTo(i * 64 + 32, h); x.lineTo(i * 64 + 64, 0); x.lineTo(i * 64 + 32, 0); x.fill(); } });
    F.clapper = new THREE.Group(); scene.add(F.clapper);
    const slate = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.21, 0.012), [black, black, black, black, new THREE.MeshStandardMaterial({ map: slateTex, roughness: 0.6 }), black]); F.clapper.add(slate);
    F.clapArm = new THREE.Group(); F.clapArm.position.set(-0.15, 0.115, 0); F.clapper.add(F.clapArm);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.035, 0.014), [black, black, black, black, new THREE.MeshStandardMaterial({ map: stripe }), black]); arm.position.x = 0.15; F.clapArm.add(arm);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.014), [black, black, black, black, new THREE.MeshStandardMaterial({ map: stripe }), black]); base.position.y = 0.09; F.clapper.add(base);

    // --- cables snaking across the floor from every stand
    const cableM = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.6 });
    for (const pts of [[[-2.6, 0.6], [-2.2, 1.6], [-1.2, 2.3], [0.3, 2.6], [2.5, 3.2]], [[2.4, 0.2], [2.9, 1.3], [3.2, 2.6]], [[1.85, 0.9], [2.2, 1.8], [2.6, 2.9]], [[-1.9, 1.2], [-1.0, 2.0], [0.4, 2.2], [1.9, 2.8]]]) {
      const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0.012, z)));
      const c = new THREE.Mesh(new THREE.TubeGeometry(curve, 60, 0.011, 8), cableM); c.castShadow = true; scene.add(c);
    }
    // --- light for the dark studio before the softboxes come on
    F.hemi = new THREE.HemisphereLight(0x9fb3d6, 0x141210, 0.1); scene.add(F.hemi);
    F.work = new THREE.SpotLight(0xbfd4ff, 6, 20, 0.9, 1, 1.4); F.work.position.set(0, 6, 3); F.work.target.position.set(0, 0, -1); scene.add(F.work, F.work.target);
    await ready();
    V.renderer.compile(scene, V.camera);
  },

  // ~14 s: lights on, clap, record, slider move, drone, then the monitor with the campaign rising over it
  animate(tl, el, T) {
    const at = (t) => T + t;
    tl.set(S, { studio: 0.12, set: 0, rec: 0, slide: 0, clap: 0.5, clapY: -1, fly: 0, tc: 0, hearts: 0, screen: 0 }, 0)
      .set(S, { s0: 0, s1: 0, s2: 0 }, 0).set(rig, { ...SHOT[0] }, 0);
    tl.add(rig, { ...shotTween(SHOT[0], SHOT[1]), duration: 15000, ease: 'inOutSine' }, at(-600));
    // 1. the lights come on, one by one (a quick flicker as each strikes)
    [0, 1, 2].forEach((i) => tl.add(S, { ['s' + i]: [0, 0.7, 0.2, 1], duration: 450, ease: 'linear' }, at(500 + i * 520)));
    tl.add(S, { studio: [0.12, 0.35], set: [0, 1], duration: 1200 }, at(1800));
    // 2. the clapper rises into the lens, snaps, drops away
    tl.add(S, { clapY: [-1, 0], duration: 600, ease: 'outCubic' }, at(2400))
      .add(S, { clap: [0.5, 0], duration: 160, ease: 'inQuad' }, at(3150))
      .add(S, { clapY: [0, -1], duration: 600, ease: 'inCubic' }, at(3500));
    // 3. rolling: the tally light, the timecode, the slider glides
    tl.add(S, { rec: [0, 1], duration: 1 }, at(3200))
      .add(S, { blink: [0, 1], duration: 1000, loop: 10, ease: steps(2) }, at(3200))
      .add(S, { tc: [0, 10.8], duration: 10800, ease: 'linear' }, at(3200))
      .add(S, { slide: [0, 1], duration: 8000, ease: 'inOutSine' }, at(3400))
      .add(S, { screen: [0, 1], duration: 600 }, at(3300));
    // 4. the drone lifts off, climbs over the set, hovers
    tl.add(S, { prop: [0, 60], duration: 11000, ease: 'inQuad' }, at(4800))
      .add(S, { fly: [0, 1], duration: 3200, ease: 'inOutSine' }, at(5600));
    // 5. the campaign: likes rise over the live shot on the monitor
    tl.add(S, { hearts: [0, 1], duration: 4200, ease: 'linear' }, at(9200));
    return { tagAt: at(10300) };
  },

  render() {
    if (!V) return;
    aim(V.camera, rig);
    softboxes.forEach(({ diff, L }, i) => { const v = S['s' + i]; L.intensity = (i === 2 ? 40 : 26) * v; diff.material.color.setRGB(1, 0.97, 0.92).multiplyScalar(0.04 + 1.15 * v); });
    F.hemi.intensity = S.studio; F.work.intensity = 6 * (1 - S.set * 0.6); F.practical.intensity = 3.5 * S.set;
    F.carriage.position.x = -0.6 + 1.2 * S.slide;
    // the cinema camera keeps the set framed as it glides (its lens points along +z)
    const cw = new THREE.Vector3(); F.cam.getWorldPosition(cw);
    F.cam.rotation.y = Math.atan2(0.1 - cw.x, -1.35 - cw.z) - F.slider.rotation.y;
    F.tally.material.color.setRGB(S.rec * (S.blink < 0.5 ? 1 : 0.15), 0.02, 0.02);
    // the clapper hangs in front of the cinema lens
    const lensW = new THREE.Vector3(); F.cine.getWorldPosition(lensW);
    const dir = new THREE.Vector3(); F.cine.getWorldDirection(dir);
    F.clapper.position.copy(lensW).addScaledVector(dir, 0.75); F.clapper.position.y += S.clapY * 1.2;
    F.clapper.lookAt(lensW); F.clapArm.rotation.z = S.clap; F.clapper.visible = S.clapY > -0.98;
    // the drone: off the floor, up and over the set, a gentle hover
    const f = S.fly, t = S.tc;
    F.drone.position.set(0.6 - 0.9 * f, 0.03 + 1.95 * Math.sin(f * Math.PI / 2) + 0.05 * Math.sin(t * 2.3) * f, 1.2 - 1.5 * f);
    F.drone.rotation.set(0.08 * f * Math.sin(t * 1.7), -0.6 * f, 0.06 * f * Math.sin(t * 1.3));
    F.props.forEach(({ p, blur }, i) => { p.rotation.y = S.prop * (i % 2 ? -1 : 1); blur.material.opacity = Math.min(0.35, S.prop / 20); p.children[0].material.opacity = S.prop > 12 ? 0.25 : 0.9; });
    // the monitors: render the cinema camera's view, then the UI on top
    F.ui.userData.redraw(S);
    const r = V.renderer, prev = r.getRenderTarget();
    F.monitor.visible = F.overlay.visible = false;
    r.setRenderTarget(F.rt); r.render(V.scene, F.cine); r.setRenderTarget(prev);
    F.monitor.visible = F.overlay.visible = true;
    F.monitor.material.color.setScalar(0.08 + 0.92 * S.screen);
    V.render();
  },
};

// the director's monitor UI: frame guides, REC and timecode, the Tamlik mark, then likes rising
function drawUI(x, w, h, s = S) {
  if (!s || !s.screen) return;
  x.globalAlpha = s.screen;
  x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 2;
  for (const [a, b] of [[w / 3, 0], [2 * w / 3, 0]]) { x.beginPath(); x.moveTo(a, 40); x.lineTo(a, h - 40); x.stroke(); }
  for (const b of [h / 3, 2 * h / 3]) { x.beginPath(); x.moveTo(40, b); x.lineTo(w - 40, b); x.stroke(); }
  x.lineWidth = 4; x.strokeStyle = 'rgba(255,255,255,.8)';
  for (const [cx, cy, dx, dy] of [[30, 30, 1, 1], [w - 30, 30, -1, 1], [30, h - 30, 1, -1], [w - 30, h - 30, -1, -1]]) { x.beginPath(); x.moveTo(cx, cy + dy * 40); x.lineTo(cx, cy); x.lineTo(cx + dx * 40, cy); x.stroke(); }
  if (s.rec) {
    x.fillStyle = s.blink < 0.5 ? '#ff2d2d' : 'rgba(255,45,45,.25)'; x.beginPath(); x.arc(70, 72, 13, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#fff'; x.font = '600 30px Manrope, sans-serif'; x.fillText('REC', 94, 83);
    const sec = s.tc, fr = Math.floor((sec % 1) * 25);
    x.font = '500 30px Manrope, monospace'; x.fillText(`00:00:${String(Math.floor(sec)).padStart(2, '0')}:${String(fr).padStart(2, '0')}`, w - 250, 83);
    x.fillText('4K', w - 90, h - 55);
  }
  x.strokeStyle = '#01A652'; x.lineWidth = 7; x.lineJoin = x.lineCap = 'round'; x.beginPath(); x.moveTo(60, h - 52); x.lineTo(86, h - 74); x.lineTo(112, h - 52); x.stroke();
  // likes rising
  if (s.hearts > 0) for (let i = 0; i < 14; i++) {
    const p = (s.hearts * 1.6 - i * 0.08); if (p <= 0 || p > 1) continue;
    const hx = w - 150 + Math.sin(i * 2.1 + p * 4) * 40, hy = h - 80 - p * (h - 160), sz = 22 + (i % 3) * 8;
    x.globalAlpha = s.screen * Math.min(1, (1 - p) * 2.5);
    x.fillStyle = i % 4 ? '#19d67a' : '#3ad7ff';
    x.beginPath(); x.moveTo(hx, hy + sz * 0.35);
    x.bezierCurveTo(hx - sz, hy - sz * 0.4, hx - sz * 0.35, hy - sz, hx, hy - sz * 0.45);
    x.bezierCurveTo(hx + sz * 0.35, hy - sz, hx + sz, hy - sz * 0.4, hx, hy + sz * 0.35); x.fill();
  }
  x.globalAlpha = 1;
}
