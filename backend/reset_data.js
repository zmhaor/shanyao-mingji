require("dotenv").config();
const db = require("./config/database");
const models = require("./models/index");
const { Admin } = models;

async function resetAndInit() {
    try {
        await db.authenticate();
        console.log("🔗 数据库连接成功，准备清理数据...");

        // 临时禁用外键约束，防止清理表数据时因为表之间的关联关系报错
        await db.query("SET FOREIGN_KEY_CHECKS = 0");

        // 获取所有的模型名
        const modelNames = Object.keys(models);

        for (const modelName of modelNames) {
            const Model = models[modelName];
            // 确保这是一个有效的 Sequelize 模型对象
            if (Model && typeof Model.destroy === "function") {
                console.log(`🧹 正在清空表数据: ${Model.tableName || modelName}...`);
                // 使用 truncate 快速清空表
                await Model.destroy({ where: {}, truncate: true });
            }
        }

        // 数据清理完成，恢复外键约束检查
        await db.query("SET FOREIGN_KEY_CHECKS = 1");

        console.log("✅ 所有业务数据已被成功清空！表结构未被破坏。");

        console.log("------------------------------------------------");
        console.log("🔄 准备初始化默认管理员账号...");

        const count = await Admin.count();
        if (count > 0) {
            console.log("⚠️ 数据库中已有管理员记录，跳过初始化。");
        } else {
            await Admin.create({
                username: "admin",
                password: "admin123"
            });
            console.log("✅ 默认管理员初始化成功！");
            console.log("👉 账号: admin");
            console.log("👉 密码: admin123");
            console.log("⚠️ 请登录后台并尽快修改默认账号密码！");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ 操作失败:", error);
        process.exit(1);
    }
}

resetAndInit();
