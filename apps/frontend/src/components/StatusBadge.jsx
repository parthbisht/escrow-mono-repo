const statusClasses = {
  Pending: 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/20',
  Delivered: 'bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/20',
  Disputed: 'bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/20',
  Resolved: 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20',
  Cancelled: 'bg-slate-500/15 text-slate-200 ring-1 ring-slate-400/20'
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[status] || statusClasses.Pending}`}>
      {status}
    </span>
  );
}
