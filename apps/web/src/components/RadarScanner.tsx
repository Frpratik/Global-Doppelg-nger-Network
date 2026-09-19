"use client";

import React, { useEffect, useRef } from "react";

interface RadarScannerProps {
  interactive?: boolean;
  activeScanning?: boolean;
  matchScore?: number;
}

export function RadarScanner({ interactive = false, activeScanning = false, matchScore }: RadarScannerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    // Synthetic floating nodes in vector space
    const nodes = Array.from({ length: 24 }).map((_, i) => ({
      dist: 40 + Math.random() * 110,
      angle: Math.random() * Math.PI * 2,
      speed: (Math.random() - 0.5) * 0.005,
      size: 2 + Math.random() * 2.5,
      alpha: 0.2 + Math.random() * 0.6,
      color: i % 3 === 0 ? "#00F0FF" : i % 3 === 1 ? "#A855F7" : "#00FF9D"
    }));

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // 1. Concentric Range Rings
      const rings = [45, 90, 135, 175];
      rings.forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.08 + idx * 0.03})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 2. Crosshairs
      ctx.beginPath();
      ctx.moveTo(centerX - 180, centerY);
      ctx.lineTo(centerX + 180, centerY);
      ctx.moveTo(centerX, centerY - 180);
      ctx.lineTo(centerX, centerY + 180);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 3. Radar Sweep Sector
      angle += activeScanning ? 0.045 : 0.015;
      const sweepAngle = Math.PI / 3;

      const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 180);
      grad.addColorStop(0, "rgba(0, 240, 255, 0.4)");
      grad.addColorStop(1, "rgba(0, 240, 255, 0.0)");

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, 180, angle, angle + sweepAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Leading beam
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle + sweepAngle) * 180,
        centerY + Math.sin(angle + sweepAngle) * 180
      );
      ctx.strokeStyle = "rgba(0, 240, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // 4. Floating Face Embedding Nodes
      nodes.forEach((node) => {
        node.angle += node.speed;
        const nx = centerX + Math.cos(node.angle) * node.dist;
        const ny = centerY + Math.sin(node.angle) * node.dist;

        // Check if swept by radar
        const diff = (angle + sweepAngle - node.angle + Math.PI * 4) % (Math.PI * 2);
        const isSwept = diff < sweepAngle;

        ctx.beginPath();
        ctx.arc(nx, ny, isSwept ? node.size * 1.6 : node.size, 0, Math.PI * 2);
        ctx.fillStyle = isSwept ? "#00F0FF" : node.color;
        ctx.globalAlpha = isSwept ? 1.0 : node.alpha;
        ctx.fill();

        if (isSwept) {
          ctx.beginPath();
          ctx.arc(nx, ny, node.size * 3, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(0, 240, 255, 0.5)";
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1.0;

      // 5. Central Core
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#00F0FF";
      ctx.shadowColor = "#00F0FF";
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeScanning]);

  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={380}
        height={380}
        className="w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-full"
      />
      {matchScore && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-4xl font-extrabold text-[#00F0FF] glow-cyan font-mono">
            {matchScore}%
          </div>
          <div className="text-[11px] uppercase tracking-widest text-slate-400 mt-1 font-semibold">
            Visual Proximity
          </div>
        </div>
      )}
    </div>
  );
}
