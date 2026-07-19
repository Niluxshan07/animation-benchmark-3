import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import './App.css';

const levelBadgeStyle = {
  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
  color: 'white',
  padding: '6px 18px',
  borderRadius: '20px',
  fontSize: '0.85rem',
  fontWeight: '700',
  boxShadow: '0 2px 12px rgba(124,58,237,0.4)',
};
const levelTagStyle = {
  background: '#fdf4ff',
  color: '#7c3aed',
  border: '1px solid #e9d5ff',
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

function useCountUp(target, duration = 1400, startDelay = 1600) {
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
  const { value, done } = useCountUp(target, 1300, delayMs);
  return (
    <motion.div
      className="stat"
      initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay: delayMs / 1000, duration: 0.6 }}
    >
      <span className={`stat-number${done ? ' glow-done' : ''}`}>{value}{suffix}</span>
      <span className="stat-label">{label}</span>
    </motion.div>
  );
}

function MagneticButton({ className, onClick, children }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 14 });
  const sy = useSpring(y, { stiffness: 180, damping: 14 });
  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
    ref.current.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    ref.current.style.setProperty('--my', `${e.clientY - rect.top}px`);
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
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.06, boxShadow: '0 10px 32px rgba(124,58,237,0.55)' }}
      transition={{ type: 'spring', stiffness: 380, damping: 12 }}
    >
      {children}
    </motion.button>
  );
}

const headingWords = ['Animation', 'Performance', 'Benchmark'];
const descLines = [
  'A controlled experimental study comparing animation rendering',
  'performance across React, Vue.js, Svelte and Angular frameworks.',
];

