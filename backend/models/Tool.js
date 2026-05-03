const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Tool = sequelize.define("Tool", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ""
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: "🔧"
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: "学习助手"
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ""
  },
  usage_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  features: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('features');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('features', JSON.stringify(value));
    }
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  favorites: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active'
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
  tableName: "tools",
  timestamps: false,
  hooks: {
    beforeCreate: (tool) => {
      tool.create_time = Date.now()
      tool.update_time = Date.now()
    },
    beforeUpdate: (tool) => {
      tool.update_time = Date.now()
    }
  }
})

module.exports = Tool
