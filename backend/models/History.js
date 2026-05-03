const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const History = sequelize.define("History", {
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
  tool_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "tools",
      key: "id"
    }
  },
  tool_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: "用户在该工具页面的停留时长（秒）"
  },
  create_time: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: () => Date.now()
  }
}, {
  tableName: "history",
  timestamps: false
})

module.exports = History
