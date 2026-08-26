import { useEffect, useRef } from 'react';

// 2D Navier-Stokes Fluid Solver (Jos Stam's Stable Fluids)
class FluidSolver {
  size: number;
  dt: number;
  diff: number;
  visc: number;
  s: Float32Array;
  density: Float32Array;
  Vx: Float32Array;
  Vy: Float32Array;
  Vx0: Float32Array;
  Vy0: Float32Array;

  constructor(size: number, dt = 0.15, diffusion = 0.00001, viscosity = 0.00002) {
    this.size = size;
    this.dt = dt;
    this.diff = diffusion;
    this.visc = viscosity;

    const total = size * size;
    this.s = new Float32Array(total);
    this.density = new Float32Array(total);
    this.Vx = new Float32Array(total);
    this.Vy = new Float32Array(total);
    this.Vx0 = new Float32Array(total);
    this.Vy0 = new Float32Array(total);
  }

  IX(x: number, y: number): number {
    x = Math.max(0, Math.min(this.size - 1, Math.floor(x)));
    y = Math.max(0, Math.min(this.size - 1, Math.floor(y)));
    return x + y * this.size;
  }

  addVelocity(x: number, y: number, amountX: number, amountY: number) {
    const index = this.IX(x, y);
    this.Vx[index] += amountX;
    this.Vy[index] += amountY;
  }

  set_bnd(b: number, x: Float32Array) {
    const N = this.size;
    for (let i = 1; i < N - 1; i++) {
      x[this.IX(i, 0)] = b === 2 ? -x[this.IX(i, 1)] : x[this.IX(i, 1)];
      x[this.IX(i, N - 1)] = b === 2 ? -x[this.IX(i, N - 2)] : x[this.IX(i, N - 2)];
    }
    for (let j = 1; j < N - 1; j++) {
      x[this.IX(0, j)] = b === 1 ? -x[this.IX(1, j)] : x[this.IX(1, j)];
      x[this.IX(N - 1, j)] = b === 1 ? -x[this.IX(N - 2, j)] : x[this.IX(N - 2, j)];
    }
    x[this.IX(0, 0)] = 0.5 * (x[this.IX(1, 0)] + x[this.IX(0, 1)]);
    x[this.IX(0, N - 1)] = 0.5 * (x[this.IX(1, N - 1)] + x[this.IX(0, N - 2)]);
    x[this.IX(N - 1, 0)] = 0.5 * (x[this.IX(N - 2, 0)] + x[this.IX(N - 1, 1)]);
    x[this.IX(N - 1, N - 1)] = 0.5 * (x[this.IX(N - 2, N - 1)] + x[this.IX(N - 1, N - 2)]);
  }

  lin_solve(b: number, x: Float32Array, x0: Float32Array, a: number, c: number) {
    const cRecip = 1.0 / c;
    const N = this.size;
    for (let k = 0; k < 4; k++) {
      for (let j = 1; j < N - 1; j++) {
        for (let i = 1; i < N - 1; i++) {
          x[this.IX(i, j)] =
            (x0[this.IX(i, j)] +
              a *
                (x[this.IX(i + 1, j)] +
                  x[this.IX(i - 1, j)] +
                  x[this.IX(i, j + 1)] +
                  x[this.IX(i, j - 1)])) *
            cRecip;
        }
      }
      this.set_bnd(b, x);
    }
  }

  diffuse(b: number, x: Float32Array, x0: Float32Array, diff: number) {
    const a = this.dt * diff * (this.size - 2) * (this.size - 2);
    this.lin_solve(b, x, x0, a, 1 + 6 * a);
  }

  project(velocX: Float32Array, velocY: Float32Array, p: Float32Array, div: Float32Array) {
    const N = this.size;
    for (let j = 1; j < N - 1; j++) {
      for (let i = 1; i < N - 1; i++) {
        div[this.IX(i, j)] =
          (-0.5 *
            (velocX[this.IX(i + 1, j)] -
              velocX[this.IX(i - 1, j)] +
              velocY[this.IX(i, j + 1)] -
              velocY[this.IX(i, j - 1)])) /
          N;
        p[this.IX(i, j)] = 0;
      }
    }
    this.set_bnd(0, div);
    this.set_bnd(0, p);
    this.lin_solve(0, p, div, 1, 6);

    for (let j = 1; j < N - 1; j++) {
      for (let i = 1; i < N - 1; i++) {
        velocX[this.IX(i, j)] -= 0.5 * (p[this.IX(i + 1, j)] - p[this.IX(i - 1, j)]) * N;
        velocY[this.IX(i, j)] -= 0.5 * (p[this.IX(i, j + 1)] - p[this.IX(i, j - 1)]) * N;
      }
    }
    this.set_bnd(1, velocX);
    this.set_bnd(2, velocY);
  }

  advect(b: number, d: Float32Array, d0: Float32Array, velocX: Float32Array, velocY: Float32Array) {
    let i0: number, i1: number, j0: number, j1: number;
    let x: number, y: number, s0: number, t0: number, s1: number, t1: number;
    const dt0 = this.dt * (this.size - 2);
    const N = this.size;

    for (let j = 1; j < N - 1; j++) {
      for (let i = 1; i < N - 1; i++) {
        x = i - dt0 * velocX[this.IX(i, j)];
        y = j - dt0 * velocY[this.IX(i, j)];

        if (x < 0.5) x = 0.5;
        if (x > N - 1.5) x = N - 1.5;
        i0 = Math.floor(x);
        i1 = i0 + 1;

        if (y < 0.5) y = 0.5;
        if (y > N - 1.5) y = N - 1.5;
        j0 = Math.floor(y);
        j1 = j0 + 1;

        s1 = x - i0;
        s0 = 1.0 - s1;
        t1 = y - j0;
        t0 = 1.0 - t1;

        d[this.IX(i, j)] =
          s0 * (t0 * d0[this.IX(i0, j0)] + t1 * d0[this.IX(i0, j1)]) +
          s1 * (t0 * d0[this.IX(i1, j0)] + t1 * d0[this.IX(i1, j1)]);
      }
    }
    this.set_bnd(b, d);
  }

  step() {
    this.diffuse(1, this.Vx0, this.Vx, this.visc);
    this.diffuse(2, this.Vy0, this.Vy, this.visc);

    this.project(this.Vx0, this.Vy0, this.Vx, this.Vy);

    this.advect(1, this.Vx, this.Vx0, this.Vx0, this.Vy0);
    this.advect(2, this.Vy, this.Vy0, this.Vx0, this.Vy0);

    this.project(this.Vx, this.Vy, this.Vx0, this.Vy0);

    // Natural decay for stability
    for (let i = 0; i < this.Vx.length; i++) {
      this.Vx[i] *= 0.985;
      this.Vy[i] *= 0.985;
    }
  }

  getVelocityAt(normalizedX: number, normalizedY: number): [number, number] {
    const x = Math.max(0, Math.min(this.size - 1, normalizedX * (this.size - 1)));
    const y = Math.max(0, Math.min(this.size - 1, normalizedY * (this.size - 1)));
    const i = Math.floor(x);
    const j = Math.floor(y);
    const fx = x - i;
    const fy = y - j;

    const idx00 = this.IX(i, j);
    const idx10 = this.IX(i + 1, j);
    const idx01 = this.IX(i, j + 1);
    const idx11 = this.IX(i + 1, j + 1);

    const vx =
      (1 - fx) * (1 - fy) * this.Vx[idx00] +
      fx * (1 - fy) * this.Vx[idx10] +
      (1 - fx) * fy * this.Vx[idx01] +
      fx * fy * this.Vx[idx11];

    const vy =
      (1 - fx) * (1 - fy) * this.Vy[idx00] +
      fx * (1 - fy) * this.Vy[idx10] +
      (1 - fx) * fy * this.Vy[idx01] +
      fx * fy * this.Vy[idx11];

    return [vx, vy];
  }
}

const GLYPH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789λπ∑∞≈∇∂θλφ';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  size: number;
  opacity: number;
  maxOpacity: number;
  age: number;
  maxAge: number;
  rotation: number;
  colorIndex: number;
}

export function NavierStokesGlyphs({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const GRID_SIZE = 36;
    const fluid = new FluidSolver(GRID_SIZE, 0.16, 0.00001, 0.00002);

    // Particles array
    const PARTICLE_COUNT = 180;
    const particles: Particle[] = [];

    const createParticle = (randomPos = false): Particle => {
      const char = GLYPH_CHARS[Math.floor(Math.random() * GLYPH_CHARS.length)];
      return {
        x: randomPos ? Math.random() * width : Math.random() > 0.5 ? 0 : Math.random() * width,
        y: randomPos ? Math.random() * height : Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        char,
        size: Math.floor(Math.random() * 6) + 11, // 11px to 16px
        opacity: 0,
        maxOpacity: Math.random() * 0.28 + 0.12,
        age: 0,
        maxAge: Math.floor(Math.random() * 400) + 250,
        rotation: (Math.random() - 0.5) * 0.3,
        colorIndex: Math.floor(Math.random() * 3),
      };
    };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = createParticle(true);
      p.age = Math.floor(Math.random() * p.maxAge);
      particles.push(p);
    }

    let mouseX = width / 2;
    let mouseY = height / 2;
    let prevMouseX = mouseX;
    let prevMouseY = mouseY;
    let isMouseActive = false;
    let mouseTimer: any = null;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMouseActive = true;
      clearTimeout(mouseTimer);
      mouseTimer = setTimeout(() => {
        isMouseActive = false;
      }, 1500);

      const dx = mouseX - prevMouseX;
      const dy = mouseY - prevMouseY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 1) {
        const gridX = (mouseX / width) * GRID_SIZE;
        const gridY = (mouseY / height) * GRID_SIZE;
        fluid.addVelocity(gridX, gridY, dx * 0.08, dy * 0.08);
      }

      prevMouseX = mouseX;
      prevMouseY = mouseY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.02;

      // 1. Ambient autonomous harmonic fluid vortex currents (Navier-Stokes driver)
      const cx1 = (Math.sin(time * 0.6) * 0.35 + 0.5) * GRID_SIZE;
      const cy1 = (Math.cos(time * 0.8) * 0.35 + 0.5) * GRID_SIZE;
      const forceX1 = Math.cos(time * 1.2) * 1.8;
      const forceY1 = Math.sin(time * 1.2) * 1.8;
      fluid.addVelocity(cx1, cy1, forceX1, forceY1);

      const cx2 = (Math.cos(time * 0.4 + 1.5) * 0.4 + 0.5) * GRID_SIZE;
      const cy2 = (Math.sin(time * 0.5 + 2.0) * 0.4 + 0.5) * GRID_SIZE;
      const forceX2 = Math.sin(time * 0.9) * -1.5;
      const forceY2 = Math.cos(time * 0.9) * 1.5;
      fluid.addVelocity(cx2, cy2, forceX2, forceY2);

      // Additional gentle stream from bottom-left to top-right
      const cx3 = (Math.sin(time * 0.3) * 0.2 + 0.2) * GRID_SIZE;
      const cy3 = (Math.cos(time * 0.3) * 0.2 + 0.8) * GRID_SIZE;
      fluid.addVelocity(cx3, cy3, 1.2, -1.0);

      // 2. Step the Navier-Stokes fluid equations
      fluid.step();

      // 3. Clear canvas with subtle trail persistence
      ctx.clearRect(0, 0, width, height);

      // 4. Extract active theme colors for glyph rendering
      const computedStyle = getComputedStyle(document.documentElement);
      const accent = computedStyle.getPropertyValue('--accent').trim() || '#6366f1';
      const textColor = computedStyle.getPropertyValue('--text-base').trim() || '#ffffff';

      // 5. Update and render glyph particles along velocity field
      ctx.font = 'bold 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.age++;

        // Calculate normalized coordinates
        const normX = Math.max(0, Math.min(1, p.x / width));
        const normY = Math.max(0, Math.min(1, p.y / height));

        // Sample fluid velocity at particle position
        const [fx, fy] = fluid.getVelocityAt(normX, normY);

        p.vx = p.vx * 0.92 + fx * 16;
        p.vy = p.vy * 0.92 + fy * 16;

        // Base gentle ambient drift
        p.x += p.vx + 0.3;
        p.y += p.vy - 0.2;

        p.rotation += (p.vx - p.vy) * 0.04;

        // Fade in and fade out envelope
        const lifeFraction = p.age / p.maxAge;
        if (lifeFraction < 0.2) {
          p.opacity = (lifeFraction / 0.2) * p.maxOpacity;
        } else if (lifeFraction > 0.8) {
          p.opacity = ((1 - lifeFraction) / 0.2) * p.maxOpacity;
        } else {
          p.opacity = p.maxOpacity;
        }

        // Render glyph
        if (p.opacity > 0.01) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          // Alternating subtle theme tints
          if (p.colorIndex === 0) {
            ctx.fillStyle = accent;
          } else if (p.colorIndex === 1) {
            ctx.fillStyle = textColor;
          } else {
            ctx.fillStyle = accent;
          }

          ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
          ctx.font = `${p.size}px monospace`;
          ctx.fillText(p.char, 0, 0);
          ctx.restore();
        }

        // Respawn if off-screen or dead
        if (p.age >= p.maxAge || p.x < -30 || p.x > width + 30 || p.y < -30 || p.y > height + 30) {
          particles[i] = createParticle(false);
          // Distribute along fluid streams
          if (Math.random() < 0.5) {
            particles[i].x = Math.random() * (width * 0.4);
            particles[i].y = height * 0.6 + Math.random() * (height * 0.4);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 z-[1] pointer-events-none select-none ${className}`}
      style={{ mixBlendMode: 'plus-lighter' }}
    />
  );
}
