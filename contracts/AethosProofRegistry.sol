// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AethosProofRegistry
 * @notice Stores ZK-Proof hashes from on-device ML training.
 *         Raw data never leaves the user's device — only the proof hash is committed on-chain.
 */
contract AethosProofRegistry {
    struct Proof {
        address contributor;
        string proofHash;
        string dataType;
        uint256 timestamp;
    }

    Proof[] public proofs;
    mapping(address => uint256) public contributorCount;

    event ProofSubmitted(
        uint256 indexed id,
        address indexed contributor,
        string proofHash,
        string dataType,
        uint256 timestamp
    );

    function submitProof(string calldata proofHash, string calldata dataType) external {
        uint256 id = proofs.length;
        proofs.push(Proof(msg.sender, proofHash, dataType, block.timestamp));
        contributorCount[msg.sender]++;
        emit ProofSubmitted(id, msg.sender, proofHash, dataType, block.timestamp);
    }

    function getProofCount() external view returns (uint256) {
        return proofs.length;
    }

    function getRecentProofs(uint256 count) external view returns (Proof[] memory) {
        uint256 len = proofs.length;
        uint256 start = len > count ? len - count : 0;
        uint256 size = len - start;
        Proof[] memory recent = new Proof[](size);
        for (uint256 i = 0; i < size; i++) {
            recent[i] = proofs[start + i];
        }
        return recent;
    }
}
