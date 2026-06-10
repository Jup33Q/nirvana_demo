/**
 * Bubble Quilting DNA Background Engine — Phoenix LiveView Hook
 * Adapted from make-marp-html-bubble skill
 */

// ── Configuration (tunable params) ──
const BQ_CONFIG = {
  cols: 14,
  rows: 10,
  speed: 0.10,
  helixFreq: 9.424,
  helixY: 0.18,
  helixX: 0.04,
  pulseScale: 0.04,
  pulseCube: 0.04,
  driftX: 0.06,
  driftY: 0.03,
  twist: 0.04,
  zigzag: 0.25,
  palette: [
    {f: '#1e3a5f', l: '#38bdf8'},
    {f: '#312e81', l: '#a78bfa'},
    {f: '#0f172a', l: '#22d3ee'},
    {f: '#4c1d95', l: '#c084fc'},
    {f: '#1e1b4b', l: '#67e8f9'},
    {f: '#581c87', l: '#e879f9'},
    {f: '#164e63', l: '#2dd4bf'},
    {f: '#1e293b', l: '#818cf8'}
  ],
  springK: 0.04,
  damping: 0.96,
  throwVel: 55,
  pageHMultiplier: 140
};

// ── Store: Central state ──
const BQ_Store = {
  bubbleScroll: 0,
  targetScroll: 0,
  set(k, v) { this[k] = v; }
};

// ── Event Bus ──
const BQ_Events = {
  _listeners: {},
  on(e, fn) { (this._listeners[e] || (this._listeners[e] = [])).push(fn); },
  emit(e, p) { (this._listeners[e] || []).forEach(fn => fn(p)); }
};

// ── Helper: color manipulation ──
function lighten(hex, p) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${
    Math.min(255, ((n >> 16) & 0xff) + Math.round((255 - ((n >> 16) & 0xff)) * p / 100))
  },${
    Math.min(255, ((n >> 8) & 0xff) + Math.round((255 - ((n >> 8) & 0xff)) * p / 100))
  },${
    Math.min(255, (n & 0xff) + Math.round((255 - (n & 0xff)) * p / 100))
  })`;
}

function darken(hex, p) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${
    Math.max(0, Math.round(((n >> 16) & 0xff) * (1 - p / 100)))
  },${
    Math.max(0, Math.round(((n >> 8) & 0xff) * (1 - p / 100)))
  },${
    Math.max(0, Math.round((n & 0xff) * (1 - p / 100)))
  })`;
}

