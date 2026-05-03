const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const StudyProgress = sequelize.define("StudyProgress", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    tool_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "支持动态添加的工具标识"
    },
    progress_data: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
        comment: "JSON 格式的 history 数组数据"
    },
    hidden_map: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "JSON 格式的隐藏方剂映射（仅方剂工具使用）"
    },
    custom_groups: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        comment: "JSON 格式的自定义背诵组数据"
    },
    formula_song_version: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: 'v1',
        comment: "方歌版本选择：v1 或 v2（仅方剂工具使用，旧格式兼容）"
    },
    formula_song_versions: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "JSON 格式的每个方剂版本映射，如 {\"麻黄汤\": \"v1\", \"桂枝汤\": \"v2\"}"
    },
    total_entries: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "总条目数"
    },
    reviewed_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "已复习条目数（有答题记录的条目）"
    },
    correct_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "最后一次回答正确的条目数"
    },
    updated_at: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: () => Date.now()
    }
}, {
    tableName: "study_progress",
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ["user_id", "tool_name"]
        }
    ],
    hooks: {
        beforeCreate: (record) => {
            record.updated_at = Date.now()
        },
        beforeUpdate: (record) => {
            record.updated_at = Date.now()
        }
    }
})

module.exports = StudyProgress
