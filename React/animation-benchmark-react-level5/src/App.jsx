import { useEffect, useMemo, useRef, useState, Component } from 'react';
import * as THREE from 'three';
import {
  useSpring as useSpringWeb,
  useSprings as useSpringsWeb,
  useTransition,
  animated as animatedWeb,
} from '@react-spring/web';
import './App.css';

/* ---------------------------------------------------------------------- */
/*  Content                                                                */
/* ---------------------------------------------------------------------- */

const researchInfo = {
  title: 'About This Research',
  content: [
    'This study experimentally compares animation rendering performance across React, Vue.js, Svelte, and Angular frameworks.',
    'A single animated UI element is used under identical controlled conditions to isolate framework-level rendering differences.',
    'Performance metrics are collected using Chrome DevTools including FPS, dropped frames, paint time, compositing cost, CPU usage, and bundle size.',
    'The study aims to provide empirical evidence to guide developers in selecting frameworks for animation-heavy landing pages.',
  ],
};

const learnMore = {
  title: 'Research Methodology',
  content: [
    'Independent Variable: JavaScript Framework (React, Vue.js, Svelte, Angular)',
    'Dependent Variables: Average FPS, Dropped Frames, Paint Time, Compositing Time, CPU Usage, Bundle Size',
    'Controlled Variables: Same CSS animation, same browser (Chrome), same hardware, same animation duration and easing',
    'Data Collection: Chrome DevTools Performance Panel — minimum 30 recordings per framework',
    'Analysis: Statistical comparison using averages, standard deviation and cross-framework performance ranking',
  ],
};

const headingWords = ['Animation', 'Performance', 'Benchmark', '✦'];
// duplicated once so the marquee track can loop seamlessly at -50%
const marqueeWords = [...headingWords, ...headingWords];

const descLines = [
  'A controlled experimental study comparing animation rendering',
  'performance across React, Vue.js, Svelte and Angular frameworks.',
];

/* ---------------------------------------------------------------------- */
/*  Small helpers                                                         */
/* ---------------------------------------------------------------------- */

function useCountUp(target, duration = 1300, startDelay = 1400) {
  const [value, setValue] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let raf;
    const t = setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        setValue(Math.round(eased * target));
        if (p < 1) raf = requestAnimationFrame(tick);
        else setDone(true);
      };
      raf = requestAnimationFrame(tick);
    }, startDelay);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [target, duration, startDelay]);
  return { value, done };
}

function CountStat({ target, suffix = '', label, delayMs }) {
  const { value, done } = useCountUp(target, 1200, delayMs);
  const style = useSpringWeb({
    from: { opacity: 0, y: 18 },
    to: { opacity: 1, y: 0 },
    delay: delayMs,
    config: { tension: 200, friction: 20 },
  });
  return (
    <animatedWeb.div className="stat" style={{ opacity: style.opacity, transform: style.y.to((v) => `translateY(${v}px)`) }}>
      <span className={`stat-number${done ? ' glow-done' : ''}`}>{value}{suffix}</span>
      <span className="stat-label">{label}</span>
    </animatedWeb.div>
  );
}

/** Magnetic, spring-driven button — replaces the framer-motion version from earlier levels. */
function MagneticButton({ className, onClick, children }) {
  const ref = useRef(null);
  const [style, api] = useSpringWeb(() => ({
    x: 0, y: 0, scale: 1,
    config: { tension: 300, friction: 18 },
  }));

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) * 0.25;
    const dy = (e.clientY - rect.top - rect.height / 2) * 0.25;
    api.start({ x: dx, y: dy });
  };
  const handleEnter = () => api.start({ scale: 1.05 });
  const handleLeave = () => api.start({ x: 0, y: 0, scale: 1 });
  const handleDown = () => api.start({ scale: 0.92 });
  const handleUp = () => api.start({ scale: 1.05 });

  return (
    <animatedWeb.button
      ref={ref}
      className={className}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      style={{
        transform: style.x.to((x) => `translate(${x}px, ${style.y.get()}px) scale(${style.scale.get()})`),
      }}
    >
      {children}
    </animatedWeb.button>
  );
}

/* ---------------------------------------------------------------------- */
/*  3D hero object — draggable realistic globe with automatic rotation    */
/*  (plain three.js, no @react-three/fiber)                              */
/* ---------------------------------------------------------------------- */

function ThreeScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 1;
    let height = container.clientHeight || 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.cursor = 'grab';
    container.appendChild(renderer.domElement);

    // --- Create a realistic globe with continents and atmosphere ---

    // 1. Core sphere (Earth-like)
    const geometry = new THREE.SphereGeometry(1.35, 64, 64);
    
    // Load a realistic earth texture (using a free high-res texture)
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
    const earthSpecularMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');
    const earthNormalMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg');
    const cloudMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');

    const material = new THREE.MeshPhongMaterial({
      map: earthMap,
      specularMap: earthSpecularMap,
      specular: new THREE.Color('grey'),
      shininess: 10,
      normalMap: earthNormalMap,
      normalScale: new THREE.Vector2(0.8, 0.8),
    });
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // 2. Cloud layer (slightly larger, transparent, rotating at different speed)
    const cloudGeometry = new THREE.SphereGeometry(1.36, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudMap,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);

    // 3. Atmosphere glow (outer shell)
    const glowGeometry = new THREE.SphereGeometry(1.42, 64, 64);
    const glowMaterial = new THREE.MeshPhongMaterial({
      color: '#4f46e5',
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);

    // 4. Starfield background (particles)
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    const starPositions = new Float32Array(starsCount * 3);
    const starSizes = new Float32Array(starsCount);
    for (let i = 0; i < starsCount; i++) {
      const radius = 10 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);
      starSizes[i] = 0.02 + Math.random() * 0.06;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    const starsMaterial = new THREE.PointsMaterial({
      color: '#ffffff',
      size: 0.05,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // 5. Lighting
    scene.add(new THREE.AmbientLight(0x222244, 0.4));
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);
    const backLight = new THREE.DirectionalLight(0x8888ff, 0.4);
    backLight.position.set(-3, -1, -5);
    scene.add(backLight);
    const rimLight = new THREE.DirectionalLight(0x4466ff, 0.3);
    rimLight.position.set(-2, 4, -3);
    scene.add(rimLight);

    // --- Interaction state ---
    let rotY = 0;
    let rotX = 0.35;
    let curScale = 1;
    let targetScale = 1;
    let dragging = false;
    let last = { x: 0, y: 0 };
    let disposed = false;
    let autoRotate = true;

    // --- Event handlers ---
    const onPointerDown = (e) => {
      dragging = true;
      autoRotate = false;
      last = { x: e.clientX, y: e.clientY };
      targetScale = 1.06;
      renderer.domElement.style.cursor = 'grabbing';
    };
    const onPointerMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      rotY += dx * 0.008;
      rotX += dy * 0.008;
      // Clamp vertical rotation
      rotX = Math.max(-1.2, Math.min(1.2, rotX));
    };
    const onPointerUp = () => {
      dragging = false;
      targetScale = 1;
      renderer.domElement.style.cursor = 'grab';
      // Resume auto-rotation after a delay
      setTimeout(() => { autoRotate = true; }, 3000);
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // --- Animation loop ---
    let lastTime = performance.now();
    let raf;
    const animate = (time) => {
      if (disposed) return;
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Auto-rotate when not dragging
      if (!dragging && autoRotate) {
        rotY += delta * 0.15; // slow automatic rotation
      }

      // Apply rotations
      earth.rotation.x = rotX;
      earth.rotation.y = rotY;
      clouds.rotation.x = rotX;
      clouds.rotation.y = rotY + delta * 0.02; // clouds drift slightly
      glow.rotation.x = rotX;
      glow.rotation.y = rotY;

      // Scale spring
      const ease = Math.min(delta * 8, 1);
      curScale += (targetScale - curScale) * ease;
      earth.scale.setScalar(curScale);
      clouds.scale.setScalar(curScale);
      glow.scale.setScalar(curScale);

      // Rotate star field slowly
      starField.rotation.y += delta * 0.005;
      starField.rotation.x += delta * 0.002;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    // --- Resize handler ---
    const handleResize = () => {
      width = container.clientWidth || 1;
      height = container.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // --- Cleanup ---
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      
      // Dispose geometries and materials
      geometry.dispose();
      material.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
      renderer.dispose();
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

/** Catches WebGL failures (e.g. no WebGL support, context lost) so the
 *  whole page doesn't unmount to a blank screen — only this panel degrades. */
class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.error('3D scene failed to render:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#c4b5fd', fontSize: '0.85rem', textAlign: 'center', padding: '24px',
        }}>
          3D preview unavailable in this browser.
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------------------------------------------------------------------- */
/*  Page                                                                   */
/* ---------------------------------------------------------------------- */

function Level5() {
  const [modal, setModal] = useState(null);
  const openResearchModal = () => setModal(researchInfo);
  const openLearnMoreModal = () => setModal(learnMore);
  const closeModal = () => setModal(null);

  const stars = useMemo(
    () => Array.from({ length: 45 }, (_, i) => ({
      id: i,
      left: `${(i * 47) % 100}%`,
      top: `${(i * 29) % 100}%`,
      delay: `${(i % 9) * 0.4}s`,
      duration: `${3 + (i % 4)}s`,
    })),
    []
  );

  const navStyle = useSpringWeb({ from: { y: -80, opacity: 0 }, to: { y: 0, opacity: 1 }, config: { tension: 120, friction: 16 } });
  const badgeStyle = useSpringWeb({ from: { opacity: 0, y: -12 }, to: { opacity: 1, y: 0 }, delay: 300 });
  const tagStyle = useSpringWeb({ from: { opacity: 0, y: 12 }, to: { opacity: 1, y: 0 }, delay: 900 });
  const [subStyles] = useSpringsWeb(descLines.length, (i) => ({ from: { opacity: 0 }, to: { opacity: 1 }, delay: 1050 + i * 180 }));
  const buttonsStyle = useSpringWeb({ from: { opacity: 0, y: 16 }, to: { opacity: 1, y: 0 }, delay: 1500 });
  const sceneStyle = useSpringWeb({ from: { opacity: 0, scale: 0.85 }, to: { opacity: 1, scale: 1 }, delay: 500, config: { tension: 90, friction: 16 } });
  const labelStyle = useSpringWeb({ from: { opacity: 0 }, to: { opacity: 1 }, delay: 1200 });
  const footerStyle = useSpringWeb({ from: { opacity: 0, y: 30 }, to: { opacity: 1, y: 0 }, config: { tension: 100, friction: 20 } });

  const transitions = useTransition(modal, {
    from: { opacity: 0, transform: 'scale(0.75) translateY(20px)' },
    enter: { opacity: 1, transform: 'scale(1) translateY(0px)' },
    leave: { opacity: 0, transform: 'scale(0.85) translateY(10px)' },
    config: { tension: 260, friction: 22 },
  });

  return (
    <div className="page">
      {transitions((style, item) => item && (
        <animatedWeb.div className="modal-overlay" style={{ opacity: style.opacity }} onClick={closeModal}>
          <animatedWeb.div className="modal-box" style={{ transform: style.transform }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{item.title}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {item.content.map((line, idx) => (
                <div className="modal-item" key={idx}>
                  <span className="modal-dot">▸</span>
                  <p>{line}</p>
                </div>
              ))}
            </div>
          </animatedWeb.div>
        </animatedWeb.div>
      ))}

      <animatedWeb.nav
        className="navbar"
        style={{ opacity: navStyle.opacity, transform: navStyle.y.to((v) => `translateY(${v}px)`) }}
      >
        <div className="brand">
          <span className="brand-dot"></span>
          AnimBench
        </div>
        <div className="level-badge" style={{ background: 'linear-gradient(135deg, #db2777, #7c3aed)', boxShadow: '0 2px 14px rgba(219,39,119,0.4)' }}>
          Level 5 — Immersive 3D
        </div>
      </animatedWeb.nav>

      <section className="hero">
        <div className="nebula"><span /><span /><span /></div>
        <div className="star-field">
          {stars.map((s) => (
            <span
              key={s.id}
              className="star"
              style={{ left: s.left, top: s.top, animationDelay: s.delay, animationDuration: s.duration }}
            />
          ))}
        </div>

        {/* Full width marquee section */}
        <div className="marquee-section">
          <animatedWeb.p className="badge" style={badgeStyle}>🔬 Research Project — SUSL</animatedWeb.p>

          <div className="marquee-heading">
            <div className="marquee-track">
              {marqueeWords.map((word, i) => (
                <h1 key={i}>
                  <span className={word === 'Performance' ? 'highlight' : undefined}>{word}</span>
                </h1>
              ))}
            </div>
          </div>
        </div>

        {/* Content row below marquee */}
        <div className="content-row">
          <div className="hero-left">
            <animatedWeb.p className="level-tag" style={tagStyle}>
              🪐 Level 5: Marquee typography · Draggable 3D scene · plain three.js + react-spring
            </animatedWeb.p>

            <div className="hero-sub">
              {descLines.map((line, i) => (
                <animatedWeb.p key={i} style={subStyles[i]}>{line}</animatedWeb.p>
              ))}
            </div>

            <animatedWeb.div className="hero-buttons" style={buttonsStyle}>
              <MagneticButton className="btn-primary" onClick={openResearchModal}>View Research</MagneticButton>
              <MagneticButton className="btn-secondary" onClick={openLearnMoreModal}>Learn More</MagneticButton>
            </animatedWeb.div>

            <div className="hero-stats">
              <CountStat target={4} label="Frameworks" delayMs={1650} />
              <CountStat target={7} label="Metrics" delayMs={1800} />
              <CountStat target={30} suffix="+" label="Test Runs" delayMs={1950} />
            </div>
          </div>

          <div className="hero-right">
            <animatedWeb.div className="scene-wrap" style={sceneStyle}>
              <SceneErrorBoundary>
                <ThreeScene />
              </SceneErrorBoundary>
              <span className="scene-hint">drag to rotate</span>
            </animatedWeb.div>
            <animatedWeb.p className="logo-label" style={labelStyle}>⚡ Animated Test Element</animatedWeb.p>
          </div>
        </div>
      </section>

      <animatedWeb.footer
        className="footer"
        style={{ opacity: footerStyle.opacity, transform: footerStyle.y.to((v) => `translateY(${v}px)`) }}
      >
        <div className="footer-inner">
          <div className="footer-brand"><span className="brand-dot"></span>AnimBench</div>
          <p>IS 8101 Research Project in Information Systems</p>
          <p>Department of Computing & Information Systems</p>
          <p>Sabaragamuwa University of Sri Lanka</p>
          <p className="footer-copy">© 2025 S. Niluxshan — 20APC4681</p>
        </div>
      </animatedWeb.footer>
    </div>
  );
}

export default Level5;