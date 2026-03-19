import { useMemo, useState } from 'react';
import { canResolveDispute, getUserRole } from '../utils/escrow';

export function EscrowActions({ escrow, walletAddress, onMarkDelivered, onReleaseFunds, onOpenDispute, onResolveDispute }) {
  const role = useMemo(() => getUserRole(escrow, walletAddress), [escrow, walletAddress]);
  const [buyerAmount, setBuyerAmount] = useState('');
  const [sellerAmount, setSellerAmount] = useState('');

  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div>
        <p className="text-sm font-medium text-white">Action center</p>
        <p className="text-xs text-slate-400">
          {role ? `Detected role: ${role}` : 'Connect a participating wallet to unlock contract actions.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {role === 'seller' ? (
          <button className="btn-secondary" onClick={() => onMarkDelivered(escrow.escrowId)}>
            Mark delivered
          </button>
        ) : null}
        {role === 'buyer' ? (
          <>
            <button className="btn-secondary" onClick={() => onReleaseFunds(escrow.escrowId)}>
              Release funds
            </button>
            <button className="btn-danger" onClick={() => onOpenDispute(escrow.escrowId)}>
              Open dispute
            </button>
          </>
        ) : null}
      </div>

      {role === 'arbitrator' && canResolveDispute(escrow) ? (
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="field compact">
            <span>Buyer split (ETH)</span>
            <input value={buyerAmount} onChange={(event) => setBuyerAmount(event.target.value)} placeholder="0.20" />
          </label>
          <label className="field compact">
            <span>Seller split (ETH)</span>
            <input value={sellerAmount} onChange={(event) => setSellerAmount(event.target.value)} placeholder="0.30" />
          </label>
          <button
            className="btn-primary"
            onClick={() => onResolveDispute({ escrowId: escrow.escrowId, buyerAmount, sellerAmount })}
          >
            Resolve dispute
          </button>
        </div>
      ) : null}
    </div>
  );
}
