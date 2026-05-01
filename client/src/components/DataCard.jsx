import React, { useEffect, useState } from "react";
import "./FuturisticStyles.css";

export default function DataCard({
  title,
  value,
  trend,
  icon: Icon,
  isLoading,
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setCount(0);
      return;
    }
    const target = Number(value) || 0;
    let start = null;
    const duration = 900;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.round(target * progress));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [value, isLoading]);

  const handleMouseMove = (event) => {
    const card = event.currentTarget;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = event.clientX - left;
    const y = event.clientY - top;
    const rotateY = ((x / width) * 30 - 15).toFixed(1);
    const rotateX = ((y / height) * -30 + 15).toFixed(1);
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      className={`data-card group rounded-[2rem] border border-cyan-500/10 bg-slate-950/90 p-6 shadow-[0_20px_90px_rgba(0,212,255,0.08)] transition-transform duration-300 ${
        isLoading ? "skeleton-card" : "hover:-translate-y-1"
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            {title}
          </p>
          <p className="mt-3 text-4xl font-semibold text-slate-100">
            {isLoading ? "--" : count}
          </p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-cyan-500/15 bg-white/5 text-cyan-200 shadow-[0_0_22px_rgba(0,212,255,0.18)]">
          {Icon ? <Icon size={20} /> : <span>📈</span>}
        </div>
      </div>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-900">
        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500" />
      </div>
      <p className="mt-4 text-sm text-slate-400">
        {trend || "Performance trend"}
      </p>
    </div>
  );
}
