import { config } from 'dotenv';
import { Database } from './database/database.js';
import { REST, Routes } from 'discord.js';
import { promises as fs } from 'fs';
import path from 'path';

config();

class BotSetup {
  constructor() {
    this.database = new Database();
    this.rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  }

  async setup() {
    console.log('🚀 Iniciando configuração do bot...');

    try {
      // Verificar variáveis de ambiente
      await this.checkEnvironment();
      
      // Inicializar database
      await this.setupDatabase();
      
      // Registrar comandos
      await this.registerCommands();
      
      console.log('✅ Configuração concluída com sucesso!');
      console.log('\n📋 Próximos passos:');
      console.log('1. Execute "npm start" para iniciar o bot');
      console.log('2. Execute "npm run web" para iniciar o painel web');
      console.log('3. Adicione o bot ao seu servidor Discord');
      
    } catch (error) {
      console.error('❌ Erro durante a configuração:', error);
      process.exit(1);
    }
  }

  async checkEnvironment() {
    console.log('🔍 Verificando variáveis de ambiente...');
    
    const required = ['DISCORD_TOKEN', 'CLIENT_ID'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Variáveis de ambiente faltando: ${missing.join(', ')}`);
    }
    
    console.log('✅ Variáveis de ambiente OK');
  }

  async setupDatabase() {
    console.log('🗄️ Configurando database...');
    await this.database.init();
    console.log('✅ Database configurado');
  }

  async registerCommands() {
    console.log('📝 Registrando comandos...');
    
    const commands = [];
    const commandsPath = path.join(process.cwd(), 'src', 'commands');
    const commandFiles = await fs.readdir(commandsPath);
    
    for (const file of commandFiles) {
      if (file.endsWith('.js')) {
        const filePath = path.join(commandsPath, file);
        const { default: command } = await import(`file://${filePath}`);
        
        if (command && command.data) {
          commands.push(command.data.toJSON());
          console.log(`  ✓ ${command.data.name}`);
        }
      }
    }

    await this.rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    
    console.log(`✅ ${commands.length} comandos registrados`);
  }
}

// Executar setup se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new BotSetup();
  setup.setup();
}