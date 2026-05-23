import { useState, useEffect, useRef, useCallback } from "react";

const API = "";

(() => {
  if (document.getElementById("sai-fonts")) return;
  const l = document.createElement("link");
  l.id = "sai-fonts"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Outfit:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap";
  document.head.appendChild(l);
})();

// ── Themes ─────────────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: "#1C1917", surface: "#232018", elevated: "#2D2921", overlay: "#36302A",
    border: "rgba(139,167,201,0.12)", borderHov: "rgba(139,167,201,0.25)", borderAcc: "rgba(139,167,201,0.42)",
    text: "#F5E6D3", muted: "rgba(245,230,211,0.6)", faint: "rgba(245,230,211,0.32)",
    acc: "#8BA7C9", accLt: "#A9C2DC", accDk: "#6689AD", accDim: "rgba(139,167,201,0.14)", accGlow: "rgba(139,167,201,0.22)",
    sec: "#A99DC4", secDim: "rgba(169,157,196,0.12)",
    success: "#7EB89A", successDim: "rgba(126,184,154,0.1)",
    danger: "#E06C6C", dangerDim: "rgba(224,108,108,0.1)",
    gold: "#8BA7C9", goldDim: "rgba(139,167,201,0.1)",
    shadow: "0 0 0 1px rgba(139,167,201,0.06), 0 24px 80px rgba(0,0,0,0.55)",
    shadowSm: "0 4px 20px rgba(0,0,0,0.3)",
    particleCol: "rgba(139,167,201,",
    particleCol2: "rgba(169,157,196,",
    sidebarBg: "rgba(28,25,23,0.92)",
  },
  light: {
    bg: "#f7f3e3", surface: "#fffef5", elevated: "#f0ebd0", overlay: "#e8e0c0",
    border: "rgba(0,54,49,0.08)", borderHov: "rgba(0,54,49,0.2)", borderAcc: "rgba(0,54,49,0.35)",
    text: "#003631", muted: "rgba(0,54,49,0.6)", faint: "rgba(0,54,49,0.32)",
    acc: "#003631", accLt: "#005248", accDk: "#002420", accDim: "rgba(0,54,49,0.08)", accGlow: "rgba(0,54,49,0.15)",
    sec: "#5a3e00", secDim: "rgba(90,62,0,0.08)",
    success: "#166534", successDim: "rgba(22,101,52,0.08)",
    danger: "#991b1b", dangerDim: "rgba(153,27,27,0.08)",
    gold: "#5a3e00", goldDim: "rgba(90,62,0,0.08)",
    shadow: "0 0 0 1px rgba(0,54,49,0.06), 0 24px 80px rgba(0,54,49,0.12)",
    shadowSm: "0 4px 20px rgba(0,54,49,0.08)",
    particleCol: "rgba(0,54,49,",
    particleCol2: "rgba(90,62,0,",
    sidebarBg: "rgba(247,243,227,0.7)",
  }
};

// ── Global CSS ──────────────────────────────────────────────────────────────────
const injectCSS = (theme) => {
  const t = THEMES[theme];
  const el = document.getElementById("sai-css") || (() => { const s = document.createElement("style"); s.id = "sai-css"; document.head.appendChild(s); return s; })();
  el.textContent = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body,#root{height:100%}
    body{font-family:'Outfit',sans-serif;background:${t.bg};color:${t.text};overflow:hidden;-webkit-font-smoothing:antialiased}
    ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${t.border};border-radius:2px}
    ::selection{background:${t.accDim};color:${t.acc}}
    input,textarea,button{font-family:inherit}
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideIn{from{transform:translateX(-100%);opacity:0}to{transform:translateX(0);opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
    @keyframes scoreFloat{0%{opacity:0;transform:translateX(-50%) translateY(0) scale(.8)}20%{opacity:1;transform:translateX(-50%) translateY(-20px) scale(1.05)}80%{opacity:1;transform:translateX(-50%) translateY(-32px) scale(1)}100%{opacity:0;transform:translateX(-50%) translateY(-54px) scale(.9)}}
    @keyframes pomoBlink{0%,100%{opacity:1}50%{opacity:0.4}}
    .fu{animation:fadeUp .55s cubic-bezier(.16,1,.3,1) both}
    .fi{animation:fadeIn .3s ease both}
    .si{animation:slideIn .4s cubic-bezier(.16,1,.3,1) both}
    .d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}.d4{animation-delay:.2s}
    input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer;background:transparent}
    input[type=range]::-webkit-slider-runnable-track{height:6px;border-radius:3px;background:transparent}
    input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:22px;height:22px;border-radius:50%;background:${t.acc};border:3px solid ${t.bg};margin-top:-8px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.3);transition:all .2s cubic-bezier(.16,1,.3,1);position:relative;z-index:3}
    input[type=range]:hover::-webkit-slider-thumb{transform:scale(1.15);box-shadow:0 4px 15px rgba(0,0,0,0.4),0 0 0 6px ${t.accDim}}
    input[type=range]::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:${t.acc};border:3px solid ${t.bg};cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.3)}
  `;
};

// ── Interactive Particle Background ────────────────────────────────────────────
function Background({ theme }) {
  const t = THEMES[theme];
  const ref = useRef();
  const mouse = useRef({ x: -500, y: -500 });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, animId;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    // Track mouse on the window (canvas has pointerEvents:none)
    const onMouse = (e) => { mouse.current.x = e.clientX; mouse.current.y = e.clientY; };
    window.addEventListener("mousemove", onMouse);

    // Create soft dust motes
    const COUNT = 55;
    const motes = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: 1.2 + Math.random() * 2.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.0004 + Math.random() * 0.0006,
      drift: 0.15 + Math.random() * 0.25,
      col: Math.random() > 0.4 ? 1 : 2, // 1 = primary, 2 = secondary
    }));

    const draw = (time) => {
      ctx.clearRect(0, 0, W, H);

      // ─ Ambient aurora glow blobs ─
      const blobs = [
        { x: W * 0.15, y: H * 0.25, r: 380, col: t.particleCol, phase: 0 },
        { x: W * 0.8, y: H * 0.6, r: 300, col: t.particleCol2, phase: 2 },
        { x: W * 0.5, y: H * 0.85, r: 260, col: t.particleCol, phase: 4 },
      ];
      blobs.forEach(b => {
        const breath = Math.sin(time * 0.0006 + b.phase) * 0.5 + 0.5;
        const op = 0.03 + breath * 0.04;
        const dx = Math.sin(time * 0.0003 + b.phase) * 30;
        const dy = Math.cos(time * 0.0004 + b.phase) * 20;
        const g = ctx.createRadialGradient(b.x + dx, b.y + dy, 0, b.x + dx, b.y + dy, b.r * (0.85 + breath * 0.15));
        g.addColorStop(0, b.col + op + ")");
        g.addColorStop(0.5, b.col + (op * 0.5) + ")");
        g.addColorStop(1, b.col + "0)");
        ctx.beginPath();
        ctx.arc(b.x + dx, b.y + dy, b.r * (0.85 + breath * 0.15), 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // ─ Floating dust motes with mouse interaction ─
      const mx = mouse.current.x, my = mouse.current.y;
      motes.forEach(p => {
        // Organic drift
        p.x += p.vx + Math.sin(time * p.speed + p.phase) * p.drift;
        p.y += p.vy + Math.cos(time * p.speed * 0.8 + p.phase) * p.drift * 0.7;

        // Mouse repulsion — gentle push away
        const ddx = p.x - mx, ddy = p.y - my;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < 140 && dist > 0) {
          const force = (140 - dist) / 140 * 0.8;
          p.x += (ddx / dist) * force;
          p.y += (ddy / dist) * force;
        }

        // Wrap edges with padding
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;

        // Pulsing opacity
        const pulse = Math.sin(time * 0.001 + p.phase) * 0.5 + 0.5;
        const alpha = 0.04 + pulse * 0.08;
        const col = p.col === 1 ? t.particleCol : t.particleCol2;

        // Soft glow halo
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        glow.addColorStop(0, col + (alpha * 0.5) + ")");
        glow.addColorStop(1, col + "0)");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = col + alpha + ")";
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [theme, t.particleCol, t.particleCol2]);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
}

// ── Icons ──────────────────────────────────────────────────────────────────────
const P = {
  book: "M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
  upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
  file: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6",
  card: "M2 5h20v14H2zM2 10h20",
  quiz: "M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01",
  map: "M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6zM9 3v15M15 6v15",
  chat: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  plus: "M12 5v14M5 12h14",
  x: "M18 6L6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  trophy: "M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 006 6 6 6 0 006-6V2z",
  menu: "M3 12h18M3 6h18M3 18h18",
  arrow: "M5 12h14M12 5l7 7-7 7",
  sun: "M12 7a5 5 0 100 10A5 5 0 0012 7zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42",
  moon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  sparkle: "M12 3l1.68 5.17H19l-4.58 3.33 1.75 5.38L12 14.17l-4.17 2.71 1.75-5.38L5 8.17h5.32z",
  timer: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
  play: "M5 3l14 9-14 9V3z",
  pause: "M6 4h4v16H6zM14 4h4v16h-4z",
  reset: "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15",
  coffee: "M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3",
  brand: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
};
const Ic = ({ n, size = 16, color = "currentColor", style: s }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={s}>
    <path d={P[n]} />
  </svg>
);


// Login removed as per simplified no-auth flow

// ── Settings ───────────────────────────────────────────────────────────────────
// ── Shared Components ──────────────────────────────────────────────────────────
const DragSlider = ({ label, val, min, max, onChange, fmt, color, theme, smooth = true }) => {
  const t = THEMES[theme];
  const [localVal, setLocalVal] = useState(val);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!isDragging.current) setLocalVal(val);
  }, [val]);

  const fillPct = ((localVal - min) / (max - min)) * 100;

  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: t.muted }}>{label}</span>
        <span style={{ fontFamily: "'Fira Code',monospace", fontSize: 11, color: color || t.acc, background: t.elevated, padding: "3px 10px", borderRadius: 6, border: `1px solid ${t.border}`, minWidth: 60, textAlign: "center" }}>{fmt ? fmt(Math.round(localVal)) : Math.round(localVal)}</span>
      </div>
      <div style={{ position: "relative", height: 24, display: "flex", alignItems: "center" }}>
        {/* Track Container (Clipped) */}
        <div style={{ position: "absolute", inset: "9px 0", background: t.elevated, borderRadius: 3, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${fillPct}%`, background: color || t.acc, transition: isDragging.current ? "none" : "width .2s cubic-bezier(.16,1,.3,1)" }} />
        </div>
        {/* Interaction Layer */}
        <input type="range" min={min} max={max} value={localVal} step={smooth ? 0.01 : 1} 
          onMouseDown={() => isDragging.current = true}
          onMouseUp={() => { isDragging.current = false; setLocalVal(val); }}
          onTouchStart={() => isDragging.current = true}
          onTouchEnd={() => { isDragging.current = false; setLocalVal(val); }}
          onChange={e => {
            const v = Number(e.target.value);
            setLocalVal(v);
            const rounded = Math.round(v);
            if (rounded !== val) onChange(rounded);
          }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "transparent", zIndex: 2 }} />
      </div>
    </div>
  );
};

