const { Sequelize } = require("sequelize")
const dotenv = require("dotenv")
const path = require("path")

// 加载环境变量
dotenv.config({ path: path.join(__dirname, "../.env") })

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: console.log,
  }
)

async function cleanIndexes() {
  try {
    await sequelize.authenticate()
    console.log("数据库连接成功。开始检查 users 表的索引...")

    const [indexes] = await sequelize.query("SHOW INDEX FROM users")

    // 按列名分组索引
    const indexGroups = {}
    indexes.forEach((idx) => {
      const colName = idx.Column_name
      if (!indexGroups[colName]) {
        indexGroups[colName] = new Set()
      }
      indexGroups[colName].add(idx.Key_name)
    })

    // 将 Set 转换回数组
    for (const col in indexGroups) {
      indexGroups[col] = Array.from(indexGroups[col])
    }

    console.log("找到的索引列表:", indexGroups)

    // 需要清理的列
    const columnsToCheck = ["email", "wechat_openid", "invite_code"]

    for (const col of columnsToCheck) {
      if (indexGroups[col] && indexGroups[col].length > 1) {
        console.log(`\n发现 [${col}] 列有 ${indexGroups[col].length} 个索引，开始清理...`)
        // 排序，保留最短或最原始的索引名称，其他删掉
        const sortedKeys = indexGroups[col].sort((a, b) => a.length - b.length || a.localeCompare(b))
        // 第一个是保留的
        const keepKey = sortedKeys[0]
        const dropKeys = sortedKeys.slice(1)

        console.log(`保留的索引: ${keepKey}`)
        for (const dropKey of dropKeys) {
          if (dropKey === "PRIMARY" || dropKey === "id") continue; // 别误删主键
          console.log(`删除多余索引: ${dropKey}`)
          await sequelize.query(`ALTER TABLE users DROP INDEX \`${dropKey}\``)
        }
      } else {
        console.log(`\n[${col}] 列索引正常，数量: ${indexGroups[col] ? indexGroups[col].length : 0}`)
      }
    }

    console.log("\n索引清理完成！")
  } catch (err) {
    console.error("执行出错:", err)
  } finally {
    await sequelize.close()
  }
}

cleanIndexes()
