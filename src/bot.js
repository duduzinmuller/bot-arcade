import { Client, GatewayIntentBits, Collection, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { config } from 'dotenv';
import { Database } from './database/database.js';
import { XPSystem } from './systems/xpSystem.js';
import { CommandHandler } from './handlers/commandHandler.js';
import { EventHandler } from './handlers/eventHandler.js';
import { AntiSpam } from './systems/antiSpam.js';

config();

class DiscordXPBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ]
    });

    this.commands = new Collection();
    this.database = new Database();
    this.xpSystem = new XPSystem(this.database);
    this.antiSpam = new AntiSpam();
    this.commandHandler = new CommandHandler(this);
    this.eventHandler = new EventHandler(this);
  }

  async start() {
    try {
      console.log('🚀 Iniciando Discord XP Bot...');
      
      await this.database.init();
      console.log('✅ Database inicializado');
      
      await this.commandHandler.loadCommands();
      console.log('✅ Comandos carregados');
      
      this.eventHandler.loadEvents();
      console.log('✅ Eventos carregados');
      
      await this.client.login(process.env.DISCORD_TOKEN);
      console.log('✅ Bot conectado ao Discord!');
      
    } catch (error) {
      console.error('❌ Erro ao iniciar o bot:', error);
      process.exit(1);
    }
  }
}

const bot = new DiscordXPBot();
bot.start();