const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Comment = sequelize.define("Comment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  tool_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  clause_num: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  like_count: {
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
  tableName: "comments",
  timestamps: false,
  indexes: [
    { fields: ["tool_name", "clause_num"] },
    { fields: ["parent_id"] },
    { fields: ["status"] }
  ],
  hooks: {
    beforeCreate: (comment) => {
      comment.create_time = Date.now()
      comment.update_time = Date.now()
    },
    beforeUpdate: (comment) => {
      comment.update_time = Date.now()
    }
  }
})

module.exports = Comment
