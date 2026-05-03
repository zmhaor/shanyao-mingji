// backend/models/Feedback.js
const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Feedback = sequelize.define("Feedback", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: "users",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    contact: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pending', // pending(待处理), adopted(已采纳), resolved(已解决)
        comment: '反馈状态'
    },
    reply: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '管理员回复'
    },
    likes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '点赞数'
    },
    is_anonymous: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否匿名'
    },
    create_time: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: () => Date.now()
    }
}, {
    tableName: "feedback",
    timestamps: false
})

module.exports = Feedback
