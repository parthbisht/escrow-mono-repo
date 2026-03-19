// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Escrow is ReentrancyGuard {
    uint64 public constant REVIEW_PERIOD = 3 days;

    enum EscrowState {
        Pending,
        Delivered,
        Disputed,
        Resolved,
        Cancelled
    }

    struct EscrowItem {
        address buyer;
        address seller;
        address arbitrator;
        uint96 amount;
        uint64 deliveryTime;
        uint64 deliveredAt;
        EscrowState state;
        string metadata;
    }

    mapping(uint256 escrowId => EscrowItem) private escrows;
    uint256 public escrowCount;

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        address arbitrator,
        uint256 amount,
        uint64 deliveryTime,
        string metadata
    );
    event Delivered(uint256 indexed escrowId, address indexed seller, uint64 deliveredAt);
    event DisputeOpened(uint256 indexed escrowId, address indexed buyer);
    event DisputeResolved(
        uint256 indexed escrowId,
        address indexed arbitrator,
        uint256 buyerAmount,
        uint256 sellerAmount
    );
    event FundsReleased(uint256 indexed escrowId, address indexed buyer, address indexed seller, uint256 amount);
    event EscrowCancelled(uint256 indexed escrowId, address indexed buyer, uint256 amountRefunded);
    event SellerWithdrawal(uint256 indexed escrowId, address indexed seller, uint256 amount);

    modifier onlyBuyer(uint256 escrowId) {
        require(msg.sender == escrows[escrowId].buyer, "Escrow: caller is not buyer");
        _;
    }

    modifier onlySeller(uint256 escrowId) {
        require(msg.sender == escrows[escrowId].seller, "Escrow: caller is not seller");
        _;
    }

    modifier onlyArbitrator(uint256 escrowId) {
        require(msg.sender == escrows[escrowId].arbitrator, "Escrow: caller is not arbitrator");
        _;
    }

    function createEscrow(
        address seller,
        address arbitrator,
        uint64 deliveryTime,
        string calldata metadata
    ) external payable returns (uint256 escrowId) {
        require(msg.value > 0, "Escrow: zero deposit");
        require(msg.value <= type(uint96).max, "Escrow: amount too large");
        require(seller != address(0), "Escrow: invalid seller");
        require(arbitrator != address(0), "Escrow: invalid arbitrator");
        require(seller != msg.sender, "Escrow: seller cannot be buyer");
        require(deliveryTime > block.timestamp, "Escrow: invalid delivery time");

        escrowId = escrowCount;
        escrowCount += 1;

        escrows[escrowId] = EscrowItem({
            buyer: msg.sender,
            seller: seller,
            arbitrator: arbitrator,
            amount: uint96(msg.value),
            deliveryTime: deliveryTime,
            deliveredAt: 0,
            state: EscrowState.Pending,
            metadata: metadata
        });

        emit EscrowCreated(escrowId, msg.sender, seller, arbitrator, msg.value, deliveryTime, metadata);
    }

    function markDelivered(uint256 escrowId) external onlySeller(escrowId) {
        EscrowItem storage item = escrows[escrowId];
        require(item.state == EscrowState.Pending, "Escrow: invalid state");

        uint64 deliveredAt = uint64(block.timestamp);
        item.deliveredAt = deliveredAt;
        item.state = EscrowState.Delivered;

        emit Delivered(escrowId, msg.sender, deliveredAt);
    }

    function releaseFunds(uint256 escrowId) external nonReentrant onlyBuyer(escrowId) {
        EscrowItem storage item = escrows[escrowId];
        require(item.state == EscrowState.Delivered, "Escrow: not delivered");

        uint256 amount = item.amount;
        address seller = item.seller;

        item.amount = 0;
        item.state = EscrowState.Resolved;

        _safeTransfer(payable(seller), amount);

        emit FundsReleased(escrowId, msg.sender, seller, amount);
    }

    function openDispute(uint256 escrowId) external onlyBuyer(escrowId) {
        EscrowItem storage item = escrows[escrowId];
        require(item.state == EscrowState.Pending || item.state == EscrowState.Delivered, "Escrow: invalid state");

        item.state = EscrowState.Disputed;
        emit DisputeOpened(escrowId, msg.sender);
    }

    function resolveDispute(
        uint256 escrowId,
        uint256 buyerAmount,
        uint256 sellerAmount
    ) external nonReentrant onlyArbitrator(escrowId) {
        EscrowItem storage item = escrows[escrowId];
        require(item.state == EscrowState.Disputed, "Escrow: no active dispute");
        require(buyerAmount + sellerAmount == item.amount, "Escrow: invalid split");

        address buyer = item.buyer;
        address seller = item.seller;

        item.amount = 0;
        item.state = EscrowState.Resolved;

        if (buyerAmount > 0) {
            _safeTransfer(payable(buyer), buyerAmount);
        }
        if (sellerAmount > 0) {
            _safeTransfer(payable(seller), sellerAmount);
        }

        emit DisputeResolved(escrowId, msg.sender, buyerAmount, sellerAmount);
    }

    function cancelEscrow(uint256 escrowId) external nonReentrant onlyBuyer(escrowId) {
        EscrowItem storage item = escrows[escrowId];
        require(item.state == EscrowState.Pending, "Escrow: invalid state");
        require(block.timestamp > item.deliveryTime, "Escrow: delivery deadline not passed");

        uint256 refundAmount = item.amount;
        address buyer = item.buyer;

        item.amount = 0;
        item.state = EscrowState.Cancelled;

        _safeTransfer(payable(buyer), refundAmount);

        emit EscrowCancelled(escrowId, msg.sender, refundAmount);
    }

    function sellerWithdraw(uint256 escrowId) external nonReentrant onlySeller(escrowId) {
        EscrowItem storage item = escrows[escrowId];
        require(item.state == EscrowState.Delivered, "Escrow: invalid state");
        require(item.deliveredAt != 0, "Escrow: not delivered");
        require(block.timestamp > uint256(item.deliveredAt) + REVIEW_PERIOD, "Escrow: review period active");

        uint256 amount = item.amount;
        address seller = item.seller;

        item.amount = 0;
        item.state = EscrowState.Resolved;

        _safeTransfer(payable(seller), amount);

        emit SellerWithdrawal(escrowId, seller, amount);
    }

    function getEscrow(uint256 escrowId) external view returns (EscrowItem memory) {
        return escrows[escrowId];
    }

    function _safeTransfer(address payable recipient, uint256 amount) internal {
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Escrow: transfer failed");
    }
}
