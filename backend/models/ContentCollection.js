const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const ContentCollection = sequelize.define("ContentCollection", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  key: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false,
    defaultValue: ""
  },
  item_schema: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  last_published_at: {
    type: DataTypes.BIGINT,
    allowNull: true,
    defaultValue: null
  },
  create_time: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: () => Date.now()
  },
  update_time: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: () => Date.now()
  }
}, {
  tableName: "content_collections",
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

module.exports = ContentCollection
