const app = getApp();

Page({
  data: {
    hero: null,
    equipmentSlots: [],
    totalPower: 0,
    inventory: []
  },

  onLoad(options) {
    const heroes = app.globalData.heroes || [];
    if (options && options.id) {
      this.heroId = options.id;
    } else if (heroes.length > 0) {
      this.heroId = heroes[0].id;
    } else {
      this.heroId = null;
    }
  },

  onShow() {
    this.initHero();
  },

  initHero() {
    const heroId = this.heroId;
    const heroes = app.globalData.heroes || [];
    let hero = null;
    for (let i = 0; i < heroes.length; i += 1) {
      if (heroes[i].id === heroId) {
        hero = heroes[i];
        break;
      }
    }

    if (!hero && heroes.length > 0) {
      hero = heroes[0];
    }

    if (!hero) {
      this.setData({
        hero: null,
        equipmentSlots: [],
        totalPower: 0,
        inventory: app.globalData.playerInventory || []
      });
      return;
    }

    if (!hero.equipped) {
      hero.equipped = {
        Weapon: null,
        Armor: null,
        Accessory: null
      };
    }

    const totalPower = typeof hero.totalPower === 'number'
      ? hero.totalPower
      : app.calculateTotalPower(hero);
    const equipmentSlots = this.buildEquipmentSlots(hero);

    this.setData({
      hero,
      equipmentSlots,
      totalPower,
      inventory: app.globalData.playerInventory || []
    });
  },

  buildEquipmentSlots(hero) {
    const config = app.globalData.EQUIPMENT_CONFIG || {};
    const types = config.types || [];
    const inventory = app.globalData.playerInventory || [];

    return types.map((typeInfo) => {
      const slotType = typeInfo.type;
      const equipId = hero.equipped && hero.equipped[slotType] ? hero.equipped[slotType] : null;
      let equipment = null;
      if (equipId) {
        for (let i = 0; i < inventory.length; i += 1) {
          if (inventory[i].id === equipId) {
            equipment = inventory[i];
            break;
          }
        }
      }

      return {
        type: slotType,
        label: typeInfo.label || slotType,
        equipment: equipment
      };
    });
  },

  openEquipSelect(event) {
    const slotType = event.currentTarget.dataset.type;
    const hero = this.data.hero;

    if (!slotType || !hero) {
      return;
    }

    const availableEquipments = this.getAvailableEquipment(slotType);
    const currentEquipId = hero.equipped && hero.equipped[slotType] ? hero.equipped[slotType] : null;

    if (!availableEquipments.length && !currentEquipId) {
      if (typeof wx !== 'undefined' && wx.showToast) {
        wx.showToast({ title: '暂无可穿戴装备', icon: 'none' });
      }
      return;
    }

    const options = availableEquipments.map((item) => item.name);
    const showUnequip = Boolean(currentEquipId);
    if (showUnequip) {
      options.push('卸下装备');
    }

    if (typeof wx !== 'undefined' && wx.showActionSheet) {
      wx.showActionSheet({
        itemList: options,
        success: (res) => {
          const { tapIndex } = res;
          const pickedIsUnequip = showUnequip && tapIndex === options.length - 1;

          if (pickedIsUnequip) {
            this.wearEquipment(null, slotType);
            return;
          }

          const pickedEquip = availableEquipments[tapIndex];
          if (pickedEquip) {
            this.wearEquipment(pickedEquip.id, slotType);
          }
        }
      });
    }
  },

  getAvailableEquipment(slotType) {
    const inventory = app.globalData.playerInventory || [];
    return inventory.filter((item) => item.type === slotType && !item.equippedBy);
  },

  wearEquipment(equipId, slotType) {
    const hero = this.data.hero;
    if (!hero || !slotType) {
      return;
    }

    const inventory = app.globalData.playerInventory || [];
    const currentEquipId = hero.equipped && hero.equipped[slotType] ? hero.equipped[slotType] : null;

    if (currentEquipId === equipId) {
      return;
    }

    if (currentEquipId) {
      const currentEquip = inventory.find((item) => item.id === currentEquipId);
      if (currentEquip) {
        currentEquip.equippedBy = null;
      }
      hero.equipped[slotType] = null;
    }

    if (equipId) {
      const newEquip = inventory.find((item) => item.id === equipId);
      if (!newEquip) {
        return;
      }

      if (newEquip.equippedBy && newEquip.equippedBy !== hero.id) {
        this.detachEquipmentFromHero(newEquip.id, newEquip.type, newEquip.equippedBy);
      }

      newEquip.equippedBy = hero.id;
      hero.equipped[slotType] = equipId;
    }

    this.updateHero(hero);
  },

  detachEquipmentFromHero(equipId, slotType, heroId) {
    const heroes = app.globalData.heroes || [];
    const targetHero = heroes.find((item) => item.id === heroId);

    if (!targetHero || !targetHero.equipped) {
      return;
    }

    if (targetHero.equipped[slotType] === equipId) {
      targetHero.equipped[slotType] = null;
    }
  },

  updateHero(hero) {
    const heroes = app.globalData.heroes || [];
    const index = heroes.findIndex((item) => item.id === hero.id);

    if (index >= 0) {
      heroes[index] = hero;
    } else {
      heroes.push(hero);
    }

    app.recalculateTotalPower();
    app.saveGlobalData();

    let updatedHero = null;
    for (let i = 0; i < app.globalData.heroes.length; i += 1) {
      if (app.globalData.heroes[i].id === hero.id) {
        updatedHero = app.globalData.heroes[i];
        break;
      }
    }
    if (!updatedHero) {
      updatedHero = hero;
    }

    const equipmentSlots = this.buildEquipmentSlots(updatedHero);
    const totalPower = typeof updatedHero.totalPower === 'number'
      ? updatedHero.totalPower
      : app.calculateTotalPower(updatedHero);

    this.setData({
      hero: updatedHero,
      equipmentSlots,
      totalPower,
      inventory: app.globalData.playerInventory || []
    });
  }
});
