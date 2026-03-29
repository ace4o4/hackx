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
  if (saved) {
    // If it's the broken contract from previous deployments, force a redeploy
    if (saved === "0x7c2aD34a8481396dE5227512FB86b729C375B306") {
      localStorage.removeItem("aethos_contract_address");
      CONTRACT_ADDRESS = "";
    } else {
      CONTRACT_ADDRESS = saved;
    }
  }
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
  const BYTECODE = "0x608060405234801561000f575f80fd5b506110bf8061001d5f395ff3fe608060405234801561000f575f80fd5b5060043610610055575f3560e01c8063427d5914146100595780634a83bc3a146100895780635be4ee1b146100b9578063605c967e146100d75780639ddaf5aa146100f3575b5f80fd5b610073600480360381019061006e91906107e9565b610126565b604051610080919061082c565b60405180910390f35b6100a3600480360381019061009e919061086f565b61013b565b6040516100b09190610a64565b60405180910390f35b6100c16103c3565b6040516100ce919061082c565b60405180910390f35b6100f160048036038101906100ec9190610ae5565b6103ce565b005b61010d6004803603810190610108919061086f565b6105e6565b60405161011d9493929190610bba565b60405180910390f35b6001602052805f5260405f205f915090505481565b60605f808054905090505f838211610153575f610160565b838261015f9190610c38565b5b90505f818361016f9190610c38565b90505f8167ffffffffffffffff81111561018c5761018b610c6b565b5b6040519080825280602002602001820160405280156101c557816020015b6101b261074b565b8152602001906001900390816101aa5790505b5090505f5b828110156103b6575f81856101df9190610c98565b815481106101f0576101ef610ccb565b5b905f5260205f2090600402016040518060800160405290815f82015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200160018201805461026b90610d25565b80601f016020809104026020016040519081016040528092919081815260200182805461029790610d25565b80156102e25780601f106102b9576101008083540402835291602001916102e2565b820191905f5260205f20905b8154815290600101906020018083116102c557829003601f168201915b505050505081526020016002820180546102fb90610d25565b80601f016020809104026020016040519081016040528092919081815260200182805461032790610d25565b80156103725780601f1061034957610100808354040283529160200191610372565b820191905f5260205f20905b81548152906001019060200180831161035557829003601f168201915b5050505050815260200160038201548152505082828151811061039857610397610ccb565b5b602002602001018190525080806103ae90610d55565b9150506101ca565b5080945050505050919050565b5f8080549050905090565b5f808054905090505f60405180608001604052803373ffffffffffffffffffffffffffffffffffffffff16815260200187878080601f0160208091040260200160405190810160405280939291908181526020018383808284375f81840152601f19601f82011690508083019250505050505050815260200185858080601f0160208091040260200160405190810160405280939291908181526020018383808284375f81840152601f19601f82011690508083019250505050505050815260200142815250908060018154018082558091505060019003905f5260205f2090600402015f909190919091505f820151815f015f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060208201518160010190816105139190610f39565b5060408201518160020190816105299190610f39565b5060608201518160030155505060015f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f81548092919061058390610d55565b91905055503373ffffffffffffffffffffffffffffffffffffffff16817f1bda1b3354c6a4d94b31d0c9713a2ae334fee11cc5e4226fbfe59ffd701faebd87878787426040516105d7959493929190611042565b60405180910390a35050505050565b5f81815481106105f4575f80fd5b905f5260205f2090600402015f91509050805f015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff169080600101805461063890610d25565b80601f016020809104026020016040519081016040528092919081815260200182805461066490610d25565b80156106af5780601f10610686576101008083540402835291602001916106af565b820191905f5260205f20905b81548152906001019060200180831161069257829003601f168201915b5050505050908060020180546106c490610d25565b80601f01602080910402602001604051908101604052809291908181526020018280546106f090610d25565b801561073b5780601f106107125761010080835404028352916020019161073b565b820191905f5260205f20905b81548152906001019060200180831161071e57829003601f168201915b5050505050908060030154905084565b60405180608001604052805f73ffffffffffffffffffffffffffffffffffffffff16815260200160608152602001606081526020015f81525090565b5f80fd5b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6107b88261078f565b9050919050565b6107c8816107ae565b81146107d2575f80fd5b50565b5f813590506107e3816107bf565b92915050565b5f602082840312156107fe576107fd610787565b5b5f61080b848285016107d5565b91505092915050565b5f819050919050565b61082681610814565b82525050565b5f60208201905061083f5f83018461081d565b92915050565b61084e81610814565b8114610858575f80fd5b50565b5f8135905061086981610845565b92915050565b5f6020828403121561088457610883610787565b5b5f6108918482850161085b565b91505092915050565b5f81519050919050565b5f82825260208201905092915050565b5f819050602082019050919050565b6108cc816107ae565b82525050565b5f81519050919050565b5f82825260208201905092915050565b5f5b838110156109095780820151818401526020810190506108ee565b5f8484015250505050565b5f601f19601f8301169050919050565b5f61092e826108d2565b61093881856108dc565b93506109488185602086016108ec565b61095181610914565b840191505092915050565b61096581610814565b82525050565b5f608083015f8301516109805f8601826108c3565b50602083015184820360208601526109988282610924565b915050604083015184820360408601526109b28282610924565b91505060608301516109c7606086018261095c565b508091505092915050565b5f6109dd838361096b565b905092915050565b5f602082019050919050565b5f6109fb8261089a565b610a0581856108a4565b935083602082028501610a17856108b4565b805f5b85811015610a525784840389528151610a3385826109d2565b9450610a3e836109e5565b925060208a01995050600181019050610a1a565b50829750879550505050505092915050565b5f6020820190508181035f830152610a7c81846109f1565b905092915050565b5f80fd5b5f80fd5b5f80fd5b5f8083601f840112610aa557610aa4610a84565b5b8235905067ffffffffffffffff811115610ac257610ac1610a88565b5b602083019150836001820283011115610ade57610add610a8c565b5b9250929050565b5f805f8060408587031215610afd57610afc610787565b5b5f85013567ffffffffffffffff811115610b1a57610b1961078b565b5b610b2687828801610a90565b9450945050602085013567ffffffffffffffff811115610b4957610b4861078b565b5b610b5587828801610a90565b925092505092959194509250565b610b6c816107ae565b82525050565b5f82825260208201905092915050565b5f610b8c826108d2565b610b968185610b72565b9350610ba68185602086016108ec565b610baf81610914565b840191505092915050565b5f608082019050610bcd5f830187610b63565b8181036020830152610bdf8186610b82565b90508181036040830152610bf38185610b82565b9050610c02606083018461081d565b95945050505050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f610c4282610814565b9150610c4d83610814565b9250828203905081811115610c6557610c64610c0b565b5b92915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b5f610ca282610814565b9150610cad83610814565b9250828201905080821115610cc557610cc4610c0b565b5b92915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52603260045260245ffd5b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f6002820490506001821680610d3c57607f821691505b602082108103610d4f57610d4e610cf8565b5b50919050565b5f610d5f82610814565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203610d9157610d90610c0b565b5b600182019050919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f60088302610df87fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82610dbd565b610e028683610dbd565b95508019841693508086168417925050509392505050565b5f819050919050565b5f610e3d610e38610e3384610814565b610e1a565b610814565b9050919050565b5f819050919050565b610e5683610e23565b610e6a610e6282610e44565b848454610dc9565b825550505050565b5f90565b610e7e610e72565b610e89818484610e4d565b505050565b5b81811015610eac57610ea15f82610e76565b600181019050610e8f565b5050565b601f821115610ef157610ec281610d9c565b610ecb84610dae565b81016020851015610eda578190505b610eee610ee685610dae565b830182610e8e565b50505b505050565b5f82821c905092915050565b5f610f115f1984600802610ef6565b1980831691505092915050565b5f610f298383610f02565b9150826002028217905092915050565b610f42826108d2565b67ffffffffffffffff811115610f5b57610f5a610c6b565b5b610f658254610d25565b610f70828285610eb0565b5f60209050601f831160018114610fa1575f8415610f8f578287015190505b610f998582610f1e565b865550611000565b601f198416610faf86610d9c565b5f5b82811015610fd657848901518255600182019150602085019450602081019050610fb1565b86831015610ff35784890151610fef601f891682610f02565b8355505b6001600288020188555050505b505050505050565b828183375f83830152505050565b5f6110218385610b72565b935061102e838584611008565b61103783610914565b840190509392505050565b5f6060820190508181035f83015261105b818789611016565b90508181036020830152611070818587611016565b905061107f604083018461081d565b969550505050505056fea264697066735822122057675dfd74f953e0efa7f58d70e437a179498d96e60a3eab0b8be96fa1ca2a3664736f6c63430008140033";

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
