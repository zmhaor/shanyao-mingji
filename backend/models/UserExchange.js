const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const UserExchange = sequelize.define("UserExchange", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: "users",
      key: "id"
    }
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "shop_items",
      key: "id"
    }
  },
  item_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  create_time: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: () => Date.now()
  }
}, {
  tableName: "user_exchanges",
  timestamps: false
})

module.exports = UserExchange
