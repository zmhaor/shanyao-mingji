const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const ContentDeleteLog = sequelize.define("ContentDeleteLog", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  collection_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  item_key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: ""
  },
  delete_time: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: () => Date.now()
  }
}, {
  tableName: "content_delete_logs",
  timestamps: false,
  hooks: {
    beforeCreate: (item) => {
      item.delete_time = Date.now()
    }
  },
  indexes: [
    { fields: ["collection_id"] },
    { fields: ["item_key"] },
    { fields: ["delete_time"] }
  ]
})

module.exports = ContentDeleteLog
