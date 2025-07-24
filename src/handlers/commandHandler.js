import { Collection } from "discord.js";
import { promises as fs } from "fs";
import path from "path";

export class CommandHandler {
  constructor(bot) {
    this.bot = bot;
    this.commands = new Collection();
  }

  async loadCommands() {
    const commandsPath = path.join(process.cwd(), "src", "commands");

    try {
      const commandFiles = await fs.readdir(commandsPath);

      for (const file of commandFiles) {
        if (file.endsWith(".js")) {
          const filePath = path.join(commandsPath, file);
          const { default: command } = await import(`file://${filePath}`);

          if (command && command.data && command.execute) {
            this.commands.set(command.data.name, command);
            this.bot.commands.set(command.data.name, command);
            console.log(`📝 Comando carregado: ${command.data.name}`);
          }
        }
      }
    } catch (error) {
      console.error("❌ Erro ao carregar comandos:", error);
    }
  }

  async handleSlashCommand(interaction) {
    const command = this.commands.get(interaction.commandName);

    if (!command) {
      console.error(`❌ Comando não encontrado: ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction, this.bot);
    } catch (error) {
      console.error(
        `❌ Erro ao executar comando ${interaction.commandName}:`,
        error
      );

      const errorMessage = "Houve um erro ao executar este comando!";

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  }

  async handlePrefixCommand(message) {
    const prefix = "!";
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    switch (commandName) {
      case "perfil":
      case "profile":
        await this.handleProfileCommand(message, args);
        break;
      case "ranking":
      case "leaderboard":
        await this.handleRankingCommand(message, args);
        break;
    }
  }

  async handleProfileCommand(message, args) {
    const targetUser = message.mentions.users.first() || message.author;
    const stats = await this.bot.xpSystem.getUserStats(
      targetUser.id,
      message.guild.id
    );

    const { default: profileCommand } = await import("../commands/perfil.js");
    await profileCommand.executeMessage(message, targetUser, stats, this.bot);
  }

  async handleRankingCommand(message, args) {
    const { default: rankingCommand } = await import("../commands/ranking.js");
    await rankingCommand.executeMessage(message, this.bot);
  }
}
