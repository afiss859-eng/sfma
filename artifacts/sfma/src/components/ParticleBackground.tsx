import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];
    const COLORS = ["#C9A227", "#CC0000", "#FF4444", "#FFD700", "#8B0000"];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = () => {
      if (particles.length > 80) return;
      const maxLife = 120 + Math.random() * 180;
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -(0.3 + Math.random() * 1.2),
        size: 1 + Math.random() * 2.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0,
        life: 0,
        maxLife,
      });
    };

    let frame = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      if (frame % 3 === 0) spawn();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.04;

        const progress = p.life / p.maxLife;
        p.alpha = progress < 0.2
          ? progress / 0.2
          : progress > 0.7
          ? (1 - progress) / 0.3
          : 1;

        if (p.life >= p.maxLife || p.y < -20) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha * 0.7;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="particle-canvas"
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
    />
  );
}
