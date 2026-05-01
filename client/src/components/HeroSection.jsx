import React, { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import "./FuturisticStyles.css";

export default function HeroSection({ onCta }) {
  const ref = useRef(null);
  const canvasRef = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * 1,
      y: Math.random() * 1,
      r: 1 + Math.random() * 2,
      speed: 0.15 + Math.random() * 0.35,
      angle: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed;
        particle.angle += 0.0008;
        if (
          particle.x > 1 ||
          particle.x < 0 ||
          particle.y > 1 ||
          particle.y < 0
        ) {
          particle.x = Math.random();
          particle.y = Math.random();
        }
        const px = particle.x * width;
        const py = particle.y * height;
        ctx.beginPath();
        ctx.arc(px, py, particle.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(4, 214, 255, 0.18)";
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      ref={ref}
      className="relative overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-slate-950/80 px-6 py-10 shadow-[0_0_80px_rgba(0,212,255,0.12)]"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-30"
      />
      <div className="relative z-10 grid gap-8 lg:grid-cols-[1.5fr_1fr] items-center">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <motion.h1
            data-text="Futuristic learning for modern creators"
            className="glitch-text bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 bg-clip-text text-5xl font-black tracking-tight text-transparent"
            animate={{ opacity: [0, 1], y: [40, 0] }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Futuristic learning for modern creators
          </motion.h1>
          <motion.p
            className="max-w-2xl text-sm leading-7 text-slate-300"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            Jump into a glowing dashboard that blends real-time insights,
            AI-powered recommendations, and immersive study workflows.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            <button
              type="button"
              onClick={onCta}
              className="futuristic-button inline-flex items-center justify-center rounded-3xl border border-cyan-500/30 bg-cyan-500/10 px-6 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
            >
              Explore courses now
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="rounded-[1.75rem] border border-cyan-500/15 bg-slate-950/90 p-7 shadow-[0_0_48px_rgba(0,212,255,0.12)]"
        >
          <div className="space-y-4 text-slate-200">
            <div className="rounded-3xl border border-cyan-600/10 bg-white/5 p-5 shadow-[inset_0_0_45px_rgba(0,212,255,0.08)]">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
                System status
              </p>
              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl bg-slate-950/70 px-4 py-3">
                  <span>Realtime sync</span>
                  <span className="text-cyan-200">Active</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-950/70 px-4 py-3">
                  <span>API health</span>
                  <span className="text-emerald-300">Stable</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-950/70 px-4 py-3">
                  <span>Server load</span>
                  <span className="text-sky-300">22%</span>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-cyan-500/10 bg-slate-950/70 p-5">
              <h3 className="text-sm uppercase tracking-[0.3em] text-slate-500">
                Energy grid
              </h3>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-900">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500" />
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Adaptive learning calibration powered by your current activity.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
