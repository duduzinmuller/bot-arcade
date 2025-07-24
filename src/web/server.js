import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { Database } from '../database/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WebPanel {
  constructor() {
    this.app = express();
    this.port = process.env.WEB_PORT || 3000;
    this.database = new Database();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
          scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));
    
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  setupRoutes() {
    // Página principal
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // API Routes
    this.app.get('/api/guilds/:guildId/stats', async (req, res) => {
      try {
        const { guildId } = req.params;
        
        const topUsers = await this.database.getTopUsers(guildId, 10);
        const settings = await this.database.getGuildSettings(guildId);
        const rewards = await this.database.getLevelRewards(guildId);
        
        // Contar total de usuários
        const totalUsers = await this.database.get(
          'SELECT COUNT(*) as count FROM users WHERE guild_id = ?',
          [guildId]
        );

        res.json({
          topUsers,
          settings,
          rewards,
          totalUsers: totalUsers.count
        });
      } catch (error) {
        console.error('Erro ao buscar stats:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });

    this.app.get('/api/guilds/:guildId/users/:userId', async (req, res) => {
      try {
        const { guildId, userId } = req.params;
        const userData = await this.database.getUserData(userId, guildId);
        
        if (!userData) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json(userData);
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });

    // Rota para atualizar configurações (requer autenticação)
    this.app.post('/api/guilds/:guildId/settings', async (req, res) => {
      try {
        const { guildId } = req.params;
        const { xp_per_message, xp_cooldown, level_multiplier } = req.body;

        await this.database.run(`
          UPDATE guild_settings 
          SET xp_per_message = ?, xp_cooldown = ?, level_multiplier = ?, updated_at = CURRENT_TIMESTAMP
          WHERE guild_id = ?
        `, [xp_per_message, xp_cooldown, level_multiplier, guildId]);

        res.json({ success: true });
      } catch (error) {
        console.error('Erro ao atualizar configurações:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });
  }

  async start() {
    await this.database.init();
    
    this.app.listen(this.port, () => {
      console.log(`🌐 Painel web rodando em http://localhost:${this.port}`);
    });
  }
}

// Iniciar servidor se executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const webPanel = new WebPanel();
  webPanel.start();
}

export { WebPanel };