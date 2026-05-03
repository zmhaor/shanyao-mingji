const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Category = sequelize.define("Category", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: "📁"
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: "active"
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
  tableName: "categories",
  timestamps: false,
  hooks: {
    beforeCreate: (category) => {
      category.create_time = Date.now()
      category.update_time = Date.now()
    },
    beforeUpdate: (category) => {
      category.update_time = Date.now()
    }
  }
})

module.exports = Category
