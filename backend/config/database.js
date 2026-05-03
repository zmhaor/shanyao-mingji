const { Sequelize } = require("sequelize")

// 创建数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME || "123",
  process.env.DB_USER || "123",
  process.env.DB_PASSWORD || "123",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
)

module.exports = sequelize
