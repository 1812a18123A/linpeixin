const EQUIPMENT_TYPES = [
  { type: 'Weapon', label: '武器' },
  { type: 'Armor', label: '护甲' },
  { type: 'Accessory', label: '饰品' }
];

const DEFAULT_HEROES = [
  {
    id: 'hero-001',
    name: '青锋侠',
    basePower: 120,
    level: 5,
    levelBonus: 12,
    equipped: {
      Weapon: null,
      Armor: null,
      Accessory: null
    },
    totalPower: 0
  },
  {
    id: 'hero-002',
    name: '赤焰侠',
    basePower: 140,
    level: 6,
    levelBonus: 13,
    equipped: {
      Weapon: null,
      Armor: null,
      Accessory: null
    },
    totalPower: 0
  }
];

const DEFAULT_INVENTORY = [
  {
    id: 'equip-weapon-001',
    name: '寒铁剑',
    type: 'Weapon',
    Attack: 35,
    Defense: 5,
    Health: 0,
    equippedBy: null
  },
  {
    id: 'equip-armor-001',
    name: '山铜甲',
    type: 'Armor',
    Attack: 0,
    Defense: 25,
    Health: 30,
    equippedBy: null
  },
  {
    id: 'equip-accessory-001',
    name: '灵息坠',
    type: 'Accessory',
    Attack: 10,
    Defense: 0,
    Health: 40,
    equippedBy: null
  }
];

App({
  onLaunch() {
    this.recalculateTotalPower();
  },

  globalData: {
    heroes: DEFAULT_HEROES,
    EQUIPMENT_CONFIG: {
      types: EQUIPMENT_TYPES
    },
    playerInventory: DEFAULT_INVENTORY
  },

  getEquipPower(hero) {
    if (!hero || !hero.equipped) {
      return {
        attack: 0,
        defense: 0,
        health: 0
      };
    }

    const totals = {
      attack: 0,
      defense: 0,
      health: 0
    };

    const equippedIds = Object.values(hero.equipped);
    equippedIds.forEach((equipId) => {
      if (!equipId) {
        return;
      }
      const equip = this.globalData.playerInventory.find((item) => item.id === equipId);
      if (!equip) {
        return;
      }
      totals.attack += Number(equip.Attack) || 0;
      totals.defense += Number(equip.Defense) || 0;
      totals.health += Number(equip.Health) || 0;
    });

    return totals;
  },

  calculateTotalPower(hero) {
    if (!hero) {
      return 0;
    }

    const basePower = Number(hero.basePower) || 0;
    const level = Number(hero.level) || 0;
    const levelBonus = Number(hero.levelBonus) || 0;
    const levelPower = level * levelBonus;

    const equipPower = this.getEquipPower(hero);
    const totalEquipPower = equipPower.attack + equipPower.defense + equipPower.health;

    const totalPower = basePower + levelPower + totalEquipPower;
    return Math.round(totalPower);
  },

  recalculateTotalPower() {
    if (!Array.isArray(this.globalData.heroes)) {
      return;
    }

    this.globalData.heroes = this.globalData.heroes.map((hero) => {
      const updated = { ...hero };
      updated.totalPower = this.calculateTotalPower(updated);
      return updated;
    });
  },

  saveGlobalData() {
    if (typeof wx !== 'undefined' && wx.setStorageSync) {
      wx.setStorageSync('GLOBAL_DATA', this.globalData);
    }
  }
});
