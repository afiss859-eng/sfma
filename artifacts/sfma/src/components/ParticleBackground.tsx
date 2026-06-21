import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: "spark" | "ember" | "star";
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
    const COLORS_SPARK = ["#C9A227", "#FFD700", "#FFA500"];
    const COLORS_EMBER = ["#CC0000", "#FF4444", "#8B0000"];
    const COLORS_STAR = ["#C9A227", "#FFFFFF", "#FFD700"];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawnParticle = () => {
      if (particles.length > 120) return;
      const type = Math.random() < 0.5 ? "spark" : Math.random() < 0.6 ? "ember" : "star";
      const maxLife = 150 + Math.random() * 200;

      if (type === "star") {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
          size: 0.5 + Math.random() * 1.5,
          color: COLORS_STAR[Math.floor(Math.random() * COLORS_STAR.length)],
          alpha: 0, life: 0, maxLife, type,
        });
      } else if (type === "ember") {
        particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -(0.2 + Math.random() * 0.8),
          size: 1.5 + Math.random() * 3,
          color: COLORS_EMBER[Math.floor(Math.random() * COLORS_EMBER.length)],
          alpha: 0, life: 0, maxLife, type,
        });
      } else {
        particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -(0.5 + Math.random() * 1.5),
          size: 0.8 + Math.random() * 2,
          color: COLORS_SPARK[Math.floor(Math.random() * COLORS_SPARK.length)],
          alpha: 0, life: 0, maxLife, type,
        });
      }
    };

    let frame = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      if (frame % 2 === 0) spawnParticle();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        if (p.type !== "star") {
          p.vx += (Math.random() - 0.5) * 0.03;
          p.vy *= 0.999;
        } else {
          // Twinkle stars
          p.vx += (Math.random() - 0.5) * 0.01;
          p.vy += (Math.random() - 0.5) * 0.01;
        }

        const progress = p.life / p.maxLife;
        if (p.type === "star") {
          p.alpha = Math.sin(progress * Math.PI) * 0.6;
        } else {
          p.alpha = progress < 0.15
            ? (progress / 0.15) * 0.8
            : progress > 0.6
            ? ((1 - progress) / 0.4) * 0.8
            : 0.8;
        }

        if (p.life >= p.maxLife || p.y < -20 || p.x < -20 || p.x > canvas.width + 20) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (p.type === "spark") {
          // Trait lumineux
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.5;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 4, p.y - p.vy * 4);
          ctx.stroke();
        } else if (p.type === "ember") {
          // Cercle avec glow
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Étoile scintillante
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.size * 4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

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
