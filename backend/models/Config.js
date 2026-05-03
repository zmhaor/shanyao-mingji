const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Config = sequelize.define("Config", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.TEXT("long"),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
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
  tableName: "configs",
  timestamps: false,
  hooks: {
    beforeCreate: (config) => {
      config.create_time = Date.now()
      config.update_time = Date.now()
    },
    beforeUpdate: (config) => {
      config.update_time = Date.now()
    }
  }
})

module.exports = Config
