const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const SyncHistory = sequelize.define("SyncHistory", {
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
        comment: "工具标识"
    },
    sync_type: {
        type: DataTypes.STRING(10),
        allowNull: false,
        comment: "同步类型：upload 或 download"
    },
    data_types: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "JSON 格式的同步数据类型列表，如 [\"history\",\"groups\",\"formulaVersion\"]"
    },
    progress_data: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        comment: "JSON 格式的 history 数组数据"
    },
    hidden_map: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "JSON 格式的隐藏方剂映射"
    },
    custom_groups: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        comment: "JSON 格式的自定义背诵组数据"
    },
    formula_song_version: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: "方歌版本：v1 或 v2（旧格式兼容）"
    },
    formula_song_versions: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "JSON 格式的每个方剂版本映射"
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
        comment: "已复习条目数"
    },
    correct_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "正确条目数"
    },
    created_at: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: () => Date.now()
    }
}, {
    tableName: "sync_history",
    timestamps: false,
    indexes: [
        {
            fields: ["user_id", "tool_name"]
        },
        {
            fields: ["user_id", "tool_name", "sync_type"]
        }
    ],
    hooks: {
        beforeCreate: (record) => {
            record.created_at = Date.now()
        }
    }
})

module.exports = SyncHistory
