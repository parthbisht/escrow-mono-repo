import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { shortenAddress } from '../utils/formatters';

export function WalletPanel() {
  const { address, isConnected } = useAccount();

  return (
    <div className="rounded-3xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-slate-950 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-200">Wallet</p>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">{isConnected ? 'Connected wallet' : 'Connect MetaMask or Rainbow wallet'}</p>
          <p className="mt-1 text-sm text-slate-300">
            {isConnected ? shortenAddress(address) : 'Use RainbowKit to authenticate and sign escrow transactions.'}
          </p>
        </div>
        <ConnectButton showBalance={false} accountStatus="address" chainStatus="icon" />
      </div>
    </div>
  );
}
