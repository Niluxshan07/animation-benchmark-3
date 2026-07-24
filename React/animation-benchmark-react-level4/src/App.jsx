import { Component, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import './App.css';

/* ─── Error Boundary ─────────────────────────────────────────────────────── */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError)
      return <div className="error-fallback">Animation could not be loaded.</div>;
    return this.props.children;
  }
}

/* ─── Constants ──────────────────────────────────────────────────────────── */
const LEVEL_BADGE_STYLE = {
  background: 'linear-gradient(135deg, #f472b6, #7c3aed)',
  color: 'white',
  padding: '6px 18px',
  borderRadius: '20px',
  fontSize: '0.85rem',
  fontWeight: '700',
  boxShadow: '0 2px 14px rgba(124,58,237,0.4)',
};
const LEVEL_TAG_STYLE = {
  background: '#fdf2f8',
  color: '#be185d',
  border: '1px solid #fbcfe8',
  padding: '6px 14px',
  borderRadius: '20px',
  fontSize: '0.83rem',
  fontWeight: '600',
  marginBottom: '18px',
};

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

/* ─── RAF count-up hook ──────────────────────────────────────────────────── */
function useCountUp(target, duration = 1200, startDelay = 900) {
  const [value, setValue] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let raf;
    const timer = setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) raf = requestAnimationFrame(tick);
        else setDone(true);
      };
      raf = requestAnimationFrame(tick);
    }, startDelay);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [target, duration, startDelay]);
  return { value, done };
}

/* ─── Elastic-stretch stat with Framer Motion spring ─────────────────────── */
function CountStat({ target, suffix = '', label, delayMs }) {
  const { value, done } = useCountUp(target, 1100, delayMs);
  return (
    <motion.div
      className="stat"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delayMs / 1000, duration: 0.5 }}
    >
      <motion.span
        key={value}
        className={`stat-number elastic-stretch${done ? ' glow-done' : ''}`}
        initial={{ scaleY: 1.55, scaleX: 0.72 }}
        animate={{ scaleY: 1, scaleX: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 9 }}
      >
        {value}{suffix}
      </motion.span>
      <span className="stat-label">{label}</span>
    </motion.div>
  );
}

/* ─── Magnetic button ────────────────────────────────────────────────────── */
function MagneticButton({ className, onClick, children }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      className={className}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 12 }}
    >
      {children}
    </motion.button>
  );
}

