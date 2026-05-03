const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const MaterialExchange = sequelize.define("MaterialExchange", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  material_id: {
    type: DataTypes.INTEGER,
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
  tableName: "material_exchanges",
  timestamps: false,
  hooks: {
    beforeCreate: (item) => {
      item.create_time = Date.now()
    }
  },
  indexes: [
    {
      unique: true,
      fields: ["user_id", "material_id"]
    }
  ]
})

module.exports = MaterialExchange
