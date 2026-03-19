// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEscrow {
    function markDelivered(uint256 escrowId) external;
    function sellerWithdraw(uint256 escrowId) external;
}

contract ReentrantSeller {
    IEscrow public immutable escrow;
    uint256 public targetEscrowId;
    bool public reentered;
    bool private attacking;

    constructor(address escrowAddress) {
        escrow = IEscrow(escrowAddress);
    }

    function markDelivered(uint256 escrowId) external {
        escrow.markDelivered(escrowId);
    }

    function attackWithdraw(uint256 escrowId) external {
        targetEscrowId = escrowId;
        attacking = true;
        escrow.sellerWithdraw(escrowId);
        attacking = false;
    }

    receive() external payable {
        if (attacking) {
            try escrow.sellerWithdraw(targetEscrowId) {
                reentered = true;
            } catch {
                reentered = false;
            }
        }
    }
}
