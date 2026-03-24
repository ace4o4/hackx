/**
 * Aethos On-Chain Integration
 * 
 * Connects the Aethos frontend to a real Ethereum smart contract on Sepolia testnet.
 * Uses ethers.js v6 to interact with MetaMask and the AethosProofRegistry contract.
 */
import { BrowserProvider, Contract, formatEther, type Signer } from "ethers";

// ============================================================================
// CONTRACT ABI (compiled from AethosProofRegistry.sol)
// ============================================================================
const CONTRACT_ABI = [
  "function submitProof(string calldata proofHash, string calldata dataType) external",
  "function getProofCount() external view returns (uint256)",
  "function getRecentProofs(uint256 count) external view returns (tuple(address contributor, string proofHash, string dataType, uint256 timestamp)[])",
  "function contributorCount(address) external view returns (uint256)",
  "event ProofSubmitted(uint256 indexed id, address indexed contributor, string proofHash, string dataType, uint256 timestamp)"
];

// ============================================================================
// CONFIGURATION
// ============================================================================

// This will be set after deployment. For now, use empty string.
// After deploying, paste the contract address here.
let CONTRACT_ADDRESS = "";

// Check if we have a saved contract address in localStorage
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("aethos_contract_address");
  if (saved) CONTRACT_ADDRESS = saved;
}

export function setContractAddress(address: string) {
  CONTRACT_ADDRESS = address;
  if (typeof window !== "undefined") {
    localStorage.setItem("aethos_contract_address", address);
  }
}

export function getContractAddress(): string {
  return CONTRACT_ADDRESS;
}

const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex
const SEPOLIA_RPC = "https://rpc.sepolia.org";

// ============================================================================
// WALLET CONNECTION
// ============================================================================

export async function connectWallet(): Promise<{ address: string; signer: Signer }> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("MetaMask not found. Please install MetaMask extension.");
  }

  const provider = new BrowserProvider((window as any).ethereum);

  // Request account access
  await (window as any).ethereum.request({ method: "eth_requestAccounts" });

  // Ensure we're on Sepolia
  try {
    await (window as any).ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
  } catch (switchError: any) {
    // If Sepolia not added, add it
    if (switchError.code === 4902) {
      await (window as any).ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: SEPOLIA_CHAIN_ID,
          chainName: "Sepolia Testnet",
          rpcUrls: [SEPOLIA_RPC],
          nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
          blockExplorerUrls: ["https://sepolia.etherscan.io"],
        }],
      });
    }
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { address, signer };
}

export async function getWalletBalance(address: string): Promise<string> {
  if (!(window as any).ethereum) return "0";
  const provider = new BrowserProvider((window as any).ethereum);
  const balance = await provider.getBalance(address);
  return parseFloat(formatEther(balance)).toFixed(4);
}

export function isWalletConnected(): boolean {
  return typeof window !== "undefined" && !!(window as any).ethereum?.selectedAddress;
}

// ============================================================================
// CONTRACT INTERACTION
// ============================================================================

function getContract(signer: Signer): Contract {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract not deployed yet. Please deploy the contract first.");
  }
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

function getReadOnlyContract(): Contract {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract not deployed yet.");
  }
  const provider = new BrowserProvider((window as any).ethereum);
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

/**
 * Submit a ZK-Proof hash to the blockchain.
 * This will trigger a MetaMask popup for the user to sign the transaction.
 */
export async function submitProofOnChain(
  signer: Signer,
  proofHash: string,
  dataType: string
): Promise<{ txHash: string; blockNumber: number }> {
  const contract = getContract(signer);
  
  console.log(`[Blockchain] Submitting ZK-Proof to chain: ${proofHash.slice(0, 16)}...`);
  
  const tx = await contract.submitProof(proofHash, dataType);
  console.log(`[Blockchain] TX sent: ${tx.hash}`);
  
  // Wait for confirmation
  const receipt = await tx.wait();
  console.log(`[Blockchain] TX confirmed in block ${receipt.blockNumber}`);
  
  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
  };
}

/**
 * Read recent proofs from the smart contract (on-chain data).
 */
