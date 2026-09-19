"use client";

import React, { useEffect, useRef } from "react";

interface RadarScannerProps {
  activeScanning?: boolean;
  matchScore?: number;
}

export function RadarScanner({ activeScanning = false, matchScore }: RadarScannerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    // Vector embedding coordinates
    const nodes = Array.from({ length: 20 }).map((_, i) => ({
      dist: 35 + Math.random() * 115,
      angle: Math.random() * Math.PI * 2,
      speed: (Math.random() - 0.5) * 0.004,
      size: 2 + Math.random() * 2,
      alpha: 0.25 + Math.random() * 0.5,
      color: i % 2 === 0 ? "#00D8E6" : "#4F46E5"
    }));

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Range Rings
      const rings = [40, 80, 120, 160];
      rings.forEach((r) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(30, 38, 56, 0.8)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Axis Grid
      ctx.beginPath();
      ctx.moveTo(centerX - 165, centerY);
      ctx.lineTo(centerX + 165, centerY);
      ctx.moveTo(centerX, centerY - 165);
      ctx.lineTo(centerX, centerY + 165);
      ctx.strokeStyle = "rgba(30, 38, 56, 0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Radar Sweep
      angle += activeScanning ? 0.035 : 0.01;
      const sweepAngle = Math.PI / 4;

      const grad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 165);
      grad.addColorStop(0, "rgba(0, 216, 230, 0.25)");
      grad.addColorStop(1, "rgba(0, 216, 230, 0.0)");

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, 165, angle, angle + sweepAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Leading beam
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle + sweepAngle) * 165,
        centerY + Math.sin(angle + sweepAngle) * 165
      );
      ctx.strokeStyle = "rgba(0, 216, 230, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Manifold Nodes
      nodes.forEach((node) => {
        node.angle += node.speed;
        const nx = centerX + Math.cos(node.angle) * node.dist;
        const ny = centerY + Math.sin(node.angle) * node.dist;

        const diff = (angle + sweepAngle - node.angle + Math.PI * 4) % (Math.PI * 2);
        const isSwept = diff < sweepAngle;

        ctx.beginPath();
        ctx.arc(nx, ny, isSwept ? node.size * 1.5 : node.size, 0, Math.PI * 2);
        ctx.fillStyle = isSwept ? "#00D8E6" : node.color;
        ctx.globalAlpha = isSwept ? 1.0 : node.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Central Origin
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#00D8E6";
      ctx.fill();

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
        width={340}
        height={340}
        className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] rounded-full"
      />
      {matchScore && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-3xl font-extrabold text-brand-cyan font-mono tracking-tight">
            {matchScore.toFixed(1)}%
          </div>
          <div className="text-[10px] uppercase tracking-wider text-content-muted font-mono mt-0.5">
            Cosine Similarity
          </div>
        </div>
      )}
    </div>
  );
}
