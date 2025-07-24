import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configurações do sistema de XP')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(subcommand =>
      subcommand
        .setName('xp')
        .setDescription('Configurar XP por mensagem')
        .addIntegerOption(option =>
          option.setName('quantidade')
            .setDescription('Quantidade de XP por mensagem (1-100)')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('cooldown')
        .setDescription('Configurar cooldown entre mensagens')
        .addIntegerOption(option =>
          option.setName('segundos')
            .setDescription('Cooldown em segundos (10-300)')
            .setRequired(true)
            .setMinValue(10)
            .setMaxValue(300)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('multiplicador')
        .setDescription('Configurar multiplicador de nível')
        .addIntegerOption(option =>
          option.setName('valor')
            .setDescription('Multiplicador de nível (50-500)')
            .setRequired(true)
            .setMinValue(50)
            .setMaxValue(500)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('canal-levelup')
        .setDescription('Configurar canal para mensagens de level up')
        .addChannelOption(option =>
          option.setName('canal')
            .setDescription('Canal para mensagens de level up (deixe vazio para usar o canal atual)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('recompensa')
        .setDescription('Adicionar recompensa de nível')
        .addIntegerOption(option =>
          option.setName('nivel')
            .setDescription('Nível para dar a recompensa')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(1000)
        )
        .addRoleOption(option =>
          option.setName('cargo')
            .setDescription('Cargo para dar como recompensa')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('ver')
        .setDescription('Ver configurações atuais')
    ),

  async execute(interaction, bot) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'xp':
        await this.handleXPConfig(interaction, bot);
        break;
      case 'cooldown':
        await this.handleCooldownConfig(interaction, bot);
        break;
      case 'multiplicador':
        await this.handleMultiplierConfig(interaction, bot);
        break;
      case 'canal-levelup':
        await this.handleChannelConfig(interaction, bot);
        break;
      case 'recompensa':
        await this.handleRewardConfig(interaction, bot);
        break;
      case 'ver':
        await this.handleViewConfig(interaction, bot);
        break;
    }
  },

  async handleXPConfig(interaction, bot) {
    const xpAmount = interaction.options.getInteger('quantidade');
    
    await bot.database.run(
      'UPDATE guild_settings SET xp_per_message = ?, updated_at = CURRENT_TIMESTAMP WHERE guild_id = ?',
      [xpAmount, interaction.guild.id]
    );

    const embed = new EmbedBuilder()
      .setColor('#00ff88')
      .setTitle('✅ Configuração Atualizada')
      .setDescription(`XP por mensagem alterado para **${xpAmount}**`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  async handleCooldownConfig(interaction, bot) {
    const cooldownSeconds = interaction.options.getInteger('segundos');
    const cooldownMs = cooldownSeconds * 1000;
    
    await bot.database.run(
      'UPDATE guild_settings SET xp_cooldown = ?, updated_at = CURRENT_TIMESTAMP WHERE guild_id = ?',
      [cooldownMs, interaction.guild.id]
    );

    const embed = new EmbedBuilder()
      .setColor('#00ff88')
      .setTitle('✅ Configuração Atualizada')
      .setDescription(`Cooldown entre mensagens alterado para **${cooldownSeconds} segundos**`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  async handleMultiplierConfig(interaction, bot) {
    const multiplier = interaction.options.getInteger('valor');
    
    await bot.database.run(
      'UPDATE guild_settings SET level_multiplier = ?, updated_at = CURRENT_TIMESTAMP WHERE guild_id = ?',
      [multiplier, interaction.guild.id]
    );

    const embed = new EmbedBuilder()
      .setColor('#00ff88')
      .setTitle('✅ Configuração Atualizada')
      .setDescription(`Multiplicador de nível alterado para **${multiplier}**`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  async handleChannelConfig(interaction, bot) {
    const channel = interaction.options.getChannel('canal');
    const channelId = channel ? channel.id : null;
    
    await bot.database.run(
      'UPDATE guild_settings SET level_up_channel = ?, updated_at = CURRENT_TIMESTAMP WHERE guild_id = ?',
      [channelId, interaction.guild.id]
    );

    const embed = new EmbedBuilder()
      .setColor('#00ff88')
      .setTitle('✅ Configuração Atualizada')
      .setDescription(channel 
        ? `Canal de level up alterado para ${channel}`
        : 'Canal de level up removido (usará o canal atual)')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  async handleRewardConfig(interaction, bot) {
    const level = interaction.options.getInteger('nivel');
    const role = interaction.options.getRole('cargo');

    try {
      await bot.database.addLevelReward(interaction.guild.id, level, role.id);

      const embed = new EmbedBuilder()
        .setColor('#00ff88')
        .setTitle('✅ Recompensa Adicionada')
        .setDescription(`Cargo ${role} será dado automaticamente no nível **${level}**`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erro ao adicionar recompensa:', error);
      
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('❌ Erro')
        .setDescription('Erro ao adicionar recompensa. Verifique se já não existe uma recompensa para este nível.')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  },

  async handleViewConfig(interaction, bot) {
    const settings = await bot.database.getGuildSettings(interaction.guild.id);
    const rewards = await bot.database.getLevelRewards(interaction.guild.id);

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('⚙️ Configurações do Servidor')
      .addFields(
        { name: '⭐ XP por Mensagem', value: `${settings.xp_per_message}`, inline: true },
        { name: '⏱️ Cooldown', value: `${settings.xp_cooldown / 1000}s`, inline: true },
        { name: '📈 Multiplicador', value: `${settings.level_multiplier}`, inline: true },
        { name: '📢 Canal Level Up', value: settings.level_up_channel ? `<#${settings.level_up_channel}>` : 'Canal atual', inline: false }
      )
      .setTimestamp();

    if (rewards.length > 0) {
      const rewardText = rewards.map(r => {
        const role = interaction.guild.roles.cache.get(r.role_id);
        return `Nível ${r.level}: ${role ? role.name : 'Cargo removido'}`;
      }).join('\n');

      embed.addFields({ name: '🎁 Recompensas', value: rewardText, inline: false });
    }

    await interaction.reply({ embeds: [embed] });
  }
};