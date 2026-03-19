import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { localhost, sepolia } from 'wagmi/chains';

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

export const wagmiConfig = getDefaultConfig({
  appName: 'Escrow Dashboard',
  projectId: walletConnectProjectId,
  chains: [localhost, sepolia],
  ssr: false
});
