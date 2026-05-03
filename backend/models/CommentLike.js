const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const CommentLike = sequelize.define("CommentLike", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  comment_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  create_time: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: () => Date.now()
  }
}, {
  tableName: "comment_likes",
  timestamps: false,
  indexes: [
    { unique: true, fields: ["comment_id", "user_id"] },
    { fields: ["user_id"] }
  ],
  hooks: {
    beforeCreate: (like) => {
      like.create_time = Date.now()
    }
  }
})

module.exports = CommentLike
