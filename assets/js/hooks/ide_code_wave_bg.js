/**
 * IDE Code Wave Background
 * A mouse-reactive animated background with code characters in wave layout + IDE syntax highlighting.
 * Usage: new IdeCodeWaveBg(canvasElement, options)
 */

const IDE_COLORS = {
  keyword:   '#c678dd',
  function:  '#61afef',
  string:    '#98c379',
  number:    '#d19a66',
  comment:   '#5c6370',
  operator:  '#56b6c2',
  punct:     '#abb2bf',
  type:      '#e5c07b',
  variable:  '#e06c75',
  default:   '#abb2bf',
};

const JS_KEYWORDS = new Set([
  'const','let','var','function','return','if','else','for','while','do','break','continue',
  'switch','case','default','try','catch','finally','throw','new','this','class','extends',
  'super','import','export','from','as','async','await','yield','typeof','instanceof',
  'in','of','void','delete','true','false','null','undefined','static','get','set',
  'constructor','prototype'
]);

const JS_TYPES = new Set([
  'String','Number','Boolean','Array','Object','Function','Promise','Map','Set',
  'Date','RegExp','Error','Symbol','BigInt','console','document','window',
  'Math','JSON','parseInt','parseFloat','isNaN','setTimeout','setInterval',
  'fetch','require','module','exports'
]);

const JS_FUNCTIONS = new Set([
  'log','warn','error','info','map','filter','reduce','forEach','find','indexOf',
  'includes','join','split','replace','slice','splice','push','pop','shift','unshift',
  'sort','reverse','concat','toString','charAt','toUpperCase','toLowerCase','trim',
  'substr','substring','match','search','exec','test','then','catch','finally',
  'addEventListener','removeEventListener','querySelector','querySelectorAll',
  'getElementById','getElementsByClassName','createElement','appendChild',
  'removeChild','setAttribute','getAttribute','add','delete','has','clear',
  'keys','values','entries','animate','requestAnimationFrame','cancelAnimationFrame',
  'dispatchEvent','emit','on','off','init','render','update','loop','clamp',
  'lerp','dist','randomRange','hslToRgb','abs','floor','ceil','round','max',
  'min','pow','sqrt','sin','cos','tan','atan2','exp','log','random','sign',
  'now','parse','stringify','from','isArray','create','assign','freeze','seal',
  'defineProperty','getOwnPropertyNames','hasOwnProperty','toFixed','toPrecision',
  'valueOf','localStorage','sessionStorage','cookie','fetch','post','get','put',
  'delete','patch','send','json','text','blob','arrayBuffer','cloneNode',
  'insertBefore','replaceChild','contains','focus','blur','click','scrollTo',
  'scrollBy','getBoundingClientRect','getComputedStyle','setTimeout','setInterval',
  'clearTimeout','clearInterval','encodeURIComponent','decodeURIComponent',
  'escape','unescape','btoa','atob','isFinite','encodeURI','decodeURI',
  'eval','hint','bind','call','apply','toJSON','localeCompare','padStart',
  'padEnd','repeat','startsWith','endsWith','codePointAt','fromCodePoint',
  'raw','isInteger','isSafeInteger','isFinite','isNaN','EPSILON','MAX_SAFE_INTEGER',
  'MIN_SAFE_INTEGER','MAX_VALUE','MIN_VALUE','POSITIVE_INFINITY','NEGATIVE_INFINITY',
  'NaN','of','copyWithin','fill','findIndex','flat','flatMap','reduceRight',
  'every','some','lastIndexOf','toLocaleString','unshift','splice','pop',
  'getContext','toDataURL',' arc','moveTo','lineTo','stroke','fill','beginPath',
  'closePath','rect','save','restore','clip','rotate','scale','translate',
  'transform','setTransform','resetTransform','measureText','createLinearGradient',
  'createRadialGradient','createPattern','drawImage','putImageData','getImageData',
  'createImageData','quadraticCurveTo','bezierCurveTo','ellipse','clearRect',
  'strokeRect','fillRect','strokeText','fillText','setLineDash','getLineDash'
]);

