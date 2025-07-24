export class EventHandler {
  constructor(bot) {
    this.bot = bot;
  }

  loadEvents() {
    this.bot.client.once("ready", () => this.onReady());
    this.bot.client.on("interactionCreate", (interaction) =>
      this.onInteractionCreate(interaction)
    );
    this.bot.client.on("messageCreate", (message) =>
      this.onMessageCreate(message)
    );
    this.bot.client.on("guildCreate", (guild) => this.onGuildCreate(guild));
  }

  async onReady() {
    console.log(`🤖 Bot logado como ${this.bot.client.user.tag}!`);
    console.log(
      `📊 Conectado em ${this.bot.client.guilds.cache.size} servidores`
    );

    await this.registerSlashCommands();

    setInterval(() => {
      this.bot.antiSpam.cleanupOldEntries();
    }, 300000);
  }

  async registerSlashCommands() {
    try {
      const commands = Array.from(this.bot.commands.values()).map((cmd) =>
        cmd.data.toJSON()
      );

      await this.bot.client.application.commands.set(commands);
      console.log(
        `✅ ${commands.length} comandos slash registrados globalmente`
      );
    } catch (error) {
      console.error("❌ Erro ao registrar comandos slash:", error);
    }
  }

  async onInteractionCreate(interaction) {
    if (interaction.isChatInputCommand()) {
      await this.bot.commandHandler.handleSlashCommand(interaction);
    }
  }

  async onMessageCreate(message) {
    if (message.author.bot || !message.guild) return;

    // Processar comandos com prefixo
    await this.bot.commandHandler.handlePrefixCommand(message);

    // Sistema de XP
    await this.handleXPGain(message);
  }

  async handleXPGain(message) {
    const settings = await this.bot.database.getGuildSettings(message.guild.id);

    // Verificar cooldown anti-spam
    if (
      this.bot.antiSpam.isOnCooldown(message.author.id, settings.xp_cooldown)
    ) {
      return;
    }

    // Adicionar XP
    const result = await this.bot.xpSystem.addXP(
      message.author.id,
      message.guild.id,
      settings.xp_per_message
    );

    // Verificar se subiu de nível
    if (result.leveledUp) {
      await this.handleLevelUp(message, result);
    }
  }

  async handleLevelUp(message, result) {
    const settings = await this.bot.database.getGuildSettings(message.guild.id);

    // Verificar recompensas de nível
    await this.bot.xpSystem.checkLevelRewards(
      message.author.id,
      message.guild.id,
      result.newLevel,
      message.guild
    );

    // Enviar mensagem de level up
    const levelUpMessage = settings.level_up_message
      .replace("{user}", `<@${message.author.id}>`)
      .replace("{level}", result.newLevel);

    const channel = settings.level_up_channel
      ? message.guild.channels.cache.get(settings.level_up_channel)
      : message.channel;

    if (channel) {
      await channel.send(levelUpMessage);
    }
  }

  async onGuildCreate(guild) {
    console.log(`🎉 Bot adicionado ao servidor: ${guild.name} (${guild.id})`);

    // Criar configurações padrão para o servidor
    await this.bot.database.getGuildSettings(guild.id);
  }
}
