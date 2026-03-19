export const ESCROW_CONTRACT_ADDRESS =
  import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export const ESCROW_ABI = [
  {
    type: 'function',
    name: 'createEscrow',
    stateMutability: 'payable',
    inputs: [
      { name: 'seller', type: 'address' },
      { name: 'arbitrator', type: 'address' },
      { name: 'deliveryTime', type: 'uint64' },
      { name: 'metadata', type: 'string' }
    ],
    outputs: [{ name: 'escrowId', type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'markDelivered',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'escrowId', type: 'uint256' }],
    outputs: []
  },
  {
    type: 'function',
    name: 'releaseFunds',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'escrowId', type: 'uint256' }],
    outputs: []
  },
  {
    type: 'function',
    name: 'openDispute',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'escrowId', type: 'uint256' }],
    outputs: []
  },
  {
    type: 'function',
    name: 'resolveDispute',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'escrowId', type: 'uint256' },
      { name: 'buyerAmount', type: 'uint256' },
      { name: 'sellerAmount', type: 'uint256' }
    ],
    outputs: []
  }
];