function tokenizeCode(code) {
  const tokens = [];
  let i = 0;
  while (i < code.length) {
    const ch = code[i];

    if (/\s/.test(ch)) {
      tokens.push({ char: ch, type: 'space' });
      i++;
      continue;
    }

    if (ch === '/' && code[i + 1] === '/') {
      while (i < code.length && code[i] !== '\n') {
        tokens.push({ char: code[i], type: 'comment' });
        i++;
      }
      continue;
    }

    if (ch === '/' && code[i + 1] === '*') {
      tokens.push({ char: code[i], type: 'comment' });
      i++;
      tokens.push({ char: code[i], type: 'comment' });
      i++;
      while (i < code.length && !(code[i-1] === '*' && code[i] === '/')) {
        tokens.push({ char: code[i], type: 'comment' });
        i++;
      }
      continue;
    }

    if (ch === '"') {
      tokens.push({ char: ch, type: 'string' });
      i++;
      while (i < code.length && code[i] !== '"') {
        tokens.push({ char: code[i], type: 'string' });
        i++;
      }
      if (i < code.length) {
        tokens.push({ char: code[i], type: 'string' });
        i++;
      }
      continue;
    }

    if (ch === "'") {
      tokens.push({ char: ch, type: 'string' });
      i++;
      while (i < code.length && code[i] !== "'") {
        tokens.push({ char: code[i], type: 'string' });
        i++;
      }
      if (i < code.length) {
        tokens.push({ char: code[i], type: 'string' });
        i++;
      }
      continue;
    }

    if (ch === '`') {
      tokens.push({ char: ch, type: 'string' });
      i++;
      while (i < code.length && code[i] !== '`') {
        tokens.push({ char: code[i], type: 'string' });
        i++;
      }
      if (i < code.length) {
        tokens.push({ char: code[i], type: 'string' });
        i++;
      }
      continue;
    }

    if (/\d/.test(ch)) {
      while (i < code.length && /[\d.]/.test(code[i])) {
        tokens.push({ char: code[i], type: 'number' });
        i++;
      }
      continue;
    }

    if (/[a-zA-Z_$]/.test(ch)) {
      let word = '';
      const start = i;
      while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) {
        word += code[i];
        i++;
      }
      let type = 'default';
      if (JS_KEYWORDS.has(word)) type = 'keyword';
      else if (JS_TYPES.has(word)) type = 'type';
      else if (JS_FUNCTIONS.has(word)) type = 'function';
      else if (code[i] === '(') type = 'function';
      else type = 'variable';

      for (let k = start; k < i; k++) {
        tokens.push({ char: code[k], type });
      }
      continue;
    }

    if (/[+\-*/%=<>!&|^~?:]/.test(ch)) {
      tokens.push({ char: ch, type: 'operator' });
      i++;
      continue;
    }

    if (/[(){}\[\];,.@#]/.test(ch)) {
      tokens.push({ char: ch, type: 'punct' });
      i++;
      continue;
    }

    tokens.push({ char: ch, type: 'default' });
    i++;
  }
  return tokens;
}