// ── BubbleQuilt Hook ──
const BubbleQuilt = {
  mounted() {
    const canvasId = this.el.id;
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.bubbles = [];
    this.W = 0;
    this.H = 0;
    this.dpr = 1;
    this.time = 0;
    this.raf = 0;
    this._wrapW = 0;
    this._L = {};
    this._D = {};

    this.resize();
    this._boundResize = () => this.resize();
    window.addEventListener('resize', this._boundResize);
    this.play();

    // Listen for slide changes from LiveView
    this.handleEvent("slide_change", ({direction}) => {
      if (!direction) return;
      const shift = Math.round(window.innerWidth / 8);
      BQ_Store.set('targetScroll', BQ_Store.targetScroll - direction * shift);
    });

    this._boundVisibility = () => {
      document.hidden ? this.pause() : this.play();
    };
    document.addEventListener('visibilitychange', this._boundVisibility);
  },

  destroyed() {
    this.pause();
    window.removeEventListener('resize', this._boundResize);
    document.removeEventListener('visibilitychange', this._boundVisibility);
  },

  resize() {
    this.dpr = window.devicePixelRatio || 1;
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.canvas.width = this.W * this.dpr;
    this.canvas.height = this.H * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this._wrapW = this.W;
    this._L = {};
    this._D = {};
    this.buildGrid();
  },

  buildGrid() {
    const C = BQ_CONFIG;
    this.bubbles = [];
    const cW = this.W / C.cols;
    const cH = this.H / C.rows;
    const r = Math.min(cW, cH) * 0.30;
    const aH = r * 0.75;
    for (let row = 0; row < C.rows; row++) {
      const ro = (row % 2 === 1) ? -cW * 0.5 : 0;
      const pal = C.palette[row % C.palette.length];
      const ec = (row % 2 === 1) ? C.cols + 1 : C.cols;
      for (let col = 0; col < ec; col++) {
        const cx = col * cW + cW * 0.5 + ro;
        const cy = row * cH + cH * 0.5;
        this.bubbles.push({cx, cy, r, aH, pal, row, col});
      }
    }
  },

  play() {
    if (!this.raf) this.loop();
  },

  pause() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  },

  loop() {
    this.time++;
    // Smooth linear lerp — no spring bounce
    const diff = BQ_Store.targetScroll - BQ_Store.bubbleScroll;
    if (Math.abs(diff) < 0.5) {
      BQ_Store.bubbleScroll = BQ_Store.targetScroll;
    } else {
      BQ_Store.bubbleScroll += diff * 0.08;
    }
    this.render();
    this.raf = requestAnimationFrame(() => this.loop());
  },

  render() {
    const ctx = this.ctx;
    const W = this.W;
    const H = this.H;
    const C = BQ_CONFIG;
    const tm = this.time * C.speed;
    const scrollX = BQ_Store.bubbleScroll;
    const wrapW = this._wrapW;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);
    const hf = C.helixFreq;

    for (const b of this.bubbles) {
      let cx = b.cx;
      let cy = b.cy;
      const r = b.r;
      const rn = b.row * 0.1428;
      const cn = b.col * 0.1;
      const rowDir = (b.row & 1) ? -1 : 1;
      const rowPhase = tm * 0.7 + rn * hf;

      // 1. Helix wave
      const s1 = Math.sin(rowPhase + cn * 3.1416);
      cy += s1 * r * C.helixY;
      cx += Math.cos(rowPhase) * r * C.helixX;
      let sc = 1 + s1 * C.pulseScale;
      const ea = s1 * 0.1;
      const gl = s1 > 0 ? s1 * 0.15 : 0;

      // 2. Pulse
      const sp = Math.sin(tm * 0.8 + rn * 12.566 + cn * 6.283) * 0.5 + 0.5;
      sc *= 1 + sp * sp * sp * C.pulseCube;

      // 3. Drift
      cx += Math.sin(tm * 0.2) * r * C.driftX;
      cy += Math.cos(tm * 0.15) * r * C.driftY;

      // 4. Twist
      cy += Math.sin(tm * 0.7 + cn * 9.425) * r * C.twist;

      // 5. Zigzag
      const zt = tm * 0.15 + rn * 2;
      const zx = zt - Math.floor(zt / 6) * 6;
      let zv;
      if (zx < 2) zv = zx * 0.5;
      else if (zx < 3) zv = 1;
      else if (zx < 5) zv = 1 - (zx - 3) * 0.5;
      else zv = 0;
      cx += zv * r * C.zigzag * rowDir;

      // 6. Scroll wrap (horizontal)
      cx += scrollX;
      if (cx < 0) cx += Math.floor(-cx / wrapW + 1) * wrapW;
      cx = cx - Math.floor(cx / wrapW) * wrapW;

      // Cull + clamp
      const sr = r * sc;
      if (cx + sr < -50 || cx - sr > W + 50) continue;
      if (sc > 1.5) sc = 1.5;
      else if (sc < 0.25) sc = 0.25;
      const al = sc > 1 ? 1 : sc;

      // Draw
      const qy = b.aH * (1 + ea) * sc * 2;
      ctx.beginPath();
      ctx.moveTo(cx - sr, cy);
      ctx.quadraticCurveTo(cx, cy - qy, cx + sr, cy);
      ctx.quadraticCurveTo(cx, cy + qy, cx - sr, cy);
      ctx.closePath();
      ctx.globalAlpha = al;
      const ckey = b.pal.f;
      const grad = ctx.createRadialGradient(cx - sr * 0.2, cy - sr * 0.3, 0, cx, cy, sr);
      grad.addColorStop(0, this._L[ckey] || (this._L[ckey] = lighten(ckey, 20)));
      grad.addColorStop(0.5, ckey);
      grad.addColorStop(1, this._D[ckey] || (this._D[ckey] = darken(ckey, 15)));
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = b.pal.l;
      ctx.lineWidth = 1;
      ctx.globalAlpha = al * 0.35;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
};

// ── TransitionFlash Hook ──
const TransitionFlash = {
  mounted() {
    this.el = document.getElementById('transition-flash');
    if (!this.el) return;

    this.handleEvent("slide_change", () => {
      this.el.style.opacity = '1';
      setTimeout(() => {
        this.el.style.opacity = '0';
      }, 250);
    });
  }
};

export { BubbleQuilt, TransitionFlash };
