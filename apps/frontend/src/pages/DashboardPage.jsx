import { useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import { CreateEscrowForm } from '../components/CreateEscrowForm';
import { EscrowList } from '../components/EscrowList';
import { SectionCard } from '../components/SectionCard';
import { TransactionHistory } from '../components/TransactionHistory';
import { WalletPanel } from '../components/WalletPanel';
import { useEscrowActions } from '../hooks/useEscrowActions';
import { useEscrowsQuery } from '../hooks/useEscrowsQuery';
import { backendApi } from '../services/backendApi';
import { shortenAddress } from '../utils/formatters';

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState([]);
  const { data, isLoading, refetch, isRefetching } = useEscrowsQuery({ page: 1, limit: 20 });
  const actions = useEscrowActions();

  const escrows = data?.data ?? [];
  const stats = useMemo(() => {
    const delivered = escrows.filter((escrow) => escrow.state === 'Delivered').length;
    const disputed = escrows.filter((escrow) => escrow.state === 'Disputed').length;
    return [
      { label: 'Tracked escrows', value: escrows.length },
      { label: 'Delivered', value: delivered },
      { label: 'Disputed', value: disputed },
      { label: 'Connected wallet', value: address ? shortenAddress(address) : 'None' }
    ];
  }, [address, escrows]);

  const trackTransaction = (label, hash) => {
    setTransactions((current) => [{ label, hash, createdAt: Date.now() }, ...current].slice(0, 6));
  };

  const wrapAction = async (label, callback) => {
    const hash = await callback();
    trackTransaction(label, hash);
    await refetch();
  };

  const handleCreateEscrow = (payload) => wrapAction('Create escrow', () => actions.createEscrow(payload));
  const handleMarkDelivered = (escrowId) => wrapAction(`Mark delivered #${escrowId}`, () => actions.markDelivered(escrowId));
  const handleReleaseFunds = (escrowId) => wrapAction(`Release funds #${escrowId}`, () => actions.releaseFunds(escrowId));
  const handleOpenDispute = (escrowId) => wrapAction(`Open dispute #${escrowId}`, () => actions.openDispute(escrowId));
  const handleResolveDispute = (payload) => wrapAction(`Resolve dispute #${payload.escrowId}`, () => actions.resolveDispute(payload));

  const handleSync = async () => {
    const toastId = toast.loading('Syncing escrows from backend...');
    try {
      await backendApi.syncEscrows({});
      await refetch();
      toast.success('Escrow sync completed.', { id: toastId });
    } catch (error) {
      toast.error(error.message, { id: toastId });
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(45,129,255,0.18),_transparent_30%),linear-gradient(180deg,_#020617,_#0f172a_45%,_#020617)] px-4 py-8 text-slate-100 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-8 shadow-glow">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-200">
                Production escrow dashboard
              </span>
              <h1 className="mt-5 text-4xl font-semibold text-white md:text-5xl">Manage decentralized escrows across wallet, API, and contract flows.</h1>
              <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
                Connect a wallet with RainbowKit, create escrows against the Solidity contract, sync indexed data from the NestJS backend, and resolve disputes with role-aware actions.
              </p>
            </div>
            <div className="w-full max-w-md">
              <WalletPanel />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Stat key={stat.label} {...stat} />
          ))}
        </section>

        <SectionCard
          eyebrow="Create"
          title="Create escrow"
          description="Submit seller, arbitrator, ETH amount, delivery deadline, and IPFS metadata directly to the smart contract."
          actions={(
            <button className="btn-secondary" onClick={handleSync}>
              {isRefetching ? 'Refreshing…' : 'Sync backend'}
            </button>
          )}
        >
          <CreateEscrowForm onCreate={handleCreateEscrow} />
        </SectionCard>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div>
            {isLoading ? (
              <SectionCard eyebrow="Portfolio" title="Escrow list">
                <p className="text-sm text-slate-400">Loading escrows from the backend API...</p>
              </SectionCard>
            ) : (
              <EscrowList
                escrows={escrows}
                walletAddress={address}
                onMarkDelivered={handleMarkDelivered}
                onReleaseFunds={handleReleaseFunds}
                onOpenDispute={handleOpenDispute}
                onResolveDispute={handleResolveDispute}
              />
            )}
          </div>

          <div className="space-y-8">
            <SectionCard
              eyebrow="Activity"
              title="Transaction history"
              description="Quick links to recently submitted wallet transactions for faster operational follow-up."
            >
              <TransactionHistory items={transactions} />
            </SectionCard>

            <SectionCard
              eyebrow="Integration"
              title="Frontend runtime configuration"
              description="These values are driven by your Vite environment variables and backend API availability."
            >
              <dl className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <dt className="text-slate-500">Backend API</dt>
                  <dd className="mt-1 break-all">{import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000/api'}</dd>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <dt className="text-slate-500">Contract address</dt>
                  <dd className="mt-1 break-all">{import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'}</dd>
                </div>
              </dl>
            </SectionCard>
          </div>
        </div>
      </div>
    </main>
  );
}
