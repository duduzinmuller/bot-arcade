import {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} from "discord.js";
import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

export default {
  data: new SlashCommandBuilder()
    .setName("perfil")
    .setDescription("Mostra o perfil de XP e nível de um usuário")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Usuário para ver o perfil")
        .setRequired(false)
    ),

  async execute(interaction, bot) {
    const targetUser =
      interaction.options.getUser("usuario") || interaction.user;
    const stats = await bot.xpSystem.getUserStats(
      targetUser.id,
      interaction.guild.id
    );

    await interaction.deferReply();

    try {
      const attachment = await this.createProfileCard(
        targetUser,
        stats,
        interaction.guild
      );

      const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle(`📊 Perfil de ${targetUser.displayName}`)
        .addFields(
          { name: "🎯 Nível", value: `${stats.level}`, inline: true },
          {
            name: "⭐ XP Total",
            value: `${stats.xp.toLocaleString()}`,
            inline: true,
          },
          {
            name: "📈 Progresso",
            value: `${stats.progress.toFixed(1)}%`,
            inline: true,
          },
          {
            name: "💬 Mensagens",
            value: `${stats.totalMessages.toLocaleString()}`,
            inline: true,
          },
          {
            name: "🎯 Próximo Nível",
            value: `${stats.xpForNextLevel - stats.xp} XP`,
            inline: true,
          },
          {
            name: "📊 XP Atual",
            value: `${stats.xp - stats.xpForCurrentLevel}/${
              stats.xpForNextLevel - stats.xpForCurrentLevel
            }`,
            inline: true,
          }
        )
        .setImage("attachment://profile.png")
        .setTimestamp();

      await interaction.editReply({
        embeds: [embed],
        files: [attachment],
      });
    } catch (error) {
      console.error("Erro ao criar card de perfil:", error);

      const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle(`📊 Perfil de ${targetUser.displayName}`)
        .addFields(
          { name: "🎯 Nível", value: `${stats.level}`, inline: true },
          {
            name: "⭐ XP Total",
            value: `${stats.xp.toLocaleString()}`,
            inline: true,
          },
          {
            name: "📈 Progresso",
            value: `${stats.progress.toFixed(1)}%`,
            inline: true,
          },
          {
            name: "💬 Mensagens",
            value: `${stats.totalMessages.toLocaleString()}`,
            inline: true,
          },
          {
            name: "🎯 Próximo Nível",
            value: `${stats.xpForNextLevel - stats.xp} XP`,
            inline: true,
          },
          {
            name: "📊 XP Atual",
            value: `${stats.xp - stats.xpForCurrentLevel}/${
              stats.xpForNextLevel - stats.xpForCurrentLevel
            }`,
            inline: true,
          }
        )
        .setThumbnail(
          targetUser.displayAvatarURL({ extension: "png", size: 256 })
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  },

  async executeMessage(message, targetUser, stats, bot) {
    try {
      const attachment = await this.createProfileCard(
        targetUser,
        stats,
        message.guild
      );

      const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle(`📊 Perfil de ${targetUser.displayName}`)
        .addFields(
          { name: "🎯 Nível", value: `${stats.level}`, inline: true },
          {
            name: "⭐ XP Total",
            value: `${stats.xp.toLocaleString()}`,
            inline: true,
          },
          {
            name: "📈 Progresso",
            value: `${stats.progress.toFixed(1)}%`,
            inline: true,
          },
          {
            name: "💬 Mensagens",
            value: `${stats.totalMessages.toLocaleString()}`,
            inline: true,
          },
          {
            name: "🎯 Próximo Nível",
            value: `${stats.xpForNextLevel - stats.xp} XP`,
            inline: true,
          },
          {
            name: "📊 XP Atual",
            value: `${stats.xp - stats.xpForCurrentLevel}/${
              stats.xpForNextLevel - stats.xpForCurrentLevel
            }`,
            inline: true,
          }
        )
        .setImage("attachment://profile.png")
        .setTimestamp();

      await message.reply({
        embeds: [embed],
        files: [attachment],
      });
    } catch (error) {
      console.error("Erro ao criar card de perfil:", error);

      const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle(`📊 Perfil de ${targetUser.displayName}`)
        .addFields(
          { name: "🎯 Nível", value: `${stats.level}`, inline: true },
          {
            name: "⭐ XP Total",
            value: `${stats.xp.toLocaleString()}`,
            inline: true,
          },
          {
            name: "📈 Progresso",
            value: `${stats.progress.toFixed(1)}%`,
            inline: true,
          }
        )
        .setThumbnail(
          targetUser.displayAvatarURL({ extension: "png", size: 256 })
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    }
  },

  async createProfileCard(user, stats, guild) {
    const canvas = createCanvas(800, 300);
    const ctx = canvas.getContext("2d");

    // Polyfill para roundRect se não existir (Node.js)
    if (!ctx.roundRect) {
      ctx.roundRect = function (x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(
          x + width,
          y + height,
          x + width - radius,
          y + height
        );
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
      };
    }

    const gradient = ctx.createLinearGradient(0, 0, 800, 300);
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(1, "#764ba2");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 300);

    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, 800, 300);

    try {
      const avatar = await loadImage(
        user.displayAvatarURL({ extension: "png", size: 256 })
      );

      ctx.save();
      ctx.beginPath();
      ctx.arc(100, 150, 60, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 40, 90, 120, 120);
      ctx.restore();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(100, 150, 60, 0, Math.PI * 2);
      ctx.stroke();
    } catch (error) {
      console.error("Erro ao carregar avatar:", error);

      ctx.fillStyle = "#5865F2";
      ctx.beginPath();
      ctx.arc(100, 150, 60, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 30px Arial";
      ctx.textAlign = "center";
      ctx.fillText(user.displayName.charAt(0).toUpperCase(), 100, 160);
    }

    // User info
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "left";
    ctx.fillText(user.displayName, 200, 80);

    ctx.font = "20px Arial";
    ctx.fillStyle = "#cccccc";
    ctx.fillText(`Nível ${stats.level}`, 200, 110);

    // XP Progress bar background
    const barX = 200;
    const barY = 140;
    const barWidth = 500;
    const barHeight = 30;

    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.roundRect(barX, barY, barWidth, barHeight, 15);
    ctx.fill();

    // XP Progress bar fill
    const progressWidth = (barWidth * stats.progress) / 100;
    const progressGradient = ctx.createLinearGradient(
      barX,
      barY,
      barX + progressWidth,
      barY
    );
    progressGradient.addColorStop(0, "#00ff88");
    progressGradient.addColorStop(1, "#00cc6a");

    ctx.fillStyle = progressGradient;
    ctx.roundRect(barX, barY, progressWidth, barHeight, 15);
    ctx.fill();

    // Progress text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    const currentXP = stats.xp - stats.xpForCurrentLevel;
    const neededXP = stats.xpForNextLevel - stats.xpForCurrentLevel;
    ctx.fillText(
      `${currentXP.toLocaleString()} / ${neededXP.toLocaleString()} XP`,
      barX + barWidth / 2,
      barY + 20
    );

    // Stats
    ctx.textAlign = "left";
    ctx.font = "18px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`XP Total: ${stats.xp.toLocaleString()}`, 200, 200);
    ctx.fillText(
      `Mensagens: ${stats.totalMessages.toLocaleString()}`,
      200,
      225
    );
    ctx.fillText(`Progresso: ${stats.progress.toFixed(1)}%`, 200, 250);

    // Next level info
    ctx.textAlign = "right";
    const xpToNext = stats.xpForNextLevel - stats.xp;
    ctx.fillText(
      `${xpToNext.toLocaleString()} XP para o próximo nível`,
      750,
      200
    );

    return new AttachmentBuilder(canvas.toBuffer(), { name: "profile.png" });
  },
};
