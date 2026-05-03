const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const ShopItem = sequelize.define("ShopItem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  create_time: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: () => Date.now()
  },
  update_time: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: () => Date.now(),
    onUpdate: () => Date.now()
  }
}, {
  tableName: "shop_items",
  timestamps: false,
  hooks: {
    beforeCreate: (item) => {
      item.create_time = Date.now()
      item.update_time = Date.now()
    },
    beforeUpdate: (item) => {
      item.update_time = Date.now()
    }
  }
})

module.exports = ShopItem
