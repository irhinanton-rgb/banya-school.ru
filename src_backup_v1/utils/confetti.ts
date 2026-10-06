// Lightweight zero-worker canvas confetti utility
// Avoids Blob Web Worker creation that can hang or violate CSP in strict browsers

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
}

export default function confetti(options: ConfettiOptions = {}): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    const count = options.particleCount ?? 60;
    const originX = (options.origin?.x ?? 0.5) * window.innerWidth;
    const originY = (options.origin?.y ?? 0.65) * window.innerHeight;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      canvas.remove();
      return;
    }

    const colors = ['#f59e0b', '#fbbf24', '#10b981', '#fde68a', '#d97706', '#34d399'];
    const particles = Array.from({ length: count }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * ((options.spread ?? 70) * (Math.PI / 180)) * 2;
      const speed = 6 + Math.random() * 10;
      return {
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 3,
        size: 5 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        alpha: 1,
      };
    });

    let frame = 0;
    const maxFrames = 90;

    const tick = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.32; // gravity
        p.vx *= 0.985;
        p.rotation += p.vRot;
        p.alpha = Math.max(0, 1 - frame / maxFrames);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }

      if (frame < maxFrames) {
        requestAnimationFrame(tick);
      } else {
        canvas.remove();
      }
    };

    requestAnimationFrame(tick);
  } catch {
    // Silent fallback
  }
}
