import { SectionCard } from './SectionCard';
import { StatusBadge } from './StatusBadge';
import { EscrowActions } from './EscrowActions';
import { formatEth, shortenAddress } from '../utils/formatters';

export function EscrowList({ escrows, walletAddress, onMarkDelivered, onReleaseFunds, onOpenDispute, onResolveDispute }) {
  return (
    <SectionCard
      eyebrow="Portfolio"
      title="Escrow list"
      description="Backed by the NestJS API. Each row shows role-based actions against the escrow smart contract."
    >
      <div className="space-y-4">
        {escrows.length ? (
          escrows.map((escrow) => (
            <article key={escrow.id} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">Escrow #{escrow.escrowId}</h3>
                    <StatusBadge status={escrow.state} />
                  </div>
                  <div className="grid gap-2 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
                    <p><span className="text-slate-500">Buyer:</span> {shortenAddress(escrow.buyer)}</p>
                    <p><span className="text-slate-500">Seller:</span> {shortenAddress(escrow.seller)}</p>
                    <p><span className="text-slate-500">Arbitrator:</span> {shortenAddress(escrow.arbitrator)}</p>
                    <p><span className="text-slate-500">Amount:</span> {formatEth(escrow.amount)}</p>
                  </div>
                  <p className="text-sm text-slate-400">Metadata: {escrow.metadata}</p>
                </div>
              </div>

              <div className="mt-4">
                <EscrowActions
                  escrow={escrow}
                  walletAddress={walletAddress}
                  onMarkDelivered={onMarkDelivered}
                  onReleaseFunds={onReleaseFunds}
                  onOpenDispute={onOpenDispute}
                  onResolveDispute={onResolveDispute}
                />
              </div>
            </article>
          ))
        ) : (
          <p className="text-sm text-slate-400">No escrows found yet. Create one on-chain or sync from the backend.</p>
        )}
      </div>
    </SectionCard>
  );
}