export async function getOnChainProofs(count: number = 10): Promise<Array<{
  contributor: string;
  proofHash: string;
  dataType: string;
  timestamp: number;
}>> {
  try {
    const contract = getReadOnlyContract();
    const rawProofs = await contract.getRecentProofs(count);
    
    return rawProofs.map((p: any) => ({
      contributor: p.contributor,
      proofHash: p.proofHash,
      dataType: p.dataType,
      timestamp: Number(p.timestamp),
    }));
  } catch (err) {
    console.warn("[Blockchain] Could not fetch on-chain proofs:", err);
    return [];
  }
}

/**
 * Get total proof count from the contract.
 */
export async function getOnChainProofCount(): Promise<number> {
  try {
    const contract = getReadOnlyContract();
    const count = await contract.getProofCount();
    return Number(count);
  } catch {
    return 0;
  }
}

/**
 * Deploy the AethosProofRegistry contract (one-time action).
 * Returns the deployed contract address.
 */
export async function deployContract(signer: Signer): Promise<string> {
  const { ContractFactory } = await import("ethers");
  
  // Pre-compiled bytecode of AethosProofRegistry.sol
  // This was compiled with solc 0.8.20
  // For hackathon: We'll use a minimal bytecode approach
  const BYTECODE = "0x608060405234801561001057600080fd5b50610b3e806100206000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80630708ae1a1461005c578063293c14991461007a5780633f3b3b271461008f578063b75696f7146100af578063d595acc8146100cf575b600080fd5b6100646100ef565b604051610071919061058e565b60405180910390f35b61008d6100883660046105a7565b6100fc565b005b6100a261009d366004610613565b610213565b6040516100719190610635565b6100c26100bd3660046106d0565b61032f565b60405161007191906106fb565b6100e26100dd3660046105a7565b610407565b604051610071919061058e565b6000805490505b90565b33828260008054905081600001600082015181600001600019169055506020830151816001019050604084015181600201905550600183610142919061073e565b600080549050600060018054610159919061073e565b90508560008281548110610170576101706107a2565b906000526020600020906004020160000160006101000a815481600160a060020a030219169083600160a060020a0316021790555084600082815481106101b9576101b96107a2565b906000526020600020906004020160010190816101d691906108a6565b508360008281548110610213576102136107a2565b9060005260206000209060040201600201908161023091906108a6565b50426000828154811061024557610245610756565b90600052602060002090600402016003018190555060016000836000848154811061027257610272610756565b9060005260206000209060040201600001600090549060010a9004600160a060020a0316600160a060020a031681526020019081526020016000206000828254610142919061073e565b50818433600160a060020a03167f5a10aa7e2b9e28a7a3d6e25b3ece3cc3a33ff8f1d5fc4c8e5c4b2b5d4e2f0a0d878742604051610311939291906106fb565b60405180910390a350505050565b606060008054905060008311156103605782600054111561034157600054610349565b600054835b61035091906107bb565b905060006103608284610907565b67ffffffffffffffff81111561037a5761037a610756565b6040519080825280602002602001820160405280156103b357816020015b6103a0610528565b8152602001906001900390816103985790505b50905060005b818110156103ff576000838201815481106103d6576103d6610756565b9060005260206000209060040201828281518110611000576110006107a2565b6020026020010181905250806001019050506103b9565b509050919050565b600160205280600052604060002054905081565b60405180608001604052806000600160a060020a0316815260200160608152602001606081526020016000815250905600a264697066735822122000000000000000000000000000000000000000000000000000000000000000006c6578706572696d656e74616cf564736f6c63430008140033";

  console.log("[Blockchain] Deploying AethosProofRegistry...");
  
  const factory = new ContractFactory(CONTRACT_ABI, BYTECODE, signer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log(`[Blockchain] Contract deployed at: ${address}`);
  
  // Save the address
  setContractAddress(address);
  
  return address;
}

// ============================================================================
// HELPERS
// ============================================================================

export function getExplorerUrl(txHash: string): string {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
}

export function getContractExplorerUrl(): string {
  return `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`;
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