// Random code snippets pool for diversity on each refresh
const CODE_SNIPPETS = [
  [
    'const canvas = document.getElementById("bg");',
    'const ctx = canvas.getContext("2d");',
    '',
    'class ParticleSystem {',
    '  constructor(config) {',
    '    this.particles = [];',
    '    this.gravity = 0.15;',
    '    this.maxCount = 2000;',
    '    Object.assign(this, config);',
    '  }',
    '',
    '  emit(x, y, count = 10) {',
    '    for (let i = 0; i < count; i++) {',
    '      if (this.particles.length >= this.maxCount) break;',
    '      this.particles.push({',
    '        x: x, y: y,',
    '        vx: (Math.random() - 0.5) * 8,',
    '        vy: (Math.random() - 0.5) * 8,',
    '        size: Math.random() * 3 + 1,',
    '        alpha: Math.random() * 0.5 + 0.5,',
    '        life: 1.0, hue: Math.random() * 360',
    '      });',
    '    }',
    '  }',
    '',
    '  update(dt) {',
    '    this.particles.forEach(p => {',
    '      p.x += p.vx * dt;',
    '      p.y += p.vy * dt;',
    '      p.vy += this.gravity;',
    '      p.life -= dt * 0.5;',
    '      p.alpha = p.life;',
    '    });',
    '    this.particles = this.particles.filter(p => p.life > 0);',
    '  }',
    '',
    '  render(ctx) {',
    '    this.particles.forEach(p => {',
    '      ctx.beginPath();',
    '      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);',
    '      ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.alpha})`;',
    '      ctx.fill();',
    '    });',
    '  }',
    '}',
    '',
    'const engine = new RenderEngine(canvas);',
    'const particles = new ParticleSystem({ maxCount: 5000 });',
    'engine.start();',
    '/* END */'
  ],
  [
    'import { useState, useEffect } from "react";',
    '',
    'const NeuralNetwork = ({ layers }) => {',
    '  const [weights, setWeights] = useState([]);',
    '  const [bias, setBias] = useState(0.01);',
    '',
    '  useEffect(() => {',
    '    const init = () => {',
    '      const w = layers.map((n, i) =>',
    '        Array.from({ length: n }, () =>',
    '          Math.random() * 2 - 1',
    '        )',
    '      );',
    '      setWeights(w);',
    '    };',
    '    init();',
    '  }, [layers]);',
    '',
    '  const sigmoid = (x) => 1 / (1 + Math.exp(-x));',
    '  const forward = (input) => {',
    '    let a = input;',
    '    for (const w of weights) {',
    '      a = a.map((v, i) => sigmoid(v * w[i] + bias));',
    '    }',
    '    return a;',
    '  };',
    '',
    '  return { forward, weights };',
    '};',
    '',
    'export default NeuralNetwork;',
    '/* END */'
  ],
  [
    'defmodule PhoenixLiveView.SlideDeck do',
    '  use Phoenix.LiveView',
    '',
    '  @impl true',
    '  def mount(_params, _session, socket) do',
    '    slides = Slides.list_slides()',
    '    {:ok, assign(socket, slides: slides, current: 0)}',
    '  end',
    '',
    '  @impl true',
    '  def handle_event("next", _params, socket) do',
    '    current = rem(socket.assigns.current + 1, length(socket.assigns.slides))',
    '    {:noreply, assign(socket, current: current)}',
    '  end',
    '',
    '  @impl true',
    '  def render(assigns) do',
    '    ~H"""',
    '    <div class="slide-deck">',
    '      <.slide :for={s <- @slides} slide={s} />',
    '    </div>',
    '    """',
    '  end',
    'end',
    '/* END */'
  ],
  [
    'async function fetchData(url) {',
    '  try {',
    '    const response = await fetch(url);',
    '    if (!response.ok) throw new Error(`HTTP ${response.status}`);',
    '    const data = await response.json();',
    '    return data.map(item => ({',
    '      id: item.id,',
    '      name: item.name.toLowerCase(),',
    '      timestamp: new Date(item.created_at).getTime()',
    '    })).filter(item => item.timestamp > Date.now() - 86400000);',
    '  } catch (err) {',
    '    console.error("Fetch failed:", err);',
    '    return [];',
    '  }',
    '}',
    '',
    'const debounce = (fn, delay) => {',
    '  let timer;',
    '  return (...args) => {',
    '    clearTimeout(timer);',
    '    timer = setTimeout(() => fn(...args), delay);',
    '  };',
    '};',
    '/* END */'
  ],
  [
    'class AudioVisualizer {',
    '  constructor(canvas, audioCtx) {',
    '    this.canvas = canvas;',
    '    this.ctx = canvas.getContext("2d");',
    '    this.analyser = audioCtx.createAnalyser();',
    '    this.analyser.fftSize = 256;',
    '    this.bufferLength = this.analyser.frequencyBinCount;',
    '    this.dataArray = new Uint8Array(this.bufferLength);',
    '  }',
    '',
    '  draw() {',
    '    this.analyser.getByteFrequencyData(this.dataArray);',
    '    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);',
    '    const barWidth = this.canvas.width / this.bufferLength;',
    '    for (let i = 0; i < this.bufferLength; i++) {',
    '      const barHeight = this.dataArray[i] * 1.5;',
    '      const hue = (i / this.bufferLength) * 360;',
    '      this.ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;',
    '      this.ctx.fillRect(',
    '        i * barWidth, this.canvas.height - barHeight,',
    '        barWidth - 1, barHeight',
    '      );',
    '    }',
    '    requestAnimationFrame(() => this.draw());',
    '  }',
    '}',
    '/* END */'
  ],
  [
    'struct User {',
    '    username: String,',
    '    email: String,',
    '    active: bool,',
    '}',
    '',
    'impl User {',
    '    fn new(username: &str, email: &str) -> Self {',
    '        User {',
    '            username: username.to_string(),',
    '            email: email.to_string(),',
    '            active: true,',
    '        }',
    '    }',
    '',
    '    fn deactivate(&mut self) {',
    '        self.active = false;',
    '    }',
    '',
    '    fn send_email(&self, subject: &str) -> Result<(), String> {',
    '        if !self.active {',
    '            return Err("User is inactive".to_string());',
    '        }',
    '        println!("Sending {} to {}", subject, self.email);',
    '        Ok(())',
    '    }',
    '}',
    '/* END */'
  ],
];

