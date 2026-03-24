import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';

dotenv.config();

const app = express();
// Using 3002 to avoid conflicts with any previous ghost processes
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = "You are a friendly, concise AI productivity coach for a focus app called Focus Twin. Keep responses under 2 sentences. Be warm and encouraging. Never ask clarifying questions, simply provide the insight or greeting requested.";

/**
 * Universal Secure LLM Proxy Endpoint
 * Frontend sends a specific context prompt, backend securely calls Gemini API.
 * This prevents the GEMINI_API_KEY from leaking to the browser.
 */
app.post('/api/ai/prompt', async (req: Request, res: Response) => {
  const { prompt } = req.body;
  
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Valid prompt string is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY || 'MOCK_KEY';
  
  // If no real API key is setup during hackathon dev, return a mock response
  if (apiKey === 'MOCK_KEY') {
    console.warn('[AI Proxy] No GEMINI_API_KEY found. Returning mock fallback.');
    return res.json({
      success: true,
      result: "Mock API Key detected. Your twin is growing stronger! (Add GEMINI_API_KEY to .env to enable the real LLM)."
    });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: { text: SYSTEM_PROMPT } },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100
        }
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[AI Proxy] Gemini API Error:', errText);
      return res.status(502).json({ error: 'Failed to generate AI response' });
    }

    const data = await response.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Keep up the great focus!";
    
    res.json({
      success: true,
      result: textResult
    });
  } catch (err) {
    console.error('[AI Proxy] Internal Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Mock endpoint to simulate cross-device Sync Verification (Optional feature)
app.post('/api/sync/vault', (req: Request, res: Response) => {
  const { user_id, encrypted_blob } = req.body;
  if (!user_id || !encrypted_blob) return res.status(400).json({ error: 'Missing vault data' });

  db.run(
    'INSERT INTO encrypted_vaults (user_id, encrypted_blob) VALUES (?, ?)',
    [user_id, encrypted_blob],
    function (err: Error | null) {
      if (err) return res.status(500).json({ error: 'Failed to sync vault to cloud.' });
      res.json({ success: true, message: 'Vault E2E synced securely.' });
    }
  );
});

/**
 * ZK-Proof Sync Endpoint (ML Brain Hub)
 * Receives the proof hash generated on-device, verifying contribution without raw data.
 */
app.post('/api/sync', (req: Request, res: Response) => {
  const { user_id, proof_hash, data_type } = req.body;
  if (!user_id || !proof_hash) {
    return res.status(400).json({ error: 'Missing user_id or proof_hash' });
  }

  console.log(`[ML Brain Base] Validating ZK-Proof ${proof_hash} from contributor ${user_id} for data type: ${data_type}`);
  
  // Generate a mock simulated "on-chain" blockchain transaction hash
  const tx_hash = "0x" + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join("");
  const reward = "0.0003 ETH";

  // Persist to local database to simulate ledger verification
  db.run(
    'INSERT INTO zk_proofs (user_id, data_type, proof_hash, reward, tx_hash) VALUES (?, ?, ?, ?, ?)',
    [user_id, data_type, proof_hash, reward, tx_hash],
    function (err: Error | null) {
      if (err) {
        console.error("Failed to commit ZK-Proof to ledger:", err);
        return res.status(500).json({ error: 'Failed to commit ZK-Proof. Ledger busy.' });
      }
      res.json({ 
        success: true, 
        reward,
        tx_hash,
        message: "Network validated and reward granted."
      });
    }
  );
});

// Fetch recent ZK-Proofs for a user
app.get('/api/sync/history/:user_id', (req: Request, res: Response) => {
  const { user_id } = req.params;
  
  db.all(
    'SELECT * FROM zk_proofs WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
    [user_id],
    (err: Error | null, rows: unknown[]) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch ledger history', proofs: [] });
      res.json({ proofs: rows || [] });
    }
  );
});

app.listen(PORT, () => {
  console.log(`[Focus Twin Backend] Secure AI Proxy listening on http://localhost:${PORT}`);
});
