/**
 * Coin stack 3D scene (three.js)
 *
 * Adapted from the BrewedOps Motion Library "Coin stack"
 * https://brewedops.cloud/motionlibrary/?id=three-objects-coins
 *
 * Changes from the original:
 * - Recoloured to the BizzyQCU palette (amber/gold coins, navy shadow)
 * - Coin face shows the Philippine peso sign and uses the app font
 * - Transparent canvas so the auth DotGridBackground shows through
 * - Packaged as an ES module: createCoinStackScene(root) returns a cleanup fn
 *
 * Expected DOM: `root` contains an element with class `.coin-stack-gl`.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// BizzyQCU palette (keep in sync with tailwind.config.js -> brand)
const PALETTE = {
  coinLight: '#FDE68A', // amber-200
  coinMid: '#FDB813', // brand.yellow
  coinDark: '#D97706', // amber-600
  rim: 0xf59e0b, // brand.gold
  faceInk: 'rgba(15, 39, 86, 0.92)', // brand.deepBlue
  faceRing: 'rgba(255, 255, 255, 0.85)',
  shadow: '11, 17, 32', // #0b1120 (DotGridBackground base), as r,g,b
  keyLight: 0xfff4dc, // warm key light
  fillLight: 0x3b82f6, // cool navy/blue rim light
};

const FONT = '"Plus Jakarta Sans", system-ui, sans-serif';

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smoothstep = (x) => {
  x = clamp01(x);
  return x * x * (3 - 2 * x);
};

export function createCoinStackScene(root, { reducedMotion = false } = {}) {
  const host = root.querySelector('.coin-stack-gl');
  if (!host) return () => {};

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    // WebGL unavailable: leave the decorative panel empty.
    return () => {};
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  let dead = false;

  const makeTexture = (w, h, draw) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    draw(g, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.redraw = () => {
      g.clearRect(0, 0, w, h);
      draw(g, w, h);
      t.needsUpdate = true;
    };
    return t;
  };

  const addLight = (color, x, y, z, intensity) => {
    const l = new THREE.DirectionalLight(color, intensity);
    l.position.set(x, y, z);
    scene.add(l);
    return l;
  };

  const addShadow = (w, d, y, alpha) => {
    const t = makeTexture(128, 128, (g) => {
      const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, `rgba(${PALETTE.shadow},${alpha})`);
      gr.addColorStop(1, `rgba(${PALETTE.shadow},0)`);
      g.fillStyle = gr;
      g.fillRect(0, 0, 128, 128);
    });
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.y = y;
    scene.add(m);
    return m;
  };

  // Camera & lights
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  camera.position.set(0, 2.4, 6.6);
  camera.lookAt(0, -0.2, 0);
  addLight(PALETTE.keyLight, 2, 5, 4, 1.5);
  addLight(PALETTE.fillLight, -4, 1.5, -2, 0.8);

  // Coin face texture
  const face = makeTexture(256, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, PALETTE.coinLight);
    gr.addColorStop(0.45, PALETTE.coinMid);
    gr.addColorStop(1, PALETTE.coinDark);
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = PALETTE.faceRing;
    g.lineWidth = 8;
    g.beginPath();
    g.arc(w / 2, h / 2, 100, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = PALETTE.faceInk;
    g.font = `800 120px ${FONT}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('₱', w / 2, h / 2 + 6);
  });
  document.fonts?.ready.then(() => {
    if (!dead) face.redraw();
  });

  const geo = new THREE.CylinderGeometry(0.62, 0.62, 0.1, 48);
  const rim = new THREE.MeshPhysicalMaterial({
    color: PALETTE.rim,
    metalness: 0.85,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  });
  const cap = new THREE.MeshStandardMaterial({ map: face, metalness: 0.35, roughness: 0.3 });

  const stack = new THREE.Group();
  stack.scale.setScalar(1.55);
  scene.add(stack);
  const COIN_COUNT = 7;
  const coins = [];
  for (let i = 0; i < COIN_COUNT; i++) {
    const m = new THREE.Mesh(geo, [rim, cap, cap]);
    stack.add(m);
    coins.push(m);
  }
  const shadow = addShadow(2.6, 2.6, -0.96, 0.55);

  // Animation: coins drop in one by one, bounce, then the stack shrinks and loops (6s cycle).
  const update = (s, px, py) => {
    const c = (s + 3.6) % 6;
    const out = smoothstep((c - 5.3) / 0.6);
    coins.forEach((m, i) => {
      const t0 = 0.05 + i * 0.45;
      const p = clamp01((c - t0) / 0.7);
      const target = -0.55 + i * 0.115;
      const lt = c - (t0 + 0.7);
      const bounce = lt > 0 ? Math.exp(-lt * 7) * Math.abs(Math.sin(lt * 14)) * 0.08 : 0;
      m.position.y = target + (1 - p * p) * 3.4 + bounce;
      m.rotation.x =
        (1 - p) * (1 - p) * Math.PI * 5 + (lt > 0 ? Math.exp(-lt * 6) * Math.sin(lt * 26) * 0.12 : 0);
      m.rotation.y = (1 - p) * 2.4 + i * 0.35;
      m.visible = c > t0 && out < 0.98;
      m.scale.setScalar(Math.max(0.001, 1 - out));
    });
    stack.rotation.y = s * 0.3 + px * 1.1;
    stack.rotation.x = py * 0.3;
    shadow.scale.setScalar(1.55 * (1 - out));
  };

  const resize = () => {
    const w = root.clientWidth || 1;
    const h = root.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(root);

  // Pointer steers the stack
  let tx = 0;
  let ty = 0;
  let px = 0;
  let py = 0;
  const onMove = (e) => {
    const r = root.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
  };
  root.addEventListener('pointermove', onMove);

  const start = performance.now();
  let raf = 0;
  let drawn = false; // reduced motion: still draw one frame
  const loop = (t) => {
    raf = requestAnimationFrame(loop);
    if (reducedMotion && drawn) return;
    drawn = true;
    // Reduced motion: show a fully stacked frame instead of an empty one.
    const s = reducedMotion ? 2.0 : (t - start) / 1000;
    px += (tx - px) * 0.06;
    py += (ty - py) * 0.06;
    update(s, px, py);
    renderer.render(scene, camera);
  };
  // Compile shaders first so mounting doesn't stall the page
  renderer.compileAsync(scene, camera).then(() => {
    if (!dead && !raf) raf = requestAnimationFrame(loop);
  });

  return () => {
    dead = true;
    cancelAnimationFrame(raf);
    raf = -1;
    ro.disconnect();
    root.removeEventListener('pointermove', onMove);
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      ms.forEach((m) => {
        for (const k in m) if (m[k] && m[k].isTexture) m[k].dispose();
        m.dispose();
      });
    });
    envRT.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}