const DEFAULT_CODE = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)].join('\n');

/**
 * @param {HTMLCanvasElement} canvas
 * @param {Object} options
 * @param {string}  options.code       - Custom JS code string (default: built-in)
 * @param {number}  options.fontSize   - Character size in px (default: 15)
 * @param {number}  options.repelRadius - Mouse repulsion radius (default: 120)
 * @param {number}  options.repelForce  - Repulsion strength (default: 0.8)
 * @param {number}  options.spring      - Spring return force (default: 0.15)
 * @param {number}  options.friction    - Velocity damping (default: 0.90)
 * @param {number}  options.waveAmpX    - Primary wave amplitude (default: 45)
 * @param {number}  options.waveFreqX   - Primary wave frequency (default: 0.12)
 * @param {number}  options.waveAmpX2   - Secondary wave amplitude (default: 22)
 * @param {number}  options.waveFreqX2  - Secondary wave frequency (default: 0.04)
 * @param {boolean} options.ideColors   - Enable IDE syntax highlighting (default: true)
 * @param {boolean} options.trail       - Enable motion trail effect (default: true)
 */
class IdeCodeWaveBg {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.config = {
      code: options.code || DEFAULT_CODE,
      fontSize: options.fontSize ?? 15,
      repelRadius: options.repelRadius ?? 120,
      repelForce: options.repelForce ?? 0.8,
      spring: options.spring ?? 0.15,
      friction: options.friction ?? 0.90,
      waveAmpX: options.waveAmpX ?? 45,
      waveFreqX: options.waveFreqX ?? 0.12,
      waveAmpX2: options.waveAmpX2 ?? 22,
      waveFreqX2: options.waveFreqX2 ?? 0.04,
      ideColors: options.ideColors !== false,
      trail: options.trail !== false,
    };

    this.width = canvas.offsetWidth || window.innerWidth;
    this.height = canvas.offsetHeight || window.innerHeight;
    canvas.width = this.width;
    canvas.height = this.height;

    // Restore mouse position from sessionStorage to survive LiveView remounts
    const savedMouse = sessionStorage.getItem('ide_code_wave_mouse');
    if (savedMouse) {
      const pos = JSON.parse(savedMouse);
      this.mouse = { x: pos.x, y: pos.y, active: true };
      this.mouseSmooth = { x: pos.x, y: pos.y };
    } else {
      this.mouse = { x: -9999, y: -9999, active: false };
      this.mouseSmooth = { x: -9999, y: -9999 };
    }