function Level4() {
  const [modal, setModal] = useState(null);
  const openResearchModal = () => setModal(researchInfo);
  const openLearnMoreModal = () => setModal(learnMore);
  const closeModal = () => setModal(null);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const circleY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const headingRef = useRef(null);
  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);
  const ring3Ref = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const letters = headingRef.current.querySelectorAll('.letter');

      gsap.fromTo(
        letters,
        { opacity: 0, y: 42, rotateX: -90, transformPerspective: 500 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.7,
          ease: 'back.out(1.6)',
          stagger: 0.035,
          delay: 0.7,
          onComplete: () => {
            gsap.to(letters, {
              y: -6,
              duration: 1.4,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
              stagger: { each: 0.08, from: 'start' },
            });
          },
        }
      );

      gsap.to(ring1Ref.current, { rotation: 360, duration: 20, repeat: -1, ease: 'none' });
      gsap.to(ring2Ref.current, { rotation: -360, duration: 16, repeat: -1, ease: 'none' });
      gsap.to(ring3Ref.current, { rotation: 360, duration: 12, repeat: -1, ease: 'none' });

      gsap.to(logoRef.current, {
        scale: 1.18,
        duration: 1.3,
        repeat: -1,
        yoyo: true,
        ease: 'elastic.out(1, 0.45)',
        delay: 1,
      });
      gsap.to(logoRef.current, {
        boxShadow: '0 0 55px rgba(124,58,237,0.85)',
        duration: 1.3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleLogoEnter = () => gsap.to(logoRef.current, { scale: 1.32, rotate: '+=25', duration: 0.4, ease: 'power2.out' });
  const handleLogoLeave = () => gsap.to(logoRef.current, { scale: 1, rotate: '+=0', duration: 0.5, ease: 'elastic.out(1, 0.5)' });

  return (
    <div className="page">
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
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.7, rotate: -4, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.85, filter: 'blur(4px)' }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
            >
              <div className="modal-header">
                <h2>{modal.title}</h2>
                <motion.button whileHover={{ rotate: 90, scale: 1.08 }} className="modal-close" onClick={closeModal}>✕</motion.button>
              </div>
              <div className="modal-body">
                {modal.content.map((item, idx) => (
                  <motion.div
                    className="modal-item"
                    key={idx}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.07 }}
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

      <motion.nav
        className="navbar"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 110, damping: 15, delay: 0.1 }}
      >
        <div className="brand">
          <motion.span
            className="brand-dot"
            animate={{ scale: [1, 1.6, 1], boxShadow: ['0 0 0px #4f46e5', '0 0 14px #4f46e5', '0 0 0px #4f46e5'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          />
          AnimBench
        </div>
        <motion.div
          className="level-badge"
          style={levelBadgeStyle}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 16 }}
        >
          Level 4 — Cinematic
        </motion.div>
      </motion.nav>

      <section className="hero" ref={heroRef}>
        <div className="aurora"><span /><span /><span /></div>

        <div className="hero-left" style={{ position: 'relative', zIndex: 2 }}>
          <motion.p
            className="badge"
            initial={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            🔬 Research Project — SUSL
          </motion.p>

          <h1 ref={headingRef} style={{ perspective: 500 }}>
            {headingWords.map((word) => (
              <span
                key={word}
                className={`word${word === 'Performance' ? ' highlight' : ''}`}
                style={{ display: 'inline-block', marginRight: '0.28em' }}
              >
                {word.split('').map((ch, ci) => (
                  <span key={ci} className="letter" style={{ display: 'inline-block' }}>{ch}</span>
                ))}
              </span>
            ))}
          </h1>

          <motion.p
            className="level-tag"
            style={levelTagStyle}
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 1.5, duration: 0.55 }}
            whileHover={{ scale: 1.08, y: -3, boxShadow: '0 6px 18px rgba(124,58,237,0.3)' }}
          >
            🎬 Level 4: Cinematic effects · Drop shadows · Blur · Smooth GPU transitions
          </motion.p>

          <div className="hero-sub">
            {descLines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, filter: 'blur(5px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ delay: 1.7 + i * 0.2, duration: 0.5 }}
              >
                {line}
              </motion.p>
            ))}
          </div>

          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.15 }}
          >
            <MagneticButton className="btn-primary" onClick={openResearchModal}>View Research</MagneticButton>
            <MagneticButton className="btn-secondary" onClick={openLearnMoreModal}>Learn More</MagneticButton>
          </motion.div>

          <div className="hero-stats">
            <CountStat target={4} label="Frameworks" delayMs={2350} />
            <CountStat target={7} label="Metrics" delayMs={2500} />
            <CountStat target={30} suffix="+" label="Test Runs" delayMs={2650} />
          </div>
        </div>

        <motion.div
          className="hero-right"
          style={{ position: 'relative', zIndex: 2, y: circleY }}
          initial={{ opacity: 0, x: 70 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, type: 'spring', stiffness: 80, damping: 15 }}
        >
          <div className="logo-wrapper">
            <div className="ring ring-1" ref={ring1Ref}></div>
            <div className="ring ring-2" ref={ring2Ref}></div>
            <div className="ring ring-3" ref={ring3Ref}></div>
            <div
              className="animated-logo"
              ref={logoRef}
              onMouseEnter={handleLogoEnter}
              onMouseLeave={handleLogoLeave}
            ></div>
          </div>
          <motion.p
            className="logo-label"
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ delay: 1.7 }}
            whileHover={{ scale: 1.08, y: -2 }}
          >
            ⚡ Animated Test Element
          </motion.p>
        </motion.div>
      </section>

      <motion.footer
        className="footer"
        initial={{ opacity: 0, scale: 0.96, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="footer-inner">
          <div className="footer-brand"><span className="brand-dot"></span>AnimBench</div>
          <p>IS 8101 Research Project in Information Systems</p>
          <p>Department of Computing & Information Systems</p>
          <p>Sabaragamuwa University of Sri Lanka</p>
          <p className="footer-copy">© 2025 S. Niluxshan — 20APC4681</p>
        </div>
      </motion.footer>
    </div>
  );
}

export default Level4;