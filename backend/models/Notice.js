const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Notice = sequelize.define("Notice", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM("popup", "scroll"),
        allowNull: false,
        defaultValue: "popup",
        comment: "公告类型: popup-弹窗, scroll-滚动"
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    confirmed_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    tableName: "notices",
    timestamps: false,
    hooks: {
        beforeCreate: (notice) => {
            notice.create_time = Date.now()
            notice.update_time = Date.now()
        },
        beforeUpdate: (notice) => {
            notice.update_time = Date.now()
        }
    }
})

module.exports = Notice
