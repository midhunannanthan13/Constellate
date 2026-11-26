import React, { useEffect, useRef } from 'react';

/**
 * Starfield Component
 * Renders a soothing, multi-depth night sky with slow twinkling stars.
 * Respects `prefers-reduced-motion` by freezing animation into a serene static sky.
 */
export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Generate balanced star distribution
    const numStars = Math.floor((width * height) / 3200); // Responsive star density
    const stars = [];

    // Aurora accent palette for gentle star tinting
    const starColors = [
      '#FFFFFF',
      '#EAF0FF',
      '#FFD76A', // Gold
      '#3EE6C3', // Teal
      '#8B7CFF', // Violet
      '#FF7AC6', // Pink
    ];

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() < 0.85 ? Math.random() * 1.2 + 0.4 : Math.random() * 1.8 + 1.2,
        baseAlpha: Math.random() * 0.5 + 0.3,
        alpha: Math.random() * 0.5 + 0.3,
        twinkleSpeed: prefersReducedMotion ? 0 : Math.random() * 0.015 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render gentle background stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        if (!prefersReducedMotion) {
          star.twinklePhase += star.twinkleSpeed;
          star.alpha = star.baseAlpha + Math.sin(star.twinklePhase) * 0.3;
          if (star.alpha < 0.1) star.alpha = 0.1;
          if (star.alpha > 0.95) star.alpha = 0.95;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.fill();

        // Extra soft glow for prominent stars
        if (star.radius > 1.8) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = star.alpha * 0.2;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      render();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="starfield-canvas"
      aria-hidden="true"
    />
  );
}
