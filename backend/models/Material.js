const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Material = sequelize.define("Material", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: ""
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  },
  file_ext: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: ""
  },
  preview_images: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: "[]"
  },
  sort_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  points_required: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
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
    defaultValue: () => Date.now()
  }
}, {
  tableName: "materials",
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

module.exports = Material
