const cors = require("cors")
const dotenv = require("dotenv")
const express = require("express")
const helmet = require("helmet")
const morgan = require("morgan")
const path = require("path")

dotenv.config()

const app = express()
const db = require("./config/database")

app.use(cors({
  origin: [process.env.ADMIN_BASE_URL || "http://localhost:3333", "http://localhost:3333"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(morgan("combined"))
app.use(express.json({ limit: "5mb" }))
app.use(express.urlencoded({ extended: true }))

app.use("/uploads", express.static(path.join(__dirname, "uploads")))

db.authenticate()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection failed:", err))

const shouldSyncDb = true
const shouldAlterDb = false

if (shouldSyncDb) {
  const syncOptions = shouldAlterDb ? { alter: true } : {}
  db.sync(syncOptions)
    .then(() => console.log(`Database sync completed. alter=${shouldAlterDb}`))
    .catch((err) => console.error("Database sync failed:", err))
} else {
  console.log("Database sync skipped.")
}

const adminRoutes = require("./routes/admin")
const authRoutes = require("./routes/auth")
const favoriteRoutes = require("./routes/favorite")
const historyRoutes = require("./routes/history")
const shopRoutes = require("./routes/shop")
const toolRoutes = require("./routes/tool")
const userRoutes = require("./routes/user")
const progressRoutes = require("./routes/progress")
const feedbackRoutes = require("./routes/feedback")
const noticeRoutes = require("./routes/notice")
const materialRoutes = require("./routes/material")
const contentRoutes = require("./routes/content")
const { Config } = require("./models")

function parseConfigValue(value) {
  if (typeof value !== "string") {
    return value
  }
  try {
    return JSON.parse(value)
  } catch (_error) {
    return value
  }
}

// 公开的审核模式状态接口
app.get("/api/config/audit_mode", async (_req, res) => {
  try {
    const config = await Config.findOne({ where: { key: 'audit_mode' } })
    res.json({ success: true, data: config ? config.value : 'false' })
  } catch (error) {
    console.error('获取审核模式失败:', error)
    res.json({ success: true, data: 'false' }) // 默认返回非审核模式
  }
})

app.get("/api/config/:key", async (req, res) => {
  try {
    const { key } = req.params
    const config = await Config.findOne({ where: { key } })
    res.json({
      success: true,
      data: config ? parseConfigValue(config.value) : null
    })
  } catch (error) {
    console.error("获取公开配置失败:", error)
    res.status(500).json({ success: false, message: "获取公开配置失败" })
  }
})

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/tools", toolRoutes)
app.use("/api/favorites", favoriteRoutes)
app.use("/api/history", historyRoutes)
app.use("/api/shop", shopRoutes)
app.use("/api/progress", progressRoutes)
app.use("/api/feedback", feedbackRoutes)
app.use("/api/notice", noticeRoutes)
app.use("/api/materials", materialRoutes)
app.use("/api/content", contentRoutes)
app.use("/api/admin", adminRoutes)

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "server is running" })
})

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "api not found" })
})

app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: "internal server error" })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`)
})
