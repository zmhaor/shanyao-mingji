const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const ContentItem = sequelize.define("ContentItem", {
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ""
  },
  chapter: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ""
  },
  section: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ""
  },
  group_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ""
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  clause_num: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: ""
  },
  textbook_order: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  sort_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: "published"
  },
  content_json: {
    type: DataTypes.JSON,
    allowNull: false
  },
  search_text: {
    type: DataTypes.TEXT("long"),
    allowNull: false,
    defaultValue: ""
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
  tableName: "content_items",
  timestamps: false,
  hooks: {
    beforeCreate: (item) => {
      item.create_time = Date.now()
      item.update_time = Date.now()
    },
    beforeUpdate: (item) => {
      item.update_time = Date.now()
    }
  },
  indexes: [
    { fields: ["collection_id"] },
    { fields: ["status"] },
    { fields: ["sort_order"] },
    { fields: ["textbook_order"] },
    { fields: ["title"] },
    { unique: true, fields: ["collection_id", "item_key"] }
  ]
})

module.exports = ContentItem
