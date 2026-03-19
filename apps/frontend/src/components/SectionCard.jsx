export function SectionCard({ title, eyebrow, description, children, actions }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-glow backdrop-blur">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-800 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-300">{eyebrow}</p> : null}
          <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
          {description ? <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
