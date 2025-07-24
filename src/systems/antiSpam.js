export class AntiSpam {
  constructor() {
    this.userCooldowns = new Map();
  }

  isOnCooldown(userId, cooldownTime = 60000) {
    const now = Date.now();
    const userLastMessage = this.userCooldowns.get(userId);
    
    if (!userLastMessage) {
      this.userCooldowns.set(userId, now);
      return false;
    }
    
    if (now - userLastMessage < cooldownTime) {
      return true;
    }
    
    this.userCooldowns.set(userId, now);
    return false;
  }

  cleanupOldEntries() {
    const now = Date.now();
    const maxAge = 300000; // 5 minutos
    
    for (const [userId, timestamp] of this.userCooldowns.entries()) {
      if (now - timestamp > maxAge) {
        this.userCooldowns.delete(userId);
      }
    }
  }
}