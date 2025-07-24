import sqlite3 from 'sqlite3';
import { promises as fs } from 'fs';
import path from 'path';

export class Database {
  constructor() {
    this.dbPath = process.env.DATABASE_PATH || './data/bot.db';
    this.db = null;
  }

  async init() {
    // Criar diretório se não existir
    const dir = path.dirname(this.dbPath);
    await fs.mkdir(dir, { recursive: true });

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        guild_id TEXT NOT NULL,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        last_message DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_messages INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id TEXT PRIMARY KEY,
        xp_per_message INTEGER DEFAULT 15,
        xp_cooldown INTEGER DEFAULT 60000,
        level_multiplier INTEGER DEFAULT 100,
        level_up_message TEXT DEFAULT 'Parabéns {user}! Você subiu para o nível {level}! 🎉',
        level_up_channel TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS level_rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        level INTEGER NOT NULL,
        role_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE INDEX IF NOT EXISTS idx_users_guild_xp ON users(guild_id, xp DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_level_rewards_guild_level ON level_rewards(guild_id, level)`
    ];

    for (const query of queries) {
      await this.run(query);
    }
  }

  run(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getUserData(userId, guildId) {
    return await this.get(
      'SELECT * FROM users WHERE id = ? AND guild_id = ?',
      [userId, guildId]
    );
  }

  async updateUserXP(userId, guildId, xp, level, totalMessages) {
    const now = new Date().toISOString();
    return await this.run(`
      INSERT OR REPLACE INTO users (id, guild_id, xp, level, total_messages, last_message, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [userId, guildId, xp, level, totalMessages, now, now]);
  }

  async getTopUsers(guildId, limit = 10) {
    return await this.all(`
      SELECT * FROM users 
      WHERE guild_id = ? 
      ORDER BY xp DESC 
      LIMIT ?
    `, [guildId, limit]);
  }

  async getGuildSettings(guildId) {
    let settings = await this.get('SELECT * FROM guild_settings WHERE guild_id = ?', [guildId]);
    
    if (!settings) {
      await this.run(`
        INSERT INTO guild_settings (guild_id) VALUES (?)
      `, [guildId]);
      settings = await this.get('SELECT * FROM guild_settings WHERE guild_id = ?', [guildId]);
    }
    
    return settings;
  }

  async getLevelRewards(guildId) {
    return await this.all('SELECT * FROM level_rewards WHERE guild_id = ? ORDER BY level ASC', [guildId]);
  }

  async addLevelReward(guildId, level, roleId) {
    return await this.run(
      'INSERT INTO level_rewards (guild_id, level, role_id) VALUES (?, ?, ?)',
      [guildId, level, roleId]
    );
  }
}