export function getUserRole(escrow, walletAddress) {
  if (!walletAddress) return null;

  const lowerWallet = walletAddress.toLowerCase();
  if (escrow.buyer?.toLowerCase() === lowerWallet) return 'buyer';
  if (escrow.seller?.toLowerCase() === lowerWallet) return 'seller';
  if (escrow.arbitrator?.toLowerCase() === lowerWallet) return 'arbitrator';
  return null;
}

export function canResolveDispute(escrow) {
  return escrow.state === 'Disputed';
}
