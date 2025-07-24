export class XPSystem {
  constructor(database) {
    this.db = database;
  }

  calculateLevel(xp, multiplier = 100) {
    return Math.floor(Math.sqrt(xp / multiplier)) + 1;
  }

  calculateXPForLevel(level, multiplier = 100) {
    return Math.pow(level - 1, 2) * multiplier;
  }

  calculateXPForNextLevel(level, multiplier = 100) {
    return Math.pow(level, 2) * multiplier;
  }

  async addXP(userId, guildId, xpToAdd) {
    const userData = await this.db.getUserData(userId, guildId);
    const settings = await this.db.getGuildSettings(guildId);
    
    const currentXP = userData ? userData.xp : 0;
    const currentLevel = userData ? userData.level : 1;
    const totalMessages = userData ? userData.total_messages + 1 : 1;
    
    const newXP = currentXP + xpToAdd;
    const newLevel = this.calculateLevel(newXP, settings.level_multiplier);
    
    await this.db.updateUserXP(userId, guildId, newXP, newLevel, totalMessages);
    
    const leveledUp = newLevel > currentLevel;
    
    return {
      oldLevel: currentLevel,
      newLevel: newLevel,
      xp: newXP,
      leveledUp: leveledUp,
      xpGained: xpToAdd
    };
  }

  async getUserStats(userId, guildId) {
    const userData = await this.db.getUserData(userId, guildId);
    const settings = await this.db.getGuildSettings(guildId);
    
    if (!userData) {
      return {
        xp: 0,
        level: 1,
        xpForCurrentLevel: 0,
        xpForNextLevel: this.calculateXPForNextLevel(1, settings.level_multiplier),
        progress: 0,
        totalMessages: 0
      };
    }
    
    const xpForCurrentLevel = this.calculateXPForLevel(userData.level, settings.level_multiplier);
    const xpForNextLevel = this.calculateXPForNextLevel(userData.level, settings.level_multiplier);
    const progress = ((userData.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
    
    return {
      xp: userData.xp,
      level: userData.level,
      xpForCurrentLevel,
      xpForNextLevel,
      progress: Math.max(0, Math.min(100, progress)),
      totalMessages: userData.total_messages
    };
  }

  async getRanking(guildId, limit = 10) {
    const topUsers = await this.db.getTopUsers(guildId, limit);
    return topUsers.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
  }

  async checkLevelRewards(userId, guildId, newLevel, guild) {
    const rewards = await this.db.getLevelRewards(guildId);
    const member = await guild.members.fetch(userId);
    
    const rewardsToGive = rewards.filter(reward => 
      reward.level <= newLevel && 
      !member.roles.cache.has(reward.role_id)
    );
    
    for (const reward of rewardsToGive) {
      try {
        const role = guild.roles.cache.get(reward.role_id);
        if (role) {
          await member.roles.add(role);
          console.log(`✅ Cargo ${role.name} dado para ${member.user.tag} (nível ${newLevel})`);
        }
      } catch (error) {
        console.error(`❌ Erro ao dar cargo para ${member.user.tag}:`, error);
      }
    }
    
    return rewardsToGive;
  }
}