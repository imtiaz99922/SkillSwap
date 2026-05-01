import React from "react";

export default function AuthLayout({
  pageTitle,
  pageSubtitle,
  featureBlocks = [],
  panelLabel,
  panelHeading,
  panelBadge,
  children,
}) {
  return (
    <div className="login-page-new">
      <div className="login-container-new">
        <div className="login-left">
          <div className="logo-brand">SkillSwap</div>
          <h1 className="login-title">{pageTitle}</h1>
          <p className="login-subtitle">{pageSubtitle}</p>

          <div className="mt-8 grid gap-4">
            {featureBlocks.map((block, index) => (
              <div
                key={index}
                className="rounded-[1.75rem] border border-cyan-500/10 bg-slate-950/80 p-5 shadow-[inset_0_0_40px_rgba(0,212,255,0.08)]"
              >
                <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
                  {block.label}
                </p>
                <p className="mt-4 text-xl font-semibold text-cyan-200">
                  {block.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="login-form-container">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">
                {panelLabel}
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-100">
                {panelHeading}
              </h2>
            </div>
            {panelBadge && (
              <div className="rounded-3xl bg-slate-900/90 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-200/90 shadow-[0_0_18px_rgba(0,212,255,0.12)]">
                {panelBadge}
              </div>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
