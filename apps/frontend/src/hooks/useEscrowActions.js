import { parseEther } from 'viem';
import { usePublicClient, useWriteContract } from 'wagmi';
import toast from 'react-hot-toast';
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from '../services/contract';

export function useEscrowActions() {
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const execute = async ({ functionName, args = [], value, pendingMessage, successMessage }) => {
    const loadingToast = toast.loading(pendingMessage);

    try {
      const hash = await writeContractAsync({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: ESCROW_ABI,
        functionName,
        args,
        value
      });

      await publicClient.waitForTransactionReceipt({ hash });
      toast.success(successMessage, { id: loadingToast });
      return hash;
    } catch (error) {
      toast.error(error.shortMessage || error.message || 'Transaction failed.', { id: loadingToast });
      throw error;
    }
  };

  return {
    createEscrow: async ({ seller, arbitrator, amount, deliveryTime, metadata }) =>
      execute({
        functionName: 'createEscrow',
        args: [seller, arbitrator, BigInt(deliveryTime), metadata],
        value: parseEther(amount),
        pendingMessage: 'Submitting create escrow transaction...',
        successMessage: 'Escrow creation transaction submitted.'
      }),
    markDelivered: (escrowId) =>
      execute({
        functionName: 'markDelivered',
        args: [BigInt(escrowId)],
        pendingMessage: 'Submitting delivery confirmation...',
        successMessage: 'Mark delivered transaction submitted.'
      }),
    releaseFunds: (escrowId) =>
      execute({
        functionName: 'releaseFunds',
        args: [BigInt(escrowId)],
        pendingMessage: 'Submitting release funds transaction...',
        successMessage: 'Release funds transaction submitted.'
      }),
    openDispute: (escrowId) =>
      execute({
        functionName: 'openDispute',
        args: [BigInt(escrowId)],
        pendingMessage: 'Opening dispute...',
        successMessage: 'Open dispute transaction submitted.'
      }),
    resolveDispute: ({ escrowId, buyerAmount, sellerAmount }) =>
      execute({
        functionName: 'resolveDispute',
        args: [BigInt(escrowId), parseEther(buyerAmount), parseEther(sellerAmount)],
        pendingMessage: 'Resolving dispute...',
        successMessage: 'Resolve dispute transaction submitted.'
      })
  };
}