// ── Settings ───────────────────────────────────────────────────────────────────
function Settings({ onClose, theme, setTheme, user, setUser, prefs, setPrefs }) {
  const t = THEMES[theme]; const [tab, setTab] = useState("appearance");


  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(14px)" }}>
      <div onClick={e => e.stopPropagation()} className="fu" style={{ width: 560, maxHeight: "80vh", background: t.surface, border: `1px solid ${t.border}`, borderRadius: 22, overflow: "hidden", boxShadow: t.shadow }}>
        <div style={{ padding: "20px 26px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 600 }}>Settings</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: t.muted, cursor: "pointer", display: "flex", padding: 4 }}><Ic n="x" size={16} /></button>
        </div>
        <div style={{ display: "flex", height: "calc(80vh - 65px)" }}>
          <div style={{ width: 155, borderRight: `1px solid ${t.border}`, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
            {[["appearance", "Appearance"], ["study", "Study Defaults"], ["account", "Account"]].map(([id, lbl]) => (
              <button key={id} onClick={() => setTab(id)} style={{ padding: "9px 14px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, textAlign: "left", background: tab === id ? t.accDim : "transparent", color: tab === id ? t.acc : t.muted, transition: "all .15s" }}>{lbl}</button>
            ))}
          </div>
          <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
            {tab === "appearance" && (
              <div>
                <p style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: t.faint, fontFamily: "'Fira Code',monospace", marginBottom: 16 }}>Color Theme</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {["dark", "light"].map(th => {
                    const tt = THEMES[th]; return (
                      <div key={th} onClick={() => setTheme(th)} style={{ padding: "18px 16px", borderRadius: 14, cursor: "pointer", border: `2px solid ${theme === th ? tt.acc : tt.border}`, background: th === "dark" ? tt.bg : tt.bg, transition: "all .2s", position: "relative", overflow: "hidden" }}>
                        <Ic n={th === "dark" ? "moon" : "sun"} size={18} color={tt.acc} />
                        <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: tt.text }}>{th === "dark" ? "Night Mode" : "Day Mode"}</div>
                        {theme === th && <div style={{ marginTop: 8, fontSize: 10, color: tt.acc, fontFamily: "'Fira Code',monospace" }}>✓ Active</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {tab === "study" && (
              <div>
                <p style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: t.faint, fontFamily: "'Fira Code',monospace", marginBottom: 20 }}>Output Preferences</p>
                <DragSlider label="Note detail level" val={prefs.noteDetail} min={1} max={3} onChange={v => setPrefs(p => ({ ...p, noteDetail: v }))} fmt={v => ["", "Brief", "Standard", "In-depth"][v]} theme={theme} smooth={false} />
                <DragSlider label="Flashcard count" val={prefs.flashcardCount} min={5} max={40} onChange={v => setPrefs(p => ({ ...p, flashcardCount: v }))} theme={theme} />
                <DragSlider label="Quiz questions" val={prefs.quizCount} min={5} max={20} onChange={v => setPrefs(p => ({ ...p, quizCount: v }))} theme={theme} />
              </div>
            )}
            {tab === "account" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ padding: "20px", background: t.elevated, borderRadius: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: t.accDim, border: `1px solid ${t.borderAcc}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontSize: 22, color: t.acc, marginBottom: 12 }}>{user.name?.charAt(0).toUpperCase()}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 10, color: t.faint, fontFamily: "'Fira Code',monospace", textTransform: "uppercase" }}>User Name</label>
                    <input 
                      value={user.name} 
                      onChange={e => setUser(u => ({ ...u, name: e.target.value }))}
                      style={{ background: "transparent", border: "none", borderBottom: `1px solid ${t.border}`, color: t.text, fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 600, outline: "none", padding: "4px 0" }}
                    />
                  </div>
                </div>
                <div style={{ padding: "18px 20px", background: t.goldDim, borderRadius: 14, border: `1px solid ${t.gold}33`, display: "flex", alignItems: "center", gap: 16 }}>
                  <Ic n="trophy" size={22} color={t.gold} />
                  <div>
                    <div style={{ fontSize: 11, color: t.muted, marginBottom: 2 }}>Lifetime Study Points</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 38, fontWeight: 700, color: t.gold, lineHeight: 1 }}>{user.score} <span style={{ fontSize: 14, fontFamily: "'Outfit',sans-serif", fontWeight: 400 }}>pts</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Upload ─────────────────────────────────────────────────────────────────────
function Upload({ theme, onGenerate, prefs, setPrefs }) {
  const t = THEMES[theme];
  const [drag, setDrag] = useState(false); const [files, setFiles] = useState([]); const [mode, setMode] = useState("notes");
  const fileRef = useRef();
  const addFiles = fs => setFiles(p => [...p, ...Array.from(fs).filter(f => f.name.endsWith(".pdf"))]);
  const modes = [
    { id: "notes", icon: "file", label: "Structured Notes", desc: "Sections, key terms & takeaways" },
    { id: "flashcards", icon: "card", label: "Flashcards", desc: `${prefs.flashcardCount} cards for active recall` },
    { id: "quiz", icon: "quiz", label: "Quiz", desc: `${prefs.quizCount} MCQ questions` },
    { id: "mindmap", icon: "map", label: "Mind Map", desc: "Visual concept hierarchy" },
  ];



  return (
    <div style={{ maxWidth: 660, margin: "0 auto", padding: "44px 24px" }}>
      <div className="fu" style={{ marginBottom: 44 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", background: t.accDim, border: `1px solid ${t.borderAcc}`, borderRadius: 20, marginBottom: 22 }}>
          <Ic n="sparkle" size={12} color={t.acc} />
          <span style={{ fontSize: 11, color: t.acc, fontFamily: "'Fira Code',monospace", letterSpacing: ".04em" }}>AI-powered study assistant</span>
        </div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(34px,5vw,56px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-.02em", marginBottom: 14 }}>
          Turn any PDF into<br />
          <span style={{ color: t.acc, fontStyle: "italic" }}>structured knowledge.</span>
        </h1>
        <p style={{ fontSize: 15, color: t.muted, lineHeight: 1.75, maxWidth: 480 }}>Upload lecture notes, textbooks or research papers. Get personalized study material tailored to how you learn.</p>
      </div>

      <div className="fu d1"
        onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }} onClick={() => fileRef.current.click()}
        style={{ border: `1.5px dashed ${drag ? t.acc : t.border}`, borderRadius: 18, padding: "36px 28px", textAlign: "center", cursor: "pointer", marginBottom: 14, background: drag ? t.accDim : t.surface, transition: "all .25s cubic-bezier(.16,1,.3,1)", transform: drag ? "scale(1.015)" : "scale(1)", boxShadow: drag ? `0 0 0 4px ${t.accDim}` : "none" }}>
        <input ref={fileRef} type="file" accept=".pdf" multiple onChange={e => addFiles(e.target.files)} style={{ display: "none" }} />
        <div style={{ width: 52, height: 52, borderRadius: 15, background: t.accDim, border: `1px solid ${t.borderAcc}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: `0 8px 24px ${t.acc}22` }}>
          <Ic n="brand" size={24} color={t.acc} />
        </div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 500, marginBottom: 5 }}>Drop PDF files here</div>
        <div style={{ fontSize: 13, color: t.muted }}>or click to browse — multiple files supported — max 20MB each</div>
      </div>

      {files.length > 0 && (
        <div className="fi" style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
          {files.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: t.accDim, border: `1px solid ${t.borderAcc}`, borderRadius: 10 }}>
              <Ic n="file" size={14} color={t.acc} />
              <span style={{ flex: 1, fontSize: 13, color: t.acc, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
              <span style={{ fontSize: 11, color: t.faint, fontFamily: "'Fira Code',monospace" }}>{(f.size / 1024 / 1024).toFixed(1)} MB</span>
              <button onClick={e => { e.stopPropagation(); setFiles(p => p.filter((_, j) => j !== i)); }} style={{ background: "none", border: "none", cursor: "pointer", color: t.muted, display: "flex", padding: 2, transition: "color .15s" }}
                onMouseEnter={e => e.currentTarget.style.color = t.danger} onMouseLeave={e => e.currentTarget.style.color = t.muted}>
                <Ic n="x" size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="fu d2" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: t.faint, fontFamily: "'Fira Code',monospace", marginBottom: 10 }}>Study Format</p>
      <div className="fu d2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {modes.map(m => {
          const active = mode === m.id;
          return (
            <div key={m.id} onClick={() => setMode(m.id)} style={{ padding: "14px 16px", borderRadius: 13, cursor: "pointer", border: `1.5px solid ${active ? t.acc : t.border}`, background: active ? t.accDim : t.surface, transition: "all .2s cubic-bezier(.16,1,.3,1)", transform: active ? "translateY(-2px)" : "none" }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = t.elevated; e.currentTarget.style.borderColor = t.borderHov; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = t.surface; e.currentTarget.style.borderColor = t.border; } }}>
              <div style={{ marginBottom: 8 }}><Ic n={m.icon} size={16} color={active ? t.acc : t.muted} /></div>
              <div style={{ fontSize: 13, fontWeight: 600, color: active ? t.acc : t.text, marginBottom: 2 }}>{m.label}</div>
              <div style={{ fontSize: 11, color: t.faint }}>{m.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Detail slider with draggable thumb */}
      <div className="fu d3" style={{ padding: "16px", background: t.surface, borderRadius: 13, border: `1px solid ${t.border}`, marginBottom: 20 }}>
        <DragSlider label="Detail level" val={prefs.noteDetail} min={1} max={3} onChange={v => setPrefs(p => ({ ...p, noteDetail: v }))} fmt={v => ["", "Brief", "Standard", "In-depth"][v]} theme={theme} smooth={false} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: t.faint, fontFamily: "'Fira Code',monospace", marginTop: -10 }}>
          <span>Brief</span><span>Standard</span><span>In-depth</span>
        </div>
      </div>

      <button className="fu d4" onClick={() => files.length && onGenerate(files, mode)} disabled={!files.length}
        style={{ width: "100%", padding: "15px", borderRadius: 13, border: `1px solid ${files.length ? t.acc : t.border}`, fontWeight: 600, fontSize: 15, cursor: files.length ? "pointer" : "not-allowed", background: files.length ? t.accDim : t.elevated, color: files.length ? t.acc : t.faint, transition: "all .25s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
        onMouseEnter={e => { if (files.length) e.currentTarget.style.background = t.elevated; }}
        onMouseLeave={e => { if (files.length) e.currentTarget.style.background = t.accDim; }}>
        <Ic n="sparkle" size={16} color={files.length ? t.acc : t.faint} />
        Generate {files.length > 1 ? `from ${files.length} PDFs` : "study material"}
      </button>
    </div>
  );
}

// ── Loading ────────────────────────────────────────────────────────────────────
function Loading({ theme, fileCount }) {
  const t = THEMES[theme];
  const [step, setStep] = useState(0);
  const steps = ["Reading document structure", "Extracting key concepts", "Building study material", "Formatting output"];
  useEffect(() => { const iv = setInterval(() => setStep(s => Math.min(s + 1, 3)), 4500); return () => clearInterval(iv); }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 40 }}>
      <div style={{ position: "relative", marginBottom: 36 }}>
        <div style={{ width: 68, height: 68, borderRadius: 20, background: t.accDim, border: `1px solid ${t.borderAcc}`, display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 2s ease-in-out infinite" }}>
          <Ic n="book" size={30} color={t.acc} />
        </div>
        <div style={{ position: "absolute", inset: -10, borderRadius: 30, border: `1px solid ${t.acc}44`, animation: "pulse 2s ease-in-out .5s infinite" }} />
      </div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 600, marginBottom: 6, letterSpacing: "-.01em" }}>Processing {fileCount > 1 ? `${fileCount} documents` : "your document"}</h2>
      <p style={{ fontSize: 14, color: t.muted, marginBottom: 44 }}>This takes about 15–30 seconds</p>
      <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 14 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, opacity: i <= step ? 1 : .2, transition: "opacity .5s" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${i <= step ? t.acc : t.border}`, background: i < step ? t.accDim : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .4s" }}>
              {i < step ? <Ic n="check" size={10} color={t.acc} /> : i === step ? <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.acc, animation: "pulse 1s ease-in-out infinite" }} /> : null}
            </div>
            <span style={{ fontSize: 13, color: i === step ? t.text : t.muted, fontWeight: i === step ? 500 : 400 }}>{s}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 48, width: "100%", maxWidth: 340, height: 2, background: t.elevated, borderRadius: 1, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${((step + 1) / steps.length) * 100}%`, background: t.acc, borderRadius: 1, transition: "width 1.2s cubic-bezier(.16,1,.3,1)" }} />
      </div>
    </div>
  );
}

