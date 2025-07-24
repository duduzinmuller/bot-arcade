import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Mostra o ranking dos usuários com mais XP do servidor')
    .addIntegerOption(option =>
      option.setName('pagina')
        .setDescription('Página do ranking (padrão: 1)')
        .setRequired(false)
        .setMinValue(1)
    ),

  async execute(interaction, bot) {
    const page = interaction.options.getInteger('pagina') || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    await interaction.deferReply();

    try {
      const ranking = await bot.xpSystem.getRanking(interaction.guild.id, limit + offset);
      const pageRanking = ranking.slice(offset, offset + limit);

      if (pageRanking.length === 0) {
        const embed = new EmbedBuilder()
          .setColor('#ff6b6b')
          .setTitle('📊 Ranking de XP')
          .setDescription('Nenhum usuário encontrado nesta página!')
          .setTimestamp();

        return await interaction.editReply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🏆 Ranking de XP')
        .setDescription(`Página ${page} - Top usuários do servidor`)
        .setTimestamp()
        .setFooter({ 
          text: `${interaction.guild.name}`, 
          iconURL: interaction.guild.iconURL() 
        });

      let description = '';
      
      for (let i = 0; i < pageRanking.length; i++) {
        const user = pageRanking[i];
        const rank = offset + i + 1;
        
        let medal = '';
        if (rank === 1) medal = '🥇';
        else if (rank === 2) medal = '🥈';
        else if (rank === 3) medal = '🥉';
        else medal = `**${rank}.**`;

        try {
          const discordUser = await interaction.client.users.fetch(user.id);
          description += `${medal} **${discordUser.displayName}**\n`;
          description += `   └ Nível ${user.level} • ${user.xp.toLocaleString()} XP • ${user.total_messages.toLocaleString()} msgs\n\n`;
        } catch (error) {
          description += `${medal} **Usuário Desconhecido**\n`;
          description += `   └ Nível ${user.level} • ${user.xp.toLocaleString()} XP • ${user.total_messages.toLocaleString()} msgs\n\n`;
        }
      }

      embed.setDescription(description);

      // Adicionar posição do usuário atual se não estiver na página
      const userRank = ranking.findIndex(u => u.id === interaction.user.id) + 1;
      if (userRank > 0 && (userRank < offset + 1 || userRank > offset + limit)) {
        const userData = ranking[userRank - 1];
        embed.addFields({
          name: '📍 Sua Posição',
          value: `**${userRank}º lugar** • Nível ${userData.level} • ${userData.xp.toLocaleString()} XP`,
          inline: false
        });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
      
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('❌ Erro')
        .setDescription('Ocorreu um erro ao buscar o ranking. Tente novamente mais tarde.')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  },

  async executeMessage(message, bot) {
    try {
      const ranking = await bot.xpSystem.getRanking(message.guild.id, 10);

      if (ranking.length === 0) {
        const embed = new EmbedBuilder()
          .setColor('#ff6b6b')
          .setTitle('📊 Ranking de XP')
          .setDescription('Nenhum usuário encontrado no ranking!')
          .setTimestamp();

        return await message.reply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🏆 Ranking de XP')
        .setDescription('Top 10 usuários do servidor')
        .setTimestamp()
        .setFooter({ 
          text: `${message.guild.name}`, 
          iconURL: message.guild.iconURL() 
        });

      let description = '';
      
      for (let i = 0; i < ranking.length; i++) {
        const user = ranking[i];
        const rank = i + 1;
        
        let medal = '';
        if (rank === 1) medal = '🥇';
        else if (rank === 2) medal = '🥈';
        else if (rank === 3) medal = '🥉';
        else medal = `**${rank}.**`;

        try {
          const discordUser = await message.client.users.fetch(user.id);
          description += `${medal} **${discordUser.displayName}**\n`;
          description += `   └ Nível ${user.level} • ${user.xp.toLocaleString()} XP • ${user.total_messages.toLocaleString()} msgs\n\n`;
        } catch (error) {
          description += `${medal} **Usuário Desconhecido**\n`;
          description += `   └ Nível ${user.level} • ${user.xp.toLocaleString()} XP • ${user.total_messages.toLocaleString()} msgs\n\n`;
        }
      }

      embed.setDescription(description);

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
      
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('❌ Erro')
        .setDescription('Ocorreu um erro ao buscar o ranking. Tente novamente mais tarde.')
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    }
  }
};