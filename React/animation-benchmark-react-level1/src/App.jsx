import { Component, useEffect, useState } from 'react';
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
const LEVEL_BADGE_TEXT = 'Level 1 — Basic CSS Transitions';
const LEVEL_BADGE_STYLE = {
  background: '#16a34a',
  color: 'white',
  padding: '6px 18px',
  borderRadius: '20px',
  fontSize: '0.85rem',
  fontWeight: '700',
};
const LEVEL_TAG_TEXT =
  '⚙ Level 1: Basic CSS transitions · Minimal GPU usage · Simple keyframe animations';
const LEVEL_TAG_STYLE = {
  background: '#f0fdf4',
  color: '#16a34a',
  border: '1px solid #bbf7d0',
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

/* ─── App ────────────────────────────────────────────────────────────────── */
function App() {
  const [modal, setModal] = useState(null);

  // Escape key closes modal
  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => { if (e.key === 'Escape') setModal(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modal]);

  const openResearchModal = () => setModal(researchInfo);
  const openLearnMoreModal = () => setModal(learnMore);
  const closeModal = () => setModal(null);

  return (
    <div className="page">
      {/* ── Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="modal-title">{modal.title}</h2>
              <button className="modal-close" onClick={closeModal} aria-label="Close modal">
                ✕
              </button>
            </div>
            <div className="modal-body">
              {modal.content.map((item, idx) => (
                <div className="modal-item" key={idx}>
                  <span className="modal-dot">▸</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="brand">
          <span className="brand-dot" aria-hidden="true"></span>
          AnimBench
        </div>
        <div className="level-badge" style={LEVEL_BADGE_STYLE}>{LEVEL_BADGE_TEXT}</div>
      </nav>

      {/* ── Hero ── */}
      <ErrorBoundary>
        <section className="hero">
          <div className="hero-left">
            <p className="badge">🔬 Research Project — SUSL</p>
            <h1>
              Animation <span className="highlight">Performance</span> Benchmark
            </h1>
            <p className="level-tag" style={LEVEL_TAG_STYLE}>{LEVEL_TAG_TEXT}</p>
            <p className="hero-sub">
              A controlled experimental study comparing animation rendering
              performance across React, Vue.js, Svelte and Angular frameworks.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={openResearchModal}>
                View Research
              </button>
              <button className="btn-secondary" onClick={openLearnMoreModal}>
                Learn More
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">4</span>
                <span className="stat-label">Frameworks</span>
              </div>
              <div className="stat">
                <span className="stat-number">7</span>
                <span className="stat-label">Metrics</span>
              </div>
              <div className="stat">
                <span className="stat-number">30+</span>
                <span className="stat-label">Test Runs</span>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="logo-wrapper">
              <div className="ring ring-1"></div>
              <div className="ring ring-2"></div>
              <div className="ring ring-3"></div>
              <div className="animated-logo"></div>
            </div>
            <p className="logo-label">⚡ Animated Test Element</p>
          </div>
        </section>
      </ErrorBoundary>

      {/* ── Footer ── */}
      <footer className="footer">
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
      </footer>
    </div>
  );
}

export default App;
