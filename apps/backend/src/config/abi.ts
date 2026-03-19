export const ESCROW_CONTRACT_ABI = [
  'event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed seller, address arbitrator, uint256 amount, uint64 deliveryTime, string metadata)',
  'event Delivered(uint256 indexed escrowId, address indexed seller, uint64 deliveredAt)',
  'event DisputeOpened(uint256 indexed escrowId, address indexed buyer)',
  'event DisputeResolved(uint256 indexed escrowId, address indexed arbitrator, uint256 buyerAmount, uint256 sellerAmount)',
  'event FundsReleased(uint256 indexed escrowId, address indexed buyer, address indexed seller, uint256 amount)'
] as const;