    this.chars = [];
    this.tokens = [];
    this.animId = null;
    this.clickRipples = [];

    this._bindEvents();
    this._generateChars();
    this._start();
  }

  _tokenize() {
    return this.config.ideColors ? tokenizeCode(this.config.code) : [];
  }

  _generateChars() {
    const code = this.config.code;
    const tokens = this._tokenize();
    const fs = this.config.fontSize;
    const colGap = fs * 1.15;
    const rowGap = fs * 1.8;
    const cols = Math.ceil(this.width / colGap);
    const waveMaxOff = this.config.waveAmpX + this.config.waveAmpX2;
    const extraRows = Math.ceil(waveMaxOff * 2 / rowGap) + 3;
    const rows = Math.ceil(this.height / rowGap) + extraRows;
    const total = cols * rows;
    const codeChars = code.split('');

    this.chars = [];
    this.tokens = tokens;

    for (let i = 0; i < total; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const waveY =
        Math.sin(col * this.config.waveFreqX) * this.config.waveAmpX +
        Math.sin(col * this.config.waveFreqX2) * this.config.waveAmpX2;

      const totalH = rows * rowGap;
      const startY = (this.height - totalH) / 2 + waveMaxOff;
      const x = col * colGap + colGap / 2;
      const y = startY + row * rowGap + waveY;

      const codeIdx = i % codeChars.length;
      this.chars.push({
        char: codeChars[codeIdx],
        originX: x,
        originY: y,
        x, y,
        vx: 0, vy: 0,
        scale: 1,
        phase: Math.random() * Math.PI * 2,
        tokenType: tokens[codeIdx]?.type || null,
      });
    }
  }

  _bindEvents() {
    this._onMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.active = true;
    };
    this._onLeave = () => { this.mouse.active = false; };
    this._onTouch = (e) => {
      const t = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = t.clientX - rect.left;
      this.mouse.y = t.clientY - rect.top;
      this.mouse.active = true;
    };
    this._onTouchEnd = () => { this.mouse.active = false; };
    this._onResize = () => {
      this.width = this.canvas.offsetWidth || window.innerWidth;
      this.height = this.canvas.offsetHeight || window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this._generateChars();
    };
    this._onClick = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.clickRipples.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        radius: 0,
        strength: 1,
        speed: 6,
      });
    };

    window.addEventListener('mousemove', this._onMove);
    window.addEventListener('mouseleave', this._onLeave);
    window.addEventListener('touchmove', this._onTouch, { passive: true });
    window.addEventListener('touchend', this._onTouchEnd);
    window.addEventListener('resize', this._onResize);
    this.canvas.addEventListener('click', this._onClick);
  }

  _start() {
    const loop = () => {
      this._update();
      this._draw();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  _update() {
    if (this.mouse.active) {
      this.mouseSmooth.x += (this.mouse.x - this.mouseSmooth.x) * 0.15;
      this.mouseSmooth.y += (this.mouse.y - this.mouseSmooth.y) * 0.15;
    } else {
      this.mouseSmooth.x += (-9999 - this.mouseSmooth.x) * 0.03;
      this.mouseSmooth.y += (-9999 - this.mouseSmooth.y) * 0.03;
    }

    const mx = this.mouseSmooth.x;
    const my = this.mouseSmooth.y;
    const { repelRadius, repelForce, spring, friction } = this.config;
    const time = Date.now() * 0.001;

    // Update click ripples
    for (let i = this.clickRipples.length - 1; i >= 0; i--) {
      const rip = this.clickRipples[i];
      rip.radius += rip.speed;
      rip.strength *= 0.96;
      if (rip.strength < 0.01) {
        this.clickRipples.splice(i, 1);
      }
    }

    for (const c of this.chars) {
      const dx = c.x - mx;
      const dy = c.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < repelRadius && this.mouse.active) {
        const f = (1 - dist / repelRadius) * repelForce * 15;
        const angle = Math.atan2(dy, dx);
        c.vx += Math.cos(angle) * f;
        c.vy += Math.sin(angle) * f;
        c.scale = 1 + (1 - dist / repelRadius) * 0.35;
      } else {
        c.scale += (1 - c.scale) * 0.1;
      }

      // Click ripple push effect
      for (const rip of this.clickRipples) {
        const rdx = c.x - rip.x;
        const rdy = c.y - rip.y;
        const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
        const rippleWidth = 40;
        if (rdist > rip.radius - rippleWidth && rdist < rip.radius + rippleWidth) {
          const falloff = 1 - Math.abs(rdist - rip.radius) / rippleWidth;
          const push = falloff * rip.strength * 12;
          const rAngle = Math.atan2(rdy, rdx);
          c.vx += Math.cos(rAngle) * push;
          c.vy += Math.sin(rAngle) * push;
          c.scale = Math.max(c.scale, 1 + falloff * rip.strength * 0.5);
        }
      }

      c.vx += (c.originX - c.x) * spring;
      c.vy += (c.originY - c.y) * spring;
      c.vx += Math.sin(time + c.phase) * 0.015;
      c.vy += Math.cos(time * 0.8 + c.phase) * 0.015;
      c.vx *= friction;
      c.vy *= friction;
      c.x += c.vx;
      c.y += c.vy;
    }
  }

  _draw() {
    const ctx = this.ctx;
    const { fontSize, ideColors, trail } = this.config;

    if (trail) {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.25)';
      ctx.fillRect(0, 0, this.width, this.height);
    } else {
      ctx.clearRect(0, 0, this.width, this.height);
    }

    const time = Date.now() * 0.001;

    // Draw click ripples
    for (const rip of this.clickRipples) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(97, 175, 239, ${rip.strength * 0.4})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#61afef';
      ctx.shadowBlur = rip.strength * 10;
      ctx.stroke();
      ctx.restore();
    }

    for (const c of this.chars) {
      let color;
      if (ideColors && c.tokenType && c.tokenType !== 'space') {
        color = IDE_COLORS[c.tokenType] || IDE_COLORS.default;
      } else {
        color = IDE_COLORS.default;
      }

      const dx = c.x - this.mouseSmooth.x;
      const dy = c.y - this.mouseSmooth.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const prox = Math.max(0, 1 - dist / this.config.repelRadius);

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.scale, c.scale);

      if (prox > 0.1) {
        ctx.shadowColor = color;
        ctx.shadowBlur = prox * 18;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }

      ctx.font = `400 ${fontSize}px 'JetBrains Mono', 'Fira Code', 'Consolas', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color;

      if (c.tokenType === 'comment') {
        ctx.globalAlpha = 0.28 + prox * 0.2;
      } else if (c.tokenType === 'space') {
        ctx.globalAlpha = 0.06;
      } else {
        ctx.globalAlpha = 0.6 + prox * 0.35;
      }

      ctx.fillText(c.char, 0, 0);
      ctx.restore();
    }

    ctx.globalAlpha = 1;
  }

  /** Update configuration at runtime */
  setOptions(options) {
    Object.assign(this.config, options);
    if (options.code !== undefined) {
      this.tokens = this._tokenize();
    }
    this._generateChars();
  }

  /** Destroy the instance and clean up */
  destroy() {
    // Save mouse position so it survives LiveView navigate remounts
    sessionStorage.setItem('ide_code_wave_mouse', JSON.stringify({
      x: this.mouse.x,
      y: this.mouse.y
    }));
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener('mousemove', this._onMove);
    window.removeEventListener('mouseleave', this._onLeave);
    window.removeEventListener('touchmove', this._onTouch);
    window.removeEventListener('touchend', this._onTouchEnd);
    window.removeEventListener('resize', this._onResize);
    this.canvas.removeEventListener('click', this._onClick);
  }
}

export { IdeCodeWaveBg };
