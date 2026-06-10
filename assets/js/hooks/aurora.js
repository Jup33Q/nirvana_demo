/**
 * Aurora Breath Field — Phoenix LiveView Hook
 * Ultra-lightweight canvas background: 36 radial light bands with mouse reactivity.
 * Performance: minimal CPU usage, simple quadratic curves, low trail alpha.
 */

const Aurora = {
  mounted() {
    this.canvas = this.el;
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = 0;
    this.h = 0;
    this.time = 0;
    this.rafId = 0;

    this.mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    this._onResize = () => this.resize();
    this._onMouseMove = (e) => {
      this.mouse.tx = e.clientX;
      this.mouse.ty = e.clientY;
    };
    this._onTouchMove = (e) => {
      if (e.touches.length > 0) {
        this.mouse.tx = e.touches[0].clientX;
        this.mouse.ty = e.touches[0].clientY;
      }
    };
    this._onVisibility = () => {
      document.hidden ? this.pause() : this.play();
    };

    window.addEventListener('resize', this._onResize);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('touchmove', this._onTouchMove, { passive: true });
    document.addEventListener('visibilitychange', this._onVisibility);

    this.resize();
    this.play();
  },

  destroyed() {
    this.pause();
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('touchmove', this._onTouchMove);
    document.removeEventListener('visibilitychange', this._onVisibility);
  },

  resize() {
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w * this.dpr;
    this.canvas.height = this.h * this.dpr;
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  },

  play() {
    if (!this.rafId) this.loop();
  },

  pause() {
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  },

  loop() {
    this.rafId = requestAnimationFrame(() => this.loop());
    this.time += 1;

    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.1;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.1;

    const centerX = this.w / 2;
    const centerY = this.h / 2;
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(6, 8, 15, 0.08)';
    ctx.fillRect(0, 0, this.w, this.h);

    for (let i = 0; i < 36; i++) {
      const baseAngle = i * ((Math.PI * 2) / 36) + this.time * 0.003 * (i % 2 === 0 ? 1 : -1);
      const mouseOffset = Math.atan2(this.mouse.ty - centerY, this.mouse.tx - centerX) * 0.08 * (1 - i / 36);
      const angle = baseAngle + mouseOffset;
      const length = Math.min(this.w, this.h) * 0.45 * (0.6 + 0.4 * Math.sin(this.time * 0.002 + i * 0.3));

      const sx = centerX;
      const sy = centerY;
      const ex = centerX + Math.cos(angle) * length;
      const ey = centerY + Math.sin(angle) * length;
      const cx = centerX + Math.cos(angle + 0.3) * length * 0.5 + (this.mouse.x - centerX) * 0.05;
      const cy = centerY + Math.sin(angle + 0.3) * length * 0.5 + (this.mouse.y - centerY) * 0.05;

      const grad = ctx.createLinearGradient(sx, sy, ex, ey);
      grad.addColorStop(0, 'rgba(0, 229, 255, 0)');
      grad.addColorStop(0.3, 'rgba(0, 229, 255, 0.06)');
      grad.addColorStop(1, 'rgba(0, 180, 255, 0)');

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(cx, cy, ex, ey);
      ctx.lineWidth = 2 + Math.sin(this.time * 0.004 + i) * 1.5;
      ctx.strokeStyle = grad;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    const glowRadius = Math.min(this.w, this.h) * 0.15;
    const radialGrad = ctx.createRadialGradient(
      centerX + (this.mouse.x - centerX) * 0.02,
      centerY + (this.mouse.y - centerY) * 0.02,
      0,
      centerX,
      centerY,
      glowRadius
    );
    radialGrad.addColorStop(0, 'rgba(0, 229, 255, 0.08)');
    radialGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
    ctx.fillStyle = radialGrad;
    ctx.fillRect(0, 0, this.w, this.h);
  },
};

export { Aurora };
