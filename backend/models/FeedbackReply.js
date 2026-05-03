const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const FeedbackReply = sequelize.define("FeedbackReply", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    feedback_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '用户ID，如果为空则是管理员回复'
    },
    admin_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '管理员ID，如果为空则是用户回复'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_anonymous: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否匿名 (仅对用户回复有效)'
    },
    owner_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '反馈作者是否已读该回复'
    },
    create_time: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: () => Date.now()
    }
}, {
    tableName: "feedback_replies",
    timestamps: false,
    indexes: [
        { fields: ["feedback_id"] }
    ]
})

module.exports = FeedbackReply
