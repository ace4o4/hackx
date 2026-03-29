import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'focus_twin.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[DB] Error opening Focus Twin SQLite database', err);
  } else {
    console.log('[DB] Connected to the Focus Twin SQLite database.');
    
    // Setup initial schema for Account + Sync Vault
    db.serialize(() => {
      // Users table (For Authentication & Sync Identity)
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Encrypted Vaults (E2E Encrypted Backups of TwinState & Patterns)
      // The server never holds the encryption keys, only the encrypted blobs
      db.run(`
        CREATE TABLE IF NOT EXISTS encrypted_vaults (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          encrypted_blob TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS zk_proofs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          data_type TEXT NOT NULL,
          proof_hash TEXT NOT NULL,
          reward TEXT NOT NULL,
          tx_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // AI Memory for Continuous Learning
      // Dynamically fed into the Gemini Prompt
      db.run(`
        CREATE TABLE IF NOT EXISTS ai_memory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          memory_text TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Seed a default mock user if none exists (for hackathon demo)
      db.get('SELECT COUNT(*) as count FROM users', (err, row: { count: number }) => {
        if (!err && row.count === 0) {
          db.run(`
            INSERT INTO users (id, email) 
            VALUES ('usr_demo_01', 'demo@focustwin.com')
          `);
        }
      });
    });
  }
});

export default db;
