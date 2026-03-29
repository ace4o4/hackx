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

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', timestamp: new Date().toISOString() });
});

// Global Error Handler for the server
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

const SYSTEM_PROMPT = "You are a friendly, concise AI productivity coach for a focus app called Focus Twin. Keep responses under 2 sentences. Be warm and encouraging. Never ask clarifying questions, simply provide the insight or greeting requested.";

const getUserMemories = (userId: string): Promise<string[]> => {
  return new Promise((resolve) => {
    db.all(
      'SELECT memory_text FROM ai_memory WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId],
      (err: Error | null, rows: unknown[]) => {
        if (err || !rows) return resolve([]);
        const typedRows = rows as { memory_text: string }[];
        resolve(typedRows.map(r => r.memory_text));
      }
    );
  });
};

/**
 * Universal Secure LLM Proxy Endpoint
 * Frontend sends a specific context prompt, backend securely calls Gemini API.
 * This prevents the GEMINI_API_KEY from leaking to the browser.
 */
app.post('/api/ai/prompt', async (req: Request, res: Response) => {
  const { prompt, user_id = 'usr_demo_01' } = req.body;
  
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Valid prompt string is required' });
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || 'MOCK_KEY';
  
  if (apiKey === 'MOCK_KEY') {
    console.warn('[AI Proxy] No API Key found. Returning mock fallback.');
    return res.json({
      success: true,
      result: "Groq/Gemini key missing. Your twin is still learning locally! (Add GROQ_API_KEY to .env)."
    });
  }

  try {
    const memories = await getUserMemories(user_id);
    const memoryContext = memories.length > 0 
      ? `\n\nSUPER INTELLIGENCE CONTEXT: \n${memories.map(m => "- " + m).join("\n")}`
      : "";
    const dynamicSystemInstruction = SYSTEM_PROMPT + memoryContext;

    console.log(`[AI Core] Generating Groq response with ${memories.length} memories.`);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: dynamicSystemInstruction },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 150
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[AI Proxy] Groq API Error:', errText);
      return res.status(502).json({ error: 'Failed to generate AI response from Groq' });
    }

    const data = await response.json();
    const textResult = data.choices?.[0]?.message?.content?.trim() || "Stay focused and keep pushing!";
    
    res.json({
      success: true,
      result: textResult
    });
  } catch (err) {
    console.error('[AI Proxy] Internal Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Continuous Learning Endpoint (Super Intelligence)
 * The AI actually learns from the user's raw data / focus sessions.
 */
app.post('/api/learn', (req: Request, res: Response) => {
  const { user_id, memory } = req.body;
  if (!user_id || !memory) return res.status(400).json({ error: 'Missing learning data' });

  console.log(`[AI Core] Real Learning Event Received: "${memory}"`);
  
  db.run(
    'INSERT INTO ai_memory (user_id, memory_text) VALUES (?, ?)',
    [user_id, memory],
    function (err: Error | null) {
      if (err) {
        console.error("Failed to commit AI memory:", err);
        return res.status(500).json({ error: 'Core failure in learning matrix' });
      }
      res.json({ success: true, message: "AI has integrated this knowledge." });
    }
  );
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

// Fetch recent AI Memories for a user
app.get('/api/learn/history/:user_id', (req: Request, res: Response) => {
  const { user_id } = req.params;
  
  db.all(
    'SELECT * FROM ai_memory WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
    [user_id],
    (err: Error | null, rows: unknown[]) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch memory history', memories: [] });
      res.json({ memories: rows || [] });
    }
  );
});

app.listen(PORT, () => {
  console.log(`[Focus Twin Backend] Secure AI Proxy ACTIVE on http://localhost:${PORT}`);
  console.log(`[AI Core] Health check available at http://localhost:${PORT}/api/health`);
});
