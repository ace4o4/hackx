/**
 * ML Burst Training Engine
 * Simulates on-device Decentralized ML Training and ZK-Proof generation.
 * Uses high CPU load (loops & Web Crypto) to simulate real Edge ML behavior.
 * @param mode 'audio' or 'image'
 * @param onProgress Callback to update UI progress (0 to 100)
 */
export async function runBurstTraining(
  mode: 'audio' | 'image',
  onProgress: (p: number) => void
): Promise<{ proofHash: string; txHash: string }> {
  console.log(`[ML Engine] Burst Training Started for ${mode}...`);
  
  // 1. Initialize Training Simulation
  onProgress(10);
  await new Promise(r => setTimeout(r, 500));
  
  // 2. Simulate heavy local data loading & tensor processing (using Device Power)
  const size = mode === 'image' ? 500000 : 250000;
  
  for (let i = 20; i <= 60; i += 10) {
    // Heavy CPU computation to simulate neural network matrix multiplication
    const tensor = new Float32Array(size);
    for (let j = 0; j < tensor.length; j++) {
      // Math.random simulates initial random weights, sin/cos simulate activation functions
      tensor[j] = Math.sin(Math.random()) * Math.cos(Math.random());
    }
    
    onProgress(i);
    // Let the main thread breathe so the UI progress bar updates
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // 3. Generate ZK-Proof Hash of the "Weights" locally
  onProgress(80);
  const rawData = new TextEncoder().encode(`aethos_weights_${Date.now()}_${Math.random()}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", rawData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const proofHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  
  // 4. Sync ONLY the proof hash to the ML Brain Server (Zero-Knowledge)
  onProgress(90);
  try {
    const res = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: "usr_demo_01",
        proof_hash: proofHash,
        data_type: mode
      })
    });
    if (!res.ok) throw new Error("Sync failed");
  } catch (err) {
    console.warn("[ML Engine] Backend sync failed. Continuing locally.", err);
  }

  onProgress(100);
  console.log('[ML Engine] Burst Training Completed. ZK Proof:', proofHash);
  
  // Simulate an on-chain verification tx hash
  return { 
    proofHash, 
    txHash: "0x" + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join("")
  };
}

/**
 * Fetches the recent ZK-Proofs synchronized to the backend ledger.
 */
export async function fetchRecentProofs() {
  try {
    const res = await fetch("/api/sync/history/usr_demo_01");
    if (!res.ok) throw new Error("Sync history failed");
    const data = await res.json();
    return data.proofs || [];
  } catch (err) {
    console.warn("Could not fetch proof history:", err);
    return [];
  }
}
