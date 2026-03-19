import { formatDate, getExplorerUrl } from '../utils/formatters';

export function TransactionHistory({ items }) {
  if (!items.length) {
    return <p className="text-sm text-slate-400">No transactions yet. Submitted contract actions will appear here.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const explorerUrl = getExplorerUrl(item.hash);
        return (
          <div key={item.hash} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-white">{item.label}</p>
                <p className="text-xs text-slate-400">{formatDate(item.createdAt)}</p>
              </div>
              {explorerUrl ? (
                <a className="text-sm text-brand-300 hover:text-brand-200" href={explorerUrl} target="_blank" rel="noreferrer">
                  View transaction
                </a>
              ) : null}
            </div>
            <p className="mt-2 break-all text-xs text-slate-500">{item.hash}</p>
          </div>
        );
      })}
    </div>
  );
}
