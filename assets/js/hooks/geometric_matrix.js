/**
 * Geometric Matrix Background — Phoenix LiveView Hook
 * Canvas 2D grid of shapes responding to mouse proximity with rotation, scaling, and glow.
 * Click produces a shockwave ripple.
 */

const SHAPES = ['triangle', 'hexagon', 'diamond', 'circle', 'square', 'star'];
const COLORS = ['#FFD600', '#FFAB00', '#B38600', '#FFE066', '#CC9900'];

const GRID_DENSITY = 15;
const INFLUENCE_RADIUS = 250;
const ROTATION_SPEED = 1;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

const GeometricMatrix = {
  mounted() {
    this.canvas = this.el;
    this.ctx = this.canvas.getContext('2d');

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = 0;
    this.h = 0;
    this.cells = [];
    this.shockwaves = [];
    this.trailParticles = [];
    this.fireworkParticles = [];
    this.lastTrailPos = { x: -1000, y: -1000 };

    // Restore mouse position from sessionStorage to survive LiveView navigate remounts
    const savedMouse = sessionStorage.getItem('geometric_matrix_mouse');
    if (savedMouse) {
      const pos = JSON.parse(savedMouse);
      this.mouse = { x: pos.x, y: pos.y, tx: pos.x, ty: pos.y };
    } else {
      this.mouse = { x: -1000, y: -1000, tx: -1000, ty: -1000 };
    }

    this.time = 0;
    this.rafId = 0;

    this._onResize = () => this.resize();
    this._onMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      this.mouse.tx = mx;
      this.mouse.ty = my;

      // Spawn trail particles when mouse moves
      const dx = mx - this.lastTrailPos.x;
      const dy = my - this.lastTrailPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 6) {
        const steps = Math.min(Math.floor(dist / 4), 5);
        for (let i = 0; i < steps; i++) {
          const t = i / steps;
          const px = this.lastTrailPos.x + dx * t;
          const py = this.lastTrailPos.y + dy * t;
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 0.8 + 0.2;
          this.trailParticles.push({
            x: px + (Math.random() - 0.5) * 4,
            y: py + (Math.random() - 0.5) * 4,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            decay: Math.random() * 0.015 + 0.01,
            size: Math.random() * 2.5 + 1,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
          });
        }
        this.lastTrailPos.x = mx;
        this.lastTrailPos.y = my;
      }
    };
    this._onMouseLeave = () => {
      this.mouse.tx = -1000;
      this.mouse.ty = -1000;
    };
    this._onClick = (e) => {
      // Only trigger when clicking directly on canvas
      if (e.target !== this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      // Shockwave ripple
      this.shockwaves.push({
        x: cx,
        y: cy,
        radius: 0,
        strength: 1,
      });

      // Firework burst
      const particleCount = 45 + Math.floor(Math.random() * 20);
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const speed = Math.random() * 5 + 2;
        this.fireworkParticles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          decay: Math.random() * 0.012 + 0.008,
          size: Math.random() * 3 + 1.5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          gravity: 0.12,
          friction: 0.96,
        });
      }
    };

    window.addEventListener('resize', this._onResize);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseleave', this._onMouseLeave);
    this.canvas.addEventListener('click', this._onClick);

    this.resize();
    this.animate();
  },

  destroyed() {
    // Save mouse position so it survives LiveView navigate remounts
    sessionStorage.setItem('geometric_matrix_mouse', JSON.stringify({
      x: this.mouse.x,
      y: this.mouse.y
    }));
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseleave', this._onMouseLeave);
    this.canvas.removeEventListener('click', this._onClick);
  },

  resize() {
    this.w = this.canvas.offsetWidth || window.innerWidth;
    this.h = this.canvas.offsetHeight || window.innerHeight;
    this.canvas.width = this.w * this.dpr;
    this.canvas.height = this.h * this.dpr;
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.initGrid();
  },

  initGrid() {
    const cols = GRID_DENSITY;
    const rows = Math.round(cols * (this.h / this.w)) || 1;
    const cellW = this.w / cols;
    const cellH = this.h / rows;
    this.cells = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.cells.push({
          col,
          row,
          cx: col * cellW + cellW / 2,
          cy: row * cellH + cellH / 2,
          shape: SHAPES[(col + row) % SHAPES.length],
          baseRotation: Math.random() * Math.PI * 2,
          rotation: 0,
          scale: 0.3,
          color: COLORS[(col + row) % COLORS.length],
          brightness: 0.3,
        });
      }
    }
  },

  drawShape(cell, size) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cell.cx, cell.cy);
    ctx.rotate(cell.rotation);
    ctx.scale(cell.scale, cell.scale);

    const alpha = Math.floor(cell.brightness * 0.6 * 255)
      .toString(16)
      .padStart(2, '0');
    const strokeAlpha = Math.floor(cell.brightness * 0.9 * 255)
      .toString(16)
      .padStart(2, '0');

    ctx.fillStyle = cell.color + alpha;
    ctx.strokeStyle = cell.color + strokeAlpha;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = cell.color;
    ctx.shadowBlur = (8 * (cell.brightness - 0.3)) / 0.7;

    ctx.beginPath();
    switch (cell.shape) {
      case 'triangle': {
        for (let i = 0; i < 3; i++) {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
          const px = Math.cos(angle) * size;
          const py = Math.sin(angle) * size;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'hexagon': {
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const px = Math.cos(angle) * size;
          const py = Math.sin(angle) * size;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'diamond': {
        ctx.moveTo(0, -size * 1.5);
        ctx.lineTo(size * 0.8, 0);
        ctx.lineTo(0, size * 1.5);
        ctx.lineTo(-size * 0.8, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'circle': {
        if (cell.brightness > 0.6) {
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'square': {
        const hs = size * 0.85;
        ctx.moveTo(-hs, -hs);
        ctx.lineTo(hs, -hs);
        ctx.lineTo(hs, hs);
        ctx.lineTo(-hs, hs);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'star': {
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const r = i % 2 === 0 ? size : size * 0.4;
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
    }
    ctx.restore();
  },

  animate() {
    this.rafId = requestAnimationFrame(() => this.animate());
    this.time += 1;
    this.mouse.x = lerp(this.mouse.x, this.mouse.tx, 0.12);
    this.mouse.y = lerp(this.mouse.y, this.mouse.ty, 0.12);

    this.ctx.fillStyle = '#06080F';
    this.ctx.fillRect(0, 0, this.w, this.h);

    // Update & draw mouse trail particles
    for (let i = this.trailParticles.length - 1; i >= 0; i--) {
      const p = this.trailParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.trailParticles.splice(i, 1);
        continue;
      }
      const alpha = p.life * 0.8;
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = p.size * 3;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    const cellW = this.w / GRID_DENSITY;
    const rows = Math.round(GRID_DENSITY * (this.h / this.w)) || 1;
    const cellH = this.h / rows;
    const size = Math.min(cellW, cellH) * 0.35;

    // Update & draw firework particles
    for (let i = this.fireworkParticles.length - 1; i >= 0; i--) {
      const p = this.fireworkParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.fireworkParticles.splice(i, 1);
        continue;
      }
      const alpha = p.life * 0.9;
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = p.size * 4;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      this.shockwaves[i].radius += 8;
      this.shockwaves[i].strength *= 0.96;
      if (this.shockwaves[i].strength < 0.01) {
        this.shockwaves.splice(i, 1);
      }
    }

    for (const cell of this.cells) {
      const dx = this.mouse.x - cell.cx;
      const dy = this.mouse.y - cell.cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let influence = Math.max(0, 1 - dist / INFLUENCE_RADIUS);

      // Shockwave influence
      for (const sw of this.shockwaves) {
        const swDist = Math.abs(
          Math.sqrt((cell.cx - sw.x) ** 2 + (cell.cy - sw.y) ** 2) - sw.radius
        );
        if (swDist < 60) {
          const swInf = (1 - swDist / 60) * sw.strength;
          influence = Math.max(influence, swInf);
        }
      }

      const targetRotation =
        cell.baseRotation + influence * Math.PI * 2 + this.time * 0.002 * ROTATION_SPEED;
      cell.rotation = lerp(cell.rotation, targetRotation, 0.08);
      cell.scale = lerp(cell.scale, 0.3 + influence * 0.7, 0.1);
      cell.brightness = 0.3 + influence * 0.7;

      this.drawShape(cell, size);
    }
  },
};

export { GeometricMatrix };
