const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });

const sequelize = require("./config/database");
const Notice = require("./models/Notice");

async function syncNoticeTable() {
    try {
        console.log("Connecting to database...");
        await sequelize.authenticate();
        console.log("Database connected successfully.");

        console.log("Syncing Notice table...");
        // 强制创建/更新 notices 表
        await Notice.sync({ alter: true });
        console.log("Notice table synced successfully.");

    } catch (error) {
        console.error("Failed to sync Notice table:", error);
    } finally {
        await sequelize.close();
        console.log("Database connection closed.");
    }
}

syncNoticeTable();
