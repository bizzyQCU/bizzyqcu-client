/**
 * 3D Bar Chart scene (three.js)
 *
 * Adapted from the BrewedOps Motion Library "3D bar chart"
 * https://brewedops.cloud/motionlibrary/?id=three-objects-bar-chart
 *
 * Customised for the BizzyQCU Seller Portal palette:
 * - Deep navy grid platform with subtle golden grid lines
 * - Bars gradient from rich amber (#D97706) to bright QCU gold (#FDE68A)
 * - Transparent canvas so DotGridBackground shows through
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const PALETTE = {
  floorFill: '#0f1b33',
  gridLine: 'rgba(253, 184, 19, 0.22)',
  gridBorder: 'rgba(253, 184, 19, 0.45)',
  barLow: 0xd97706, // amber-600
  barHigh: 0xfde68a, // amber-200 / bright gold
  keyLight: 0xfff4dc,
  fillLight: 0x38bdf8,
};

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const eio = (x) => {
  x = clamp01(x);
  return x * x * (3 - 2 * x);
};
const outBack = (x) => {
  x = clamp01(x) - 1;
  return 1 + 2.2 * x * x * x + 1.2 * x * x;
};

export function createBarChartScene(root, { reducedMotion = false } = {}) {
  const host = root.querySelector('.coin-stack-gl');
  if (!host) return () => {};

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
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

  const addLight = (color, x, y, z, intensity) => {
    const l = new THREE.DirectionalLight(color, intensity);
    l.position.set(x, y, z);
    scene.add(l);
    return l;
  };

  const mkTex = (w, h, draw) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    draw(g, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  camera.position.set(0, 3.8, 10.4);
  camera.lookAt(0, 0.75, 0);
  addLight(PALETTE.keyLight, 3, 6, 4, 1.7);
  addLight(PALETTE.fillLight, -4, 3, -3, 0.7);

  const grid = mkTex(512, 256, (g, w, h) => {
    g.fillStyle = PALETTE.floorFill;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = PALETTE.gridLine;
    g.lineWidth = 2;
    for (let i = 0; i <= 14; i++) {
      g.beginPath();
      g.moveTo((i / 14) * w, 0);
      g.lineTo((i / 14) * w, h);
      g.stroke();
    }
    for (let j = 0; j <= 7; j++) {
      g.beginPath();
      g.moveTo(0, (j / 7) * h);
      g.lineTo(w, (j / 7) * h);
      g.stroke();
    }
    g.strokeStyle = PALETTE.gridBorder;
    g.lineWidth = 4;
    g.strokeRect(2, 2, w - 4, h - 4);
  });

  const chart = new THREE.Group();
  scene.add(chart);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(4.8, 2.6),
    new THREE.MeshStandardMaterial({ map: grid, roughness: 0.55, metalness: 0.2 })
  );
  floor.rotation.x = -Math.PI / 2;
  chart.add(floor);

  const heights = [0.8, 1.3, 1.05, 1.9, 1.6, 2.4, 3.0];
  const lo = new THREE.Color(PALETTE.barLow);
  const hi = new THREE.Color(PALETTE.barHigh);
  const geo = new THREE.BoxGeometry(0.44, 1, 0.44);
  const bars = heights.map((_h, i) => {
    const m = new THREE.Mesh(
      geo,
      new THREE.MeshPhysicalMaterial({
        color: lo.clone().lerp(hi, i / (heights.length - 1)),
        metalness: 0.45,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
      })
    );
    m.position.x = -1.8 + i * 0.6;
    m.scale.y = 0.001;
    chart.add(m);
    return m;
  });

  const update = (s, px, py) => {
    const c = (s + 3) % 6.8;
    bars.forEach((m, i) => {
      const up = outBack((c - 0.1 - i * 0.16) / 0.9);
      const down = eio((c - 5.7 - (6 - i) * 0.05) / 0.6);
      const k = Math.max(0.001, up * (1 - down));
      m.scale.y = k * heights[i];
      m.position.y = m.scale.y / 2;
    });
    chart.rotation.y = -0.5 + Math.sin(s * 0.4) * 0.15 + px * 0.5;
    chart.rotation.x = py * 0.2;
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

  const t0 = performance.now();
  let raf = 0;
  let drawn = false;
  const loop = (t) => {
    raf = requestAnimationFrame(loop);
    if (reducedMotion && drawn) return;
    drawn = true;
    const s = reducedMotion ? 2.5 : (t - t0) / 1000;
    px += (tx - px) * 0.06;
    py += (ty - py) * 0.06;
    update(s, px, py);
    renderer.render(scene, camera);
  };

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

