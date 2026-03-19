import { formatEther } from 'viem';

export function shortenAddress(address = '') {
  if (!address) return 'Not connected';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEth(amount) {
  if (amount === undefined || amount === null || amount === '') return '—';

  try {
    const formatted = Number(formatEther(BigInt(amount)));
    return `${formatted.toFixed(formatted > 0 && formatted < 1 ? 4 : 2)} ETH`;
  } catch (_error) {
    return `${amount} wei`;
  }
}

export function formatDate(value) {
  if (!value) return '—';
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

export function getExplorerUrl(hash) {
  return hash ? `https://sepolia.etherscan.io/tx/${hash}` : null;
}
