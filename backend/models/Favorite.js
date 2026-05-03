const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Favorite = sequelize.define("Favorite", {
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
  create_time: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: () => Date.now()
  }
}, {
  tableName: "favorites",
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ["user_id", "tool_id"]
    }
  ]
})

module.exports = Favorite
