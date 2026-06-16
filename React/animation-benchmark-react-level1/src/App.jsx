import { useEffect, useState } from 'react';
import './App.css';

const levelBadgeText = 'Level 1 — Basic CSS Transitions';
const levelBadgeStyle = {
  background: '#16a34a',
  color: 'white',
  padding: '6px 18px',
  borderRadius: '20px',
  fontSize: '0.85rem',
  fontWeight: '700',
  
};
const levelTagText = '⚙ Level 1: Basic CSS transitions · Minimal GPU usage · Simple keyframe animations';
const levelTagStyle = {
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

const ANIMATION_CSS = `
      @keyframes dotPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.4); opacity: 0.7; }
      }
      @keyframes ringPulse {
        0%, 100% { transform: scale(1); opacity: 0.2; }
        50% { transform: scale(1.05); opacity: 0.4; }
      }
      @keyframes logoPulse {
        0%   { transform: rotate(0deg) scale(1); opacity: 1; }
        50%  { transform: rotate(180deg) scale(1.3); opacity: 0.6; }
        100% { transform: rotate(360deg) scale(1); opacity: 1; }
      }
      @keyframes modalIn {
        from { transform: scale(0.9); opacity: 0; }
        to   { transform: scale(1); opacity: 1; }
      }
      .brand-dot { animation: dotPulse 2s ease-in-out infinite; }
      .ring-1 { animation: ringPulse 3s ease-in-out infinite 0s; }
      .ring-2 { animation: ringPulse 3s ease-in-out infinite 0.5s; }
      .ring-3 { animation: ringPulse 3s ease-in-out infinite 1s; }
      .animated-logo { animation: logoPulse 2s ease-in-out infinite; }
      .modal-box { animation: modalIn 0.3s ease; }
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