/* ─── Tilt card ──────────────────────────────────────────────────────────── */
function TiltCard({ className, children, initialX = 0 }) {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 14 });
  const sry = useSpring(ry, { stiffness: 150, damping: 14 });

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 6);
    rx.set(-py * 6);
  };
  const handleLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      ref={ref}
      className={`${className} tilt-card`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX: srx, rotateY: sry }}
      initial={{ opacity: 0, x: initialX }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 90, damping: 16, delay: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Heading words & scramble glyphs ───────────────────────────────────── */
const headingWords = ['Animation', 'Performance', 'Benchmark'];
const descLines = [
  'A controlled experimental study comparing animation rendering',
  'performance across React, Vue.js, Svelte and Angular frameworks.',
];
const SCRAMBLE_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=';

/* ─── App ────────────────────────────────────────────────────────────────── */
function App() {
  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => { if (e.key === 'Escape') setModal(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modal]);

  const openResearchModal = () => setModal(researchInfo);
  const openLearnMoreModal = () => setModal(learnMore);
  const closeModal = () => setModal(null);

  const heroRef = useRef(null);
  const headingRef = useRef(null);

  /* ── L5 typography: GSAP letter scramble + 3D entrance ── */
  useEffect(() => {
    const scrambleIntervals = [];
    const ctx = gsap.context(() => {
      const letters = headingRef.current.querySelectorAll('.letter');
      const originals = Array.from(letters).map((el) => el.textContent);

      letters.forEach((el, i) => {
        if (originals[i] === ' ') return;
        let ticks = 0;
        const maxTicks = 8 + (i % 4);
        const id = setInterval(() => {
          ticks += 1;
          if (ticks >= maxTicks) {
            el.textContent = originals[i];
            clearInterval(id);
          } else {
            el.textContent = SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
          }
        }, 45);
        scrambleIntervals.push(id);
      });

      gsap.fromTo(
        letters,
        { opacity: 0, y: 36, rotateX: -85, transformPerspective: 500 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.65,
          ease: 'back.out(1.6)',
          stagger: 0.035,
          delay: 0.5,
          onComplete: () => {
            gsap.to(letters, {
              y: -5,
              duration: 1.4,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
              stagger: { each: 0.08, from: 'start' },
            });
          },
        }
      );
    }, heroRef);

    return () => {
      scrambleIntervals.forEach(clearInterval);
      ctx.revert();
    };
  }, []);

  return (
    <div className="page">
      {/* ── Modal ── */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="modal-overlay"
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-box"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              <div className="modal-header">
                <h2 id="modal-title">{modal.title}</h2>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  className="modal-close"
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  ✕
                </motion.button>
              </div>
              <div className="modal-body">
                {modal.content.map((item, idx) => (
                  <motion.div
                    className="modal-item"
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                  >
                    <span className="modal-dot">▸</span>
                    <p>{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navbar ── */}
      <motion.nav
        className="navbar"
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 16 }}
      >
        <div className="brand">
          <span className="brand-dot" aria-hidden="true"></span>
          AnimBench
        </div>
        <motion.div
          className="level-badge"
          style={LEVEL_BADGE_STYLE}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Level 4 — Interactive Premium
        </motion.div>
      </motion.nav>

      {/* ── Hero ── */}
      <ErrorBoundary>
        <section className="hero" ref={heroRef}>
          {/* Aurora background blobs */}
          <div className="aurora" aria-hidden="true">
            <span /><span /><span />
          </div>

          <TiltCard className="hero-left" initialX={-60}>
            <motion.p
              className="badge"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              🔬 Research Project — SUSL
            </motion.p>

            {/* L5 typography: per-letter spans for GSAP scramble */}
            <h1 ref={headingRef} style={{ perspective: 600 }}>
              {headingWords.map((word) => (
                <span
                  key={word}
                  className={`word${word === 'Performance' ? ' highlight' : ''}`}
                >
                  {word.split('').map((ch, ci) => (
                    <span key={ci} className="letter">{ch}</span>
                  ))}
                </span>
              ))}
            </h1>

            <motion.p
              className="level-tag"
              style={LEVEL_TAG_STYLE}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: [10, -4, 0] }}
              transition={{ delay: 0.9, duration: 0.6 }}
              whileHover={{ scale: 1.08, y: -3 }}
            >
              🚀 Level 4: Spring physics · Bounce · Elastic motion · GSAP scramble
            </motion.p>

            <div className="hero-sub">
              {descLines.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.05 + i * 0.2, duration: 0.5 }}
                >
                  {line}
                </motion.p>
              ))}
            </div>

            <motion.div
              className="hero-buttons"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              <MagneticButton className="btn-primary" onClick={openResearchModal}>
                View Research
              </MagneticButton>
              <MagneticButton className="btn-secondary" onClick={openLearnMoreModal}>
                Learn More
              </MagneticButton>
            </motion.div>

            <div className="hero-stats">
              <CountStat target={4}  label="Frameworks" delayMs={1650} />
              <CountStat target={7}  label="Metrics"    delayMs={1800} />
              <CountStat target={30} suffix="+" label="Test Runs" delayMs={1950} />
            </div>
          </TiltCard>

          <TiltCard className="hero-right" initialX={60}>
            <div className="logo-wrapper">
              <div className="ring ring-1"></div>
              <div className="ring ring-2"></div>
              <div className="ring ring-3"></div>
              <motion.div
                className="animated-logo"
                animate={{
                  scale: [1, 1.15, 1],
                  rotate: [0, 15, 0],
                  boxShadow: [
                    '0 0 40px rgba(79,70,229,0.4)',
                    '0 0 60px rgba(124,58,237,0.7)',
                    '0 0 40px rgba(79,70,229,0.4)',
                  ],
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ scale: 1.25, rotate: 20 }}
              />
            </div>
            <motion.p
              className="logo-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              whileHover={{ scale: 1.06, y: -2 }}
            >
              ⚡ Animated Test Element
            </motion.p>
          </TiltCard>
        </section>
      </ErrorBoundary>

      {/* ── Footer ── */}
      <motion.footer
        className="footer"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
      >
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand-dot" aria-hidden="true"></span>
            AnimBench
          </div>
          <p>IS 8101 Research Project in Information Systems</p>
          <p>Department of Computing &amp; Information Systems</p>
          <p>Sabaragamuwa University of Sri Lanka</p>
          <p className="footer-copy">© 2025 S. Niluxshan — 20APC4681</p>
        </div>
      </motion.footer>
    </div>
  );
}

export default App;
