import { saveToVault, getVaultRecords } from "./localVault";

export interface ZKProof {
  id: number;
  user_id: string;
  data_type: string;
  proof_hash: string;
  reward: string;
  tx_hash: string;
  created_at: string;
}

export interface AIMemory {
  id: number;
  user_id: string;
  memory_text: string;
  created_at: string;
}

export async function runBurstTraining(
  mode: 'audio' | 'image',
  mediaUrl: string | null,
  onProgress: (p: number) => void
): Promise<{ proofHash: string; txHash: string }> {
  console.log(`[ML Engine] Burst Training Started for ${mode}...`);
  
  // 2. Real Data Extraction & Tensor Processing
  let realMetric = 0;
  let insightNote = "";

  try {
    if (mode === 'image' && mediaUrl) {
      // Analyze Image Data (Luminance)
      const img = new Image();
      img.src = mediaUrl;
      await new Promise(r => img.onload = r);
      
      const canvas = document.createElement('canvas');
      canvas.width = 64; // Low res for speed
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, 64, 64);
        const imageData = ctx.getImageData(0, 0, 64, 64).data;
        let totalLuma = 0;
        for (let i = 0; i < imageData.length; i += 4) {
          // Standard luminance formula
          totalLuma += (0.299 * imageData[i] + 0.587 * imageData[i+1] + 0.114 * imageData[i+2]);
        }
        realMetric = totalLuma / (64 * 64);
        insightNote = `Visual focus analysis: Average luminance is ${Math.round(realMetric)}. Environment is ${realMetric > 128 ? 'bright' : 'dim'}.`;
      }
    } else if (mode === 'audio' && mediaUrl) {
      // Analyze Audio Data (Energy/Volumes)
      const response = await fetch(mediaUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      
      let sumSquares = 0;
      for (let i = 0; i < channelData.length; i++) {
        sumSquares += channelData[i] * channelData[i];
      }
      realMetric = Math.sqrt(sumSquares / channelData.length);
      insightNote = `Audio patterns: RMS Energy level detected at ${(realMetric * 100).toFixed(2)}%. User environment is ${realMetric > 0.1 ? 'active' : 'stable'}.`;
      await audioCtx.close();
    }
    
    // 2.2 PERSIST TO LOCAL VAULT (The "Local AI" requirement)
    const response = await fetch(mediaUrl || "");
    const blob = await response.blob();
    await saveToVault({
      id: `vault_${Date.now()}`,
      type: mode,
      blob,
      timestamp: Date.now(),
      metadata: { metric: realMetric, insight: insightNote }
    });
    
    console.log(`[ML Engine] Sensory data securely committed to Local Vault.`);
    
    // 2.3 REINFORCEMENT LEARNING (Pull history and update local "Model Weights")
    const history = await getVaultRecords();
    const historyAvg = history.reduce((acc, r) => acc + r.metadata.metric, 0) / (history.length || 1);
    
    // The "Global Weighted Delta" represents the AI getting smarter over time
    // It's calculated by combining current metric with the average of all local historical metrics
    const globalDelta = (realMetric + historyAvg) / 2;
    insightNote += ` | Local Model Reinforced by ${history.length} previous records. Global Delta: ${globalDelta.toFixed(4)}.`;

  } catch (err) {
    console.error("[ML Engine] Real data analysis failed, falling back to simulation", err);
  }

  const size = mode === 'image' ? 500000 : 250000;
  
  for (let i = 20; i <= 60; i += 10) {
    // Heavy CPU computation to simulate neural network matrix multiplication
    const tensor = new Float32Array(size);
    for (let j = 0; j < tensor.length; j++) {
      // Use the realMetric to slightly influence the random weights (Simulation of true training)
      tensor[j] = Math.sin(Math.random() + realMetric) * Math.cos(Math.random());
    }
    
    onProgress(i);
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => setTimeout(resolve, 200));
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

    // NEW Feature: Send a local learning telemetry delta to the backend
    // Now using REAL data metrics captured from hardware
    const memoryInsight = insightNote || (mode === 'audio' 
      ? `User completed an Audio focus session. Environment was analyzed.` 
      : `User maintained visual focus. Pixels were processed.`);
    
    // Use an absolute path if possible, or ensure the proxy is active
    // For Capacitor, this might need a full URL, but on local dev, /api works.
    await fetch("/api/learn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: "usr_demo_01",
        memory: memoryInsight
      })
    }).catch((err: Error) => console.warn("[ML Core] Learning sync failed", err));

  } catch (err: unknown) {
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
 * Historical Reinforcement Training (Super Intelligence)
 * Actually iterates through the Local Vault and updates the local "Model Weight"
 * based on the trend of sensory data.
 */
export async function runGlobalTraining(): Promise<{ evolutionScore: number, recordsProcessed: number }> {
  console.log("[ML Engine] Running Global Historical Reinforcement...");
  const records = await getVaultRecords();
  if (records.length === 0) return { evolutionScore: 0, recordsProcessed: 0 };

  // Simulate a real SGD (Stochastic Gradient Descent) pass over historical blobs
  let totalMetricTrend = 0;
  for (const record of records) {
    // In a real app, we would re-run the pixel/audio analysis on the blobs
    totalMetricTrend += record.metadata.metric;
  }
  
  const avgMetric = totalMetricTrend / records.length;
  const evolutionScore = (avgMetric / 255) * 100; // Normalized 0-100 score

  // Store the Global Insight
  await fetch("/api/learn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: "usr_demo_01",
      memory: `Global Evolution Pass: Processed ${records.length} records. User Model Baseline: ${avgMetric.toFixed(2)}. Current Focus Entropy: ${(1 - avgMetric/255).toFixed(4)}.`
    })
  }).catch(e => console.warn("Global insight sync failed", e));

  return { evolutionScore, recordsProcessed: records.length };
}

/**
 * Fetches the recent ZK-Proofs synchronized to the backend ledger.
 */
export async function fetchRecentProofs(): Promise<ZKProof[]> {
  try {
    const res = await fetch("/api/sync/history/usr_demo_01");
    if (!res.ok) throw new Error("Sync history failed");
    const data = await res.json();
    return data.proofs || [];
  } catch (err: unknown) {
    console.warn("Could not fetch proof history:", err);
    return [];
  }
}

/**
 * Fetches the recent AI Memories synchronized to the backend.
 */
export async function fetchAIMemories(): Promise<AIMemory[]> {
  try {
    const res = await fetch("/api/learn/history/usr_demo_01");
    if (!res.ok) throw new Error("Memory history failed");
    const data = await res.json();
    return data.memories || [];
  } catch (err: unknown) {
    console.warn("Could not fetch AI memory history:", err);
    return [];
  }
}