// ── Notes ──────────────────────────────────────────────────────────────────────
function Notes({ data, theme, onExplain }) {
  const t = THEMES[theme]; const [open, setOpen] = useState(new Set([0]));
  const toggle = i => setOpen(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection) return;
    const text = selection.toString().trim();
    if (text && text.length > 5 && text.length < 600) {
      onExplain(text);
    }
  }, [onExplain]);

  return (
    <div onMouseUp={handleMouseUp}>
      <div style={{ padding: "10px 14px", background: t.accDim, border: `1px solid ${t.borderAcc}`, borderRadius: 10, fontSize: 12, color: t.acc, marginBottom: 20, display: "flex", gap: 8, alignItems: "center" }}>
        <Ic n="zap" size={12} color={t.acc} /> Select any text to get an instant AI explanation
      </div>
      {data.sections?.map((s, i) => (
        <div key={i} className="fu" style={{ animationDelay: `${i * .04}s`, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, marginBottom: 8, overflow: "hidden" }}>
          <div onClick={() => toggle(i)} style={{ padding: "15px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "background .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = t.elevated} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: "'Fira Code',monospace", fontSize: 10, color: t.acc, background: t.accDim, padding: "2px 7px", borderRadius: 4 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 500 }}>{s.heading}</span>
            </div>
            <div style={{ transform: open.has(i) ? "rotate(180deg)" : "rotate(0)", transition: "transform .25s", color: t.faint }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6,9 12,15 18,9" /></svg>
            </div>
          </div>
          {open.has(i) && (
            <div className="fi" style={{ padding: "0 20px 20px", borderTop: `1px solid ${t.border}` }}>
              <p style={{ fontSize: 14, lineHeight: 1.9, color: t.muted, marginTop: 16 }}>{s.content}</p>
              {s.key_terms?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                  {s.key_terms.map((term, j) => (
                    <span key={j} onClick={e => { e.stopPropagation(); onExplain(term); }} style={{ padding: "4px 10px", background: t.elevated, border: `1px solid ${t.border}`, borderRadius: 20, fontSize: 11, fontFamily: "'Fira Code',monospace", color: t.muted, cursor: "pointer", transition: "all .15s" }}
                      onMouseEnter={e => { e.target.style.borderColor = t.acc; e.target.style.color = t.acc; e.target.style.background = t.accDim; }}
                      onMouseLeave={e => { e.target.style.borderColor = t.border; e.target.style.color = t.muted; e.target.style.background = t.elevated; }}>
                      {term}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {data.key_takeaways?.length > 0 && (
        <div style={{ background: t.surface, border: `1px solid ${t.borderAcc}`, borderRadius: 14, padding: "20px", marginTop: 8 }}>
          <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: t.acc, fontFamily: "'Fira Code',monospace", marginBottom: 16 }}>Key Takeaways</div>
          {data.key_takeaways.map((tk, i) => (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: i < data.key_takeaways.length - 1 ? 14 : 0 }}>
              <div style={{ width: 2, background: t.acc, borderRadius: 1, flexShrink: 0, minHeight: 20 }} />
              <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.8 }}>{tk}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Flashcards ─────────────────────────────────────────────────────────────────
function Flashcards({ data, theme }) {
  const t = THEMES[theme]; const [flipped, setFlipped] = useState(new Set());
  const cards = data.flashcards || [];
  const toggle = i => setFlipped(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 2, background: t.elevated, borderRadius: 1 }}>
          <div style={{ height: "100%", width: `${(flipped.size / cards.length) * 100}%`, background: t.acc, borderRadius: 1, transition: "width .5s cubic-bezier(.16,1,.3,1)" }} />
        </div>
        <span style={{ fontFamily: "'Fira Code',monospace", fontSize: 11, color: t.muted }}>{flipped.size}/{cards.length} revealed</span>
      </div>
      <div style={{ padding: "8px 12px", background: t.successDim, border: `1px solid ${t.success}33`, borderRadius: 8, fontSize: 12, color: t.success, marginBottom: 18 }}>Click any card to reveal the answer</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {cards.map((fc, i) => {
          const isFlipped = flipped.has(i);
          const dc = { easy: t.success, medium: t.gold, hard: t.danger }[fc.difficulty] || t.acc;
          return (
            <div key={i} className="fu" style={{ animationDelay: `${i * .03}s`, height: 178, perspective: 900, cursor: "pointer" }} onClick={() => toggle(i)}>
              <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transition: "transform .55s cubic-bezier(.16,1,.3,1)", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0)" }}>
                <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: "18px 16px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                  <span style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: t.faint, fontFamily: "'Fira Code',monospace", marginBottom: 10 }}>Question</span>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: t.text }}>{fc.front}</p>
                  <span style={{ position: "absolute", top: 10, right: 10, padding: "1px 7px", borderRadius: 4, fontSize: 9, fontFamily: "'Fira Code',monospace", background: dc + "22", color: dc }}>{fc.difficulty}</span>
                </div>
                <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: t.accDim, border: `1px solid ${t.borderAcc}`, borderRadius: 14, padding: "18px 16px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                  <span style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: t.acc, fontFamily: "'Fira Code',monospace", marginBottom: 10 }}>Answer</span>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: t.acc }}>{fc.back}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Quiz ───────────────────────────────────────────────────────────────────────
function Quiz({ data, theme, onScore }) {
  const t = THEMES[theme]; const [answers, setAnswers] = useState({});
  const questions = data.questions || [];
  const score = Object.entries(answers).filter(([qi, a]) => a === questions[qi]?.answer).length;
  const done = Object.keys(answers).length === questions.length;
  
  const finishQuiz = async (finalScore) => {
    const points = finalScore * 10;
    if (onScore) onScore(points);
  };

  const answer = (qi, key) => {
    if (answers[qi]) return;
    const newAnswers = { ...answers, [qi]: key };
    setAnswers(newAnswers);
    if (Object.keys(newAnswers).length === questions.length) {
      const finalScore = Object.entries(newAnswers).filter(([idx, ans]) => ans === questions[idx]?.answer).length;
      finishQuiz(finalScore);
    }
  };

  return (
    <div>
      {done && (
        <div className="fu" style={{ padding: "28px", background: score / questions.length >= .7 ? t.successDim : t.goldDim, border: `1px solid ${(score / questions.length >= .7 ? t.success : t.gold)}33`, borderRadius: 18, textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 54, fontWeight: 700, color: score / questions.length >= .7 ? t.success : t.gold, lineHeight: 1, marginBottom: 6 }}>{score}<span style={{ fontSize: 22, color: t.muted }}>/{questions.length}</span></div>
          <p style={{ fontSize: 14, color: t.muted, marginBottom: 16 }}>{score / questions.length > .8 ? "Outstanding performance." : score / questions.length > .5 ? "Good effort — review the missed ones." : "Keep studying and try again."}</p>
          <button onClick={() => setAnswers({})} style={{ padding: "9px 22px", borderRadius: 9, border: `1px solid ${t.border}`, background: t.surface, color: t.text, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Retry quiz</button>
        </div>
      )}
      {questions.map((q, qi) => {
        const chosen = answers[qi];
        return (
          <div key={qi} className="fu" style={{ animationDelay: `${qi * .04}s`, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px", marginBottom: 12 }}>
            <div style={{ fontFamily: "'Fira Code',monospace", fontSize: 10, color: t.faint, marginBottom: 10, letterSpacing: ".05em" }}>Q {String(qi + 1).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}</div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 500, lineHeight: 1.55, marginBottom: 16, color: t.text }}>{q.question}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {q.options.map((opt, oi) => {
                const key = opt.charAt(0); const isChosen = chosen === key; const isCorrect = key === q.answer; const reveal = !!chosen;
                return (
                  <div key={oi} onClick={() => answer(qi, key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: `1px solid ${reveal ? (isCorrect ? t.success : isChosen ? t.danger : t.border) : t.border}`, background: reveal ? (isCorrect ? t.successDim : isChosen ? t.dangerDim : t.elevated) : t.elevated, cursor: chosen ? "default" : "pointer", color: reveal ? (isCorrect ? t.success : isChosen ? t.danger : t.muted) : t.muted, fontSize: 13, transition: "all .2s" }}
                    onMouseEnter={e => { if (!chosen) e.currentTarget.style.borderColor = t.borderHov; }} onMouseLeave={e => { if (!chosen) e.currentTarget.style.borderColor = t.border; }}>
                    <span style={{ fontFamily: "'Fira Code',monospace", fontSize: 10, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 5, padding: "1px 5px", flexShrink: 0 }}>{key}</span>
                    <span style={{ flex: 1 }}>{opt.substring(3)}</span>
                    {reveal && isCorrect && <Ic n="check" size={13} color={t.success} />}
                    {reveal && isChosen && !isCorrect && <Ic n="x" size={13} color={t.danger} />}
                  </div>
                );
              })}
            </div>
            {chosen && <div className="fi" style={{ marginTop: 12, padding: "10px 14px", background: t.elevated, borderRadius: 8, fontSize: 12, color: t.muted, lineHeight: 1.7, borderLeft: `2px solid ${t.success}` }}>{q.explanation}</div>}
          </div>
        );
      })}
    </div>
  );
}

// ── Mind Map ───────────────────────────────────────────────────────────────────
function MindMap({ data, theme }) {
  const t = THEMES[theme]; const ref = useRef();
  useEffect(() => {
    const canvas = ref.current; if (!canvas || !data.branches) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.offsetWidth; const H = canvas.height = 520;
    const cx = W / 2, cy = H / 2;
    ctx.fillStyle = t.surface; ctx.fillRect(0, 0, W, H);
    const branches = data.branches || []; const angle = (Math.PI * 2) / branches.length;
    const palette = [t.acc, t.sec, t.success, t.danger, "#a78bfa", "#fb923c"];
    ctx.beginPath(); ctx.arc(cx, cy, 50, 0, Math.PI * 2); ctx.fillStyle = t.accDim; ctx.fill();
    ctx.strokeStyle = t.acc; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = t.acc; ctx.font = `600 11px 'Outfit'`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText((data.central_topic || "").substring(0, 16), cx, cy);
    branches.forEach((br, i) => {
      const a = angle * i - Math.PI / 2; const bx = cx + Math.cos(a) * 170, by = cy + Math.sin(a) * 140;
      const color = palette[i % palette.length];
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 50, cy + Math.sin(a) * 50); ctx.lineTo(bx, by); ctx.strokeStyle = color + "66"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(bx, by, 33, 0, Math.PI * 2); ctx.fillStyle = color + "18"; ctx.fill(); ctx.strokeStyle = color + "88"; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = color; ctx.font = `500 10px 'Outfit'`; ctx.fillText((br.name || "").substring(0, 12), bx, by);
      (br.subtopics || []).slice(0, 3).forEach((sub, j) => {
        const sa = a + (j - 1) * .65; const sx = bx + Math.cos(sa) * 94, sy = by + Math.sin(sa) * 78;
        ctx.beginPath(); ctx.moveTo(bx + Math.cos(sa) * 33, by + Math.sin(sa) * 33); ctx.lineTo(sx, sy); ctx.strokeStyle = color + "44"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(sx - 42, sy - 12, 84, 24, 8); else ctx.rect(sx - 42, sy - 12, 84, 24);
        ctx.fillStyle = t.elevated; ctx.fill(); ctx.strokeStyle = color + "44"; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = t.muted; ctx.font = `10px 'Outfit'`; ctx.fillText((sub.name || "").substring(0, 13), sx, sy);
      });
    });
  }, [data, theme, t.acc, t.accDim, t.danger, t.elevated, t.muted, t.sec, t.success, t.surface]);
  return (
    <div>
      <canvas ref={ref} style={{ width: "100%", borderRadius: 14, border: `1px solid ${t.border}` }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
        {data.branches?.map((br, i) => { const c = [THEMES[theme].acc, THEMES[theme].sec, THEMES[theme].success, THEMES[theme].danger, "#a78bfa", "#fb923c"][i % 6]; return <span key={i} style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, background: c + "18", color: c, border: `1px solid ${c}44`, fontFamily: "'Fira Code',monospace" }}>{br.name}</span>; })}
      </div>
    </div>
  );
}

// ── Chat ───────────────────────────────────────────────────────────────────────
function Chat({ theme, session, onClose }) {
  const t = THEMES[theme]; const [msgs, setMsgs] = useState([{ role: "ai", text: "Ask me anything about your document." }]);
  const [input, setInput] = useState(""); const [loading, setLoading] = useState(false); const bottom = useRef();
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  const send = async () => {
    if (!input.trim() || !session || loading) return;
    const msg = input.trim(); setInput(""); setMsgs(m => [...m, { role: "user", text: msg }]); setLoading(true);
    try {
      const res = await fetch(`${API}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: session, message: msg, history: msgs.slice(-6).map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })) }) });
      const d = await res.json(); setMsgs(m => [...m, { role: "ai", text: d.reply || "Sorry, I couldn't process that." }]);
    } catch { setMsgs(m => [...m, { role: "ai", text: "Connection error." }]); }
    setLoading(false);
  };
  return (
    <div style={{ position: "fixed", right: 0, top: 60, width: 340, height: "calc(100vh - 60px)", background: THEMES[theme].sidebarBg, backdropFilter: "blur(20px)", borderLeft: `1px solid ${t.border}`, display: "flex", flexDirection: "column", zIndex: 90 }}>
      <div style={{ padding: "16px 18px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: t.accDim, border: `1px solid ${t.borderAcc}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="chat" size={14} color={t.acc} /></div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 500 }}>Chat with document</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.muted, display: "flex", padding: 4 }}><Ic n="x" size={15} /></button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} className="fi" style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%" }}>
            <div style={{ padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", fontSize: 13, lineHeight: 1.7, background: m.role === "user" ? t.accDim : t.elevated, color: m.role === "user" ? t.acc : t.muted, border: m.role === "ai" ? `1px solid ${t.border}` : `1px solid ${t.borderAcc}` }}>{m.text}</div>
          </div>
        ))}
        {loading && <div style={{ alignSelf: "flex-start", padding: "12px 16px", background: t.elevated, borderRadius: "14px 14px 14px 4px", border: `1px solid ${t.border}`, display: "flex", gap: 5 }}>
          {[0, .2, .4].map((d, i) => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: t.muted, animation: `pulse 1.2s ${d}s ease-in-out infinite` }} />)}
        </div>}
        <div ref={bottom} />
      </div>
      <div style={{ padding: "12px 14px", borderTop: `1px solid ${t.border}`, display: "flex", gap: 8 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask about your document..." rows={1}
          style={{ flex: 1, background: t.elevated, border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 12px", color: t.text, fontSize: 13, resize: "none", outline: "none", lineHeight: 1.5, transition: "border-color .2s" }}
          onFocus={e => e.target.style.borderColor = t.acc} onBlur={e => e.target.style.borderColor = t.border} />
        <button onClick={send} style={{ width: 38, height: 38, borderRadius: 10, background: t.accDim, border: `1px solid ${t.borderAcc}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "flex-end" }}>
          <Ic n="send" size={14} color={t.acc} />
        </button>
      </div>
    </div>
  );
}

// ── Explain Popup ──────────────────────────────────────────────────────────────
function Explain({ text, explanation, theme, onClose }) {
  const t = THEMES[theme];
  return (
    <div className="fu" style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", width: "min(500px,90vw)", background: t.surface, border: `1px solid ${t.borderAcc}`, borderRadius: 18, padding: "18px 22px", boxShadow: t.shadow, zIndex: 200 }}>
      <button onClick={onClose} style={{ position: "absolute", top: 12, right: 14, background: "none", border: "none", color: t.muted, cursor: "pointer", display: "flex" }}><Ic n="x" size={14} /></button>
      <div style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: t.acc, fontFamily: "'Fira Code',monospace", marginBottom: 8 }}>AI Explanation</div>
      <div style={{ fontSize: 11, color: t.faint, fontStyle: "italic", marginBottom: 10, padding: "4px 10px", background: t.elevated, borderRadius: 7 }}>"{text.length > 70 ? text.substring(0, 70) + "…" : text}"</div>
      {explanation
        ? <p style={{ fontSize: 13, lineHeight: 1.85, color: t.muted }}>{explanation}</p>
        : <div style={{ display: "flex", gap: 4 }}>{[0, .15, .3].map((d, i) => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: t.acc, animation: `pulse 1.2s ${d}s ease-in-out infinite` }} />)}</div>}
    </div>
  );
}

// ── Score popup ────────────────────────────────────────────────────────────────
function ScoreAnim({ score, milestone }) {
  const col = milestone ? "#FFEDA8" : "#6ee7b7";
  return (
    <div style={{ position: "fixed", top: "18%", left: "50%", zIndex: 600, pointerEvents: "none", animation: "scoreFloat 2.2s ease forwards" }}>
      <div style={{ padding: milestone ? "12px 24px" : "8px 18px", borderRadius: 14, background: milestone ? "rgba(255,237,168,0.15)" : "rgba(110,231,183,0.15)", border: `1px solid ${col}44`, color: col, fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: milestone ? 18 : 14, whiteSpace: "nowrap" }}>
        {milestone ? `${score} points — incredible!` : "+1 correct"}
      </div>
    </div>
  );
}

// ── Unique Header ──────────────────────────────────────────────────────────────
function Header({ theme, setTheme, user, result, chatOpen, setChatOpen, setSettings, setView, sidebarOpen, setSidebarOpen }) {
  const t = THEMES[theme];
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const [time, setTime] = useState(timeStr);
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })), 10000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: `1px solid ${t.border}`, background: THEMES[theme].sidebarBg, backdropFilter: "blur(24px)", position: "relative", zIndex: 10, flexShrink: 0, gap: 10 }}>
      {/* Left cluster */}
      <button onClick={() => setSidebarOpen(s => !s)} style={{ width: 34, height: 34, borderRadius: 9, background: "transparent", border: `1px solid ${t.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: t.muted, transition: "all .2s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = t.acc; e.currentTarget.style.color = t.acc; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.muted; }}>
        <Ic n="menu" size={14} />
      </button>

      {/* Logo — brand icon + wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 4 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: t.acc, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${t.acc}44` }}>
          <Ic n="brand" size={18} color={theme === "dark" ? t.bg : "#fff"} />
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: t.text }}>Study</span>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", fontStyle: "italic", color: t.acc }}>AI</span>
        </div>
        <div style={{ width: 1, height: 18, background: t.border, margin: "0 4px" }} />
        <span style={{ fontFamily: "'Fira Code',monospace", fontSize: 9, color: t.faint, letterSpacing: ".12em", textTransform: "uppercase" }}>{time}</span>
      </div>

      {/* Center — user greeting */}
      {user && (
        <div style={{ display: "none" /* hidden on narrow */ }} />
      )}

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
        {/* Score pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", background: t.goldDim, border: `1px solid ${t.gold}33`, borderRadius: 8 }}>
          <Ic n="trophy" size={12} color={t.gold} />
          <span style={{ fontFamily: "'Fira Code',monospace", fontSize: 11, fontWeight: 600, color: t.gold }}>{user?.score ?? 0}</span>
        </div>


        {result && (
          <button onClick={() => setChatOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 8, border: `1px solid ${chatOpen ? t.acc : t.border}`, background: chatOpen ? t.accDim : "transparent", color: chatOpen ? t.acc : t.muted, cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all .2s" }}>
            <Ic n="chat" size={13} /> Chat
          </button>
        )}

        {/* Theme toggle */}
        <button onClick={() => setTheme(th => th === "dark" ? "light" : "dark")} style={{ width: 34, height: 34, borderRadius: 9, background: "transparent", border: `1px solid ${t.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: t.muted, transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = t.acc; e.currentTarget.style.color = t.acc; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.muted; }}>
          <Ic n={theme === "dark" ? "sun" : "moon"} size={14} />
        </button>

        <button onClick={() => setSettings(true)} style={{ width: 34, height: 34, borderRadius: 9, background: "transparent", border: `1px solid ${t.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: t.muted, transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = t.acc; e.currentTarget.style.color = t.acc; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.muted; }}>
          <Ic n="settings" size={14} />
        </button>

        <button onClick={() => setView("home")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 8, border: `1px solid ${t.border}`, background: "transparent", color: t.muted, cursor: "pointer", fontSize: 12, transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = t.danger + "66"; e.currentTarget.style.background = t.dangerDim; e.currentTarget.style.color = t.danger; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.muted; }}>
          <Ic n="reset" size={12} /> Reset
        </button>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState({ name: "Student", score: 0 });
  const [view, setView] = useState("home");
  const [result, setResult] = useState(null);
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState("notes");
  const [loading, setLoading] = useState(false);
  const [fileCount, setFileCount] = useState(1);
  const [history, setHistory] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [settings, setSettings] = useState(false);

  const [explainText, setExplainText] = useState("");
  const [explainData, setExplainData] = useState(undefined);
  const [score, setScore] = useState(0);
  const [scorePopup, setScorePopup] = useState(null);
  const [sidebarW, setSidebarW] = useState(240);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [prefs, setPrefs] = useState({ noteDetail: 2, flashcardCount: 15, quizCount: 10 });
  const dragging = useRef(false);
  const t = THEMES[theme];

  useEffect(() => { injectCSS(theme); }, [theme]);
  useEffect(() => { fetchHistory(); }, [result]);
  useEffect(() => {
    const onMove = e => { if (dragging.current) setSidebarW(Math.max(160, Math.min(380, e.clientX))); };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  const handleGenerate = async (files, m) => {
    setFileCount(files.length); setLoading(true); setMode(m);
    try {
      const fd = new FormData();
      fd.append("file", files[0]);
      fd.append("mode", m);
      fd.append("detail", ["", "brief", "standard", "in-depth"][prefs.noteDetail]);
      fd.append("flashcard_count", prefs.flashcardCount);
      fd.append("quiz_count", prefs.quizCount);
      const res = await fetch(`${API}/api/upload`, { method: "POST", body: fd });
      if (res.ok) { const d = await res.json(); setResult(d); setSession(d.session_id); setView("result"); }
    } catch (e) { alert("Error: " + e.message); }
    setLoading(false);
  };

  const handleScore = (points) => {
    const newScore = score + points;
    setScore(newScore);
    setUser(u => ({ ...u, score: newScore }));
    setScorePopup({ score: newScore, milestone: newScore % 10 === 0 });
    setTimeout(() => setScorePopup(null), 2400);
  };

  const handleExplain = async (text) => {
    if (!text || text.length < 3) return;
    if (!session) {
      // Show explain popup with a note that no session is loaded
      setExplainText(text);
      setExplainData("No document session loaded. Upload a PDF first to get AI explanations.");
      return;
    }
    setExplainText(text);
    setExplainData(null); // null = loading
    try {
      const res = await fetch(`${API}/api/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session, selected_text: text })
      });
      const d = await res.json();
      setExplainData(d.explanation || "No explanation available.");
    } catch {
      setExplainData("Could not load explanation. Please check your connection.");
    }
  };

  const loadHistoryItem = async h => {
    setLoading(true); setMode(h.mode);
    const detail = ["", "brief", "standard", "in-depth"][prefs.noteDetail];
    try {
      const res = await fetch(`${API}/api/reload`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: h.session_id, mode: h.mode, detail: detail, flashcard_count: prefs.flashcardCount, quiz_count: prefs.quizCount }) });
      if (res.ok) { const d = await res.json(); setResult(d); setSession(h.session_id); setView("result"); }
    } catch { }
    setLoading(false);
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/api/history`);
      const data = await res.json();
      setHistory(data);
    } catch (err) { console.error("History fetch failed:", err); }
  };

  const deleteHistoryItem = async (sid, e) => {
    e.stopPropagation();
    await fetch(`${API}/api/history/${sid}`, { method: "DELETE" });
    setHistory(h => h.filter(x => x.session_id !== sid));
    if (session === sid) { setView("home"); setResult(null); }
  };

  const exportMd = () => {
    if (!result) return;
    const md = `# ${result.title}\n\n> ${result.summary}\n\n**Subject:** ${result.subject}\n\n---\n\n${(result.sections || []).map(s => `## ${s.heading}\n\n${s.content}`).join("\n\n")}`;
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown" })); a.download = "notes.md"; a.click();
  };

  // No login required — app loads directly

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: t.bg, overflow: "hidden", position: "relative" }}>
      <Background theme={theme} />
      {scorePopup && <ScoreAnim score={scorePopup.score} milestone={scorePopup.milestone} />}

      <Header
        theme={theme} setTheme={setTheme} user={user} result={result}
        chatOpen={chatOpen} setChatOpen={setChatOpen} setSettings={setSettings}
        setView={setView}
        sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
      />

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative", zIndex: 1 }}>
        {sidebarOpen && (
          <div className="si" style={{ width: sidebarW, borderRight: `1px solid ${t.border}`, background: t.sidebarBg, backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden", position: "relative" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
              <button onClick={() => { setView("home"); setResult(null); setSession(null); setChatOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, background: view === "home" ? t.accDim : "transparent", color: view === "home" ? t.acc : t.muted, transition: "all .15s", marginBottom: 10, borderLeft: view === "home" ? `2px solid ${t.acc}` : "2px solid transparent" }}
                onMouseEnter={e => { if (view !== "home") e.currentTarget.style.background = t.elevated; }} onMouseLeave={e => { if (view !== "home") e.currentTarget.style.background = "transparent"; }}>
                <Ic n="plus" size={14} /> New session
              </button>
              <div style={{ height: 1, background: t.border, margin: "4px 0 10px" }} />
              {history.length > 0 && (
                <div>
                  <div style={{ padding: "4px 10px 8px", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: t.faint, fontFamily: "'Fira Code',monospace" }}>Recent</div>
                  {history.map(h => (
                    <div key={h.session_id} onClick={() => loadHistoryItem(h)}
                      style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "8px 10px", borderRadius: 10, cursor: "pointer", marginBottom: 3, transition: "all .15s", background: session === h.session_id ? t.accDim : "transparent", borderLeft: session === h.session_id ? `2px solid ${t.acc}` : "2px solid transparent" }}
                      onMouseEnter={e => { if (session !== h.session_id) e.currentTarget.style.background = t.elevated; }} onMouseLeave={e => { if (session !== h.session_id) e.currentTarget.style.background = "transparent"; }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: session === h.session_id ? t.acc : t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>{h.title}</div>
                        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                          <span style={{ padding: "1px 6px", borderRadius: 4, fontSize: 9, fontFamily: "'Fira Code',monospace", background: t.accDim, color: t.acc }}>{h.mode}</span>
                          <span style={{ fontSize: 10, color: t.faint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.subject}</span>
                        </div>
                      </div>
                      <button onClick={e => deleteHistoryItem(h.session_id, e)} style={{ background: "none", border: "none", color: "transparent", cursor: "pointer", display: "flex", padding: 3, borderRadius: 5, transition: "all .15s", flexShrink: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.color = t.danger; e.currentTarget.style.background = t.dangerDim; }} onMouseLeave={e => { e.currentTarget.style.color = "transparent"; e.currentTarget.style.background = "transparent"; }}>
                        <Ic n="trash" size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div onMouseDown={() => { dragging.current = true; }} style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 4, cursor: "col-resize", zIndex: 5 }}
              onMouseEnter={e => e.target.style.background = t.acc + "55"} onMouseLeave={e => { if (!dragging.current) e.target.style.background = "transparent"; }} />
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", paddingRight: chatOpen && session ? 340 : 0, transition: "padding-right .3s" }}>
          {!loading && view === "home" && <Upload theme={theme} onGenerate={handleGenerate} prefs={prefs} setPrefs={setPrefs} />}
          {loading && <Loading theme={theme} fileCount={fileCount} />}
          {!loading && view === "result" && result && (
            <div style={{ padding: "28px 40px", maxWidth: 820, margin: "0 auto" }}>
              <div className="fu" style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
                  <div>
                    <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, letterSpacing: "-.01em", marginBottom: 10, lineHeight: 1.2 }}>{result.title}</h1>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                      <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 10, fontFamily: "'Fira Code',monospace", background: t.accDim, color: t.acc, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase" }}>{result.mode}</span>
                      <span style={{ fontSize: 12, color: t.faint }}>{result.subject}</span>
                      <span style={{ color: t.faint }}>·</span>
                      <span style={{ fontSize: 12, color: t.faint }}>{result.filename}</span>
                    </div>
                  </div>
                  <button onClick={exportMd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, border: `1px solid ${t.border}`, background: "transparent", color: t.muted, cursor: "pointer", fontSize: 12, fontWeight: 500, flexShrink: 0, transition: "all .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = t.acc; e.currentTarget.style.color = t.acc; }} onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.muted; }}>
                    <Ic n="download" size={13} /> Export
                  </button>
                </div>
                {result.summary && <div style={{ padding: "14px 18px", borderLeft: `3px solid ${t.acc}`, background: t.surface, borderRadius: "0 12px 12px 0", fontSize: 14, color: t.muted, lineHeight: 1.8, fontStyle: "italic" }}>{result.summary}</div>}
              </div>
              {mode === "notes" && <Notes data={result} theme={theme} onExplain={handleExplain} />}
              {mode === "flashcards" && <Flashcards data={result} theme={theme} />}
              {mode === "quiz" && <Quiz data={result} theme={theme} onScore={handleScore} />}
              {mode === "mindmap" && <MindMap data={result} theme={theme} />}
            </div>
          )}
        </div>
      </div>

      {chatOpen && session && <Chat theme={theme} session={session} onClose={() => setChatOpen(false)} />}
      {explainText && explainData !== undefined && (
        <Explain text={explainText} explanation={explainData} theme={theme} onClose={() => { setExplainText(""); setExplainData(undefined); }} />
      )}
      {settings && <Settings onClose={() => setSettings(false)} theme={theme} setTheme={th => setTheme(th)} user={user} setUser={setUser} prefs={prefs} setPrefs={setPrefs} />}

    </div>
  );
}