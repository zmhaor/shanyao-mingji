const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const FeedbackLike = sequelize.define("FeedbackLike", {
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
        allowNull: false
    },
    create_time: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: () => Date.now()
    }
}, {
    tableName: "feedback_likes",
    timestamps: false,
    indexes: [
        { fields: ["feedback_id"] },
        { fields: ["user_id"] },
        { unique: true, fields: ["feedback_id", "user_id"] }
    ]
})

module.exports = FeedbackLike
