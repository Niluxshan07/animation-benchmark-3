import { useEffect, useState } from 'react';
import './App.css';

const levelBadgeText = 'Level 5 — Cinematic';
const levelBadgeStyle = {
  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
  color: 'white',
  padding: '6px 18px',
  borderRadius: '20px',
  fontSize: '0.85rem',
  fontWeight: '700',
  boxShadow: '0 2px 12px rgba(124,58,237,0.4)',
};
const levelTagText = '🎬 Level 5: Cinematic effects · Drop shadows · Blur · Smooth GPU transitions';
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

const ANIMATION_CSS = `
      @keyframes dotPulseCinematic {
        0%, 100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 0px #4f46e5); }
        50% { transform: scale(1.6); opacity: 0.5; filter: drop-shadow(0 0 20px #4f46e5); }
      }
      @keyframes ringPulseCinematic {
        0%, 100% { transform: scale(1); opacity: 0.2; filter: blur(0px); }
        50% { transform: scale(1.15); opacity: 0.6; filter: blur(1px); }
      }
      @keyframes logoPulseCinematic {
        0%   { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 10px rgba(79,70,229,0.4)); }
        25%  { transform: rotate(90deg) scale(1.2); filter: drop-shadow(0 0 20px rgba(79,70,229,0.6)); }
        50%  { transform: rotate(180deg) scale(1.5); filter: drop-shadow(0 0 35px rgba(79,70,229,0.8)); }
        75%  { transform: rotate(270deg) scale(1.2); filter: drop-shadow(0 0 20px rgba(79,70,229,0.6)); }
        100% { transform: rotate(360deg) scale(1); filter: drop-shadow(0 0 10px rgba(79,70,229,0.4)); }
      }
      @keyframes modalCinematic {
        0%   { transform: scale(0.7) rotate(-5deg); opacity: 0; filter: blur(6px); }
        60%  { transform: scale(1.03) rotate(1deg); opacity: 1; filter: blur(0); }
        100% { transform: scale(1) rotate(0deg); opacity: 1; filter: blur(0); }
      }
      @keyframes navGlow {
        0%, 100% { box-shadow: 0 2px 20px rgba(0,0,0,0.3); }
        50%       { box-shadow: 0 2px 30px rgba(79,70,229,0.25); }
      }
      .brand-dot { animation: dotPulseCinematic 2s cubic-bezier(0.34,1.56,0.64,1) infinite; will-change: transform, filter; }
      .ring-1 { animation: ringPulseCinematic 3s cubic-bezier(0.68,-0.55,0.265,1.55) infinite 0s; will-change: transform, filter; }
      .ring-2 { animation: ringPulseCinematic 3s cubic-bezier(0.68,-0.55,0.265,1.55) infinite 0.5s; will-change: transform, filter; }
      .ring-3 { animation: ringPulseCinematic 3s cubic-bezier(0.68,-0.55,0.265,1.55) infinite 1s; will-change: transform, filter; }
      .animated-logo {
        animation: logoPulseCinematic 2s ease-in-out infinite;
        transition: all 0.3s cubic-bezier(0.68,-0.55,0.265,1.55);
        will-change: transform, filter;
      }
      .animated-logo:hover {
        transform: scale(1.1) rotate(5deg) !important;
        filter: drop-shadow(0 0 30px rgba(79,70,229,0.9)) !important;
        animation-play-state: paused;
      }
      .navbar { animation: navGlow 4s ease-in-out infinite; }
      .modal-box { animation: modalCinematic 0.5s cubic-bezier(0.34,1.56,0.64,1); }
      .btn-primary {
        transition: background 0.3s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
        box-shadow: 0 4px 14px rgba(79,70,229,0.3);
      }
      .btn-primary:hover { transform: translateY(-3px) scale(1.04); box-shadow: 0 8px 28px rgba(79,70,229,0.5); }
      .btn-secondary { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
      .btn-secondary:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(79,70,229,0.25); }
`;

function App() {
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.id = 'dynamic-animations';
    document.head.appendChild(styleElement);
    styleElement.textContent = ANIMATION_CSS;

    return () => {
      styleElement.remove();
    };
  }, []);

  const openResearchModal = () => setModal(researchInfo);
  const openLearnMoreModal = () => setModal(learnMore);
  const closeModal = () => setModal(null);

  return (
    <div className="page">
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal.title}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
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
      <nav className="navbar">
        <div className="brand">
          <span className="brand-dot"></span>
          AnimBench
        </div>
        <div className="level-badge" style={levelBadgeStyle}>{levelBadgeText}</div>
      </nav>
      <section className="hero">
        <div className="hero-left">
          <p className="badge">🔬 Research Project — SUSL</p>
          <h1>Animation <span className="highlight">Performance</span> Benchmark - React.js</h1>
          <p className="level-tag" style={levelTagStyle}>{levelTagText}</p>
          <p className="hero-sub">
            A controlled experimental study comparing animation rendering
            performance across React, Vue.js, Svelte and Angular frameworks.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={openResearchModal}>View Research</button>
            <button className="btn-secondary" onClick={openLearnMoreModal}>Learn More</button>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-number">4</span><span className="stat-label">Frameworks</span></div>
            <div className="stat"><span className="stat-number">7</span><span className="stat-label">Metrics</span></div>
            <div className="stat"><span className="stat-number">30+</span><span className="stat-label">Test Runs</span></div>
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
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand"><span className="brand-dot"></span>AnimBench</div>
          <p>IS 8101 Research Project in Information Systems</p>
          <p>Department of Computing & Information Systems</p>
          <p>Sabaragamuwa University of Sri Lanka</p>
          <p className="footer-copy">© 2025 S. Niluxshan — 20APC4681</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
