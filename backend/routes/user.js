const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const router = express.Router()
const { auth, getAdminInfo } = require("../middlewares/auth")
const { User, Favorite, History, Config } = require("../models")
const { INVITE_VALID_DAYS, applyInviteCode } = require("../services/inviteService")

function getFullAvatarUrl(url) {
  if (url && url.startsWith('/uploads')) {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}${url}`;
  }
  return url;
}

// 配置头像上传存储
const avatarUploadDir = path.join(__dirname, '..', 'uploads', 'avatars')
if (!fs.existsSync(avatarUploadDir)) {
  fs.mkdirSync(avatarUploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg'
    cb(null, `${req.user.id}_${Date.now()}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 最大 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext) || file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('只允许上传图片文件'))
    }
  }
})

// 获取用户信息的通用函数
async function getUserInfo(req, res) {
  try {
    const { id, role, username } = req.user

    // 如果是管理员，直接返回管理员信息
    if (role === "admin") {
      return res.json({
        success: true,
        data: {
          id,
          username,
          roles: [role],
          permissions: ["admin"]
        }
      })
    }

    // 查找用户
    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ success: false, message: "用户不存在" })
    }

    // 获取用户统计信息
    const [favoritesCount, historyCount] = await Promise.all([
      Favorite.count({ where: { user_id: id } }),
      History.count({ where: { user_id: id } })
    ])

    res.json({
      success: true,
      message: "获取用户信息成功",
      data: {
        id: user.id,
        nickName: user.nick_name,
        email: user.email,
        avatarUrl: getFullAvatarUrl(user.avatar_url),
        points: user.points,
        inviteCode: user.invite_code,
        inviteCount: user.invite_count,
        inviteCodeSubmitted: user.invite_code_submitted,
        inviteEligibleDays: INVITE_VALID_DAYS,
        openid: user.wechat_openid,
        stats: {
          favorites: favoritesCount,
          history: historyCount
        },
        createdAt: new Date(user.create_time).toISOString()
      }
    })
  } catch (error) {
    console.error("获取用户信息失败:", error)
    res.status(500).json({ success: false, message: "获取用户信息失败" })
  }
}

// 获取用户信息
router.get("/info", auth, async (req, res) => {
  await getUserInfo(req, res)
})

// 获取当前用户信息 (RESTful风格)
router.get("/me", auth, async (req, res) => {
  await getUserInfo(req, res)
})

// 更新用户资料
router.put("/profile", auth, async (req, res) => {
  try {
    const { id } = req.user
    const { nickName, email } = req.body

    // 查找用户
    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ success: false, message: "用户不存在" })
    }

    // 更新用户信息
    const updateData = {}
    if (nickName) updateData.nick_name = nickName
    if (email) updateData.email = email

    await user.update(updateData)

    res.json({
      success: true,
      message: "更新资料成功",
      data: {
        id: user.id,
        email: user.email,
        nickName: user.nick_name,
        avatarUrl: getFullAvatarUrl(user.avatar_url),
        points: user.points
      }
    })
  } catch (error) {
    console.error("更新用户资料失败:", error)
    res.status(500).json({ success: false, message: "更新用户资料失败" })
  }
})

const crypto = require('crypto')

// 使用内存缓存记录用户今日上传次数，结构：{ 'userId_dateString': count }
const avatarUploadStats = {}

// 上传用户头像
router.post("/avatar", auth, upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.user

    // 1. 每日次数限制防护机制 (每天最多 5 次)
    const todayStr = new Date().toISOString().split('T')[0]
    const userStatKey = `${id}_${todayStr}`

    if (avatarUploadStats[userStatKey] && avatarUploadStats[userStatKey] >= 5) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path) // 删除被 multer 自动接收到硬盘的本次请求文件
      }
      return res.status(429).json({ success: false, message: "今天修改头像的次数已达上限，请明天再试" })
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "请选择头像文件" })
    }

    const user = await User.findByPk(id)
    if (!user) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
      }
      return res.status(404).json({ success: false, message: "用户不存在" })
    }

    // 2. MD5 校验机制：防止同名/同内容图片重复上传占用空间
    let isSameAsBefore = false
    let newAvatarUrl = user.avatar_url

    // 计算本次新长传的图片的 MD5
    const newFileBuffer = fs.readFileSync(req.file.path)
    const newFileHash = crypto.createHash('md5').update(newFileBuffer).digest('hex')

    // 如果用户之前已经有在服务器的头像，对比旧文件的 MD5
    if (user.avatar_url && user.avatar_url.includes('/uploads/avatars/')) {
      const oldFilename = path.basename(user.avatar_url)
      const oldPath = path.join(avatarUploadDir, oldFilename)

      if (fs.existsSync(oldPath)) {
        const oldFileBuffer = fs.readFileSync(oldPath)
        const oldFileHash = crypto.createHash('md5').update(oldFileBuffer).digest('hex')

        // 如果两张图片一模一样，放弃本次的保存更新
        if (newFileHash === oldFileHash) {
          isSameAsBefore = true
        }
      }
    }

    if (isSameAsBefore) {
      // 一定要删除本次 multer 刚收进来的冗余图片
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
      }
    } else {
      // 确实是全新的图片
      // 如果有旧的且不一样，那就可以把旧的彻底移除了
      if (user.avatar_url && user.avatar_url.includes('/uploads/avatars/')) {
        const oldFilename = path.basename(user.avatar_url)
        const oldPath = path.join(avatarUploadDir, oldFilename)
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath)
        }
      }

      // 生成可公网访问的 URL 并入库
      newAvatarUrl = `/uploads/avatars/${req.file.filename}`
      await user.update({ avatar_url: newAvatarUrl })

      // 只有真正发生了更换才扣除当天的可用次数
      avatarUploadStats[userStatKey] = (avatarUploadStats[userStatKey] || 0) + 1
    }

    res.json({
      success: true,
      message: isSameAsBefore ? "头像未做更改" : "头像上传成功",
      data: {
        avatarUrl: getFullAvatarUrl(newAvatarUrl)
      }
    })
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    console.error("上传头像失败:", error)
    res.status(500).json({ success: false, message: "上传头像失败" })
  }
})

// 更新密码
router.put("/password", auth, async (req, res) => {
  try {
    const { id } = req.user
    const { password } = req.body

    // 验证密码长度
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "密码长度至少为6位" })
    }

    // 查找用户
    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ success: false, message: "用户不存在" })
    }

    // 更新密码
    user.password = password
    await user.save()

    res.json({ success: true, message: "密码更新成功" })
  } catch (error) {
    console.error("更新密码失败:", error)
    res.status(500).json({ success: false, message: "更新密码失败" })
  }
})

// 获取邀请奖励积分设置
router.get("/invite-reward", async (req, res) => {
  try {
    let inviteRewardPoints = 50
    let invitedUserRewardPoints = 100
    try {
      // 从数据库中获取邀请奖励积分设置
      const inviteRewardConfig = await Config.findOne({ where: { key: "inviteRewardPoints" } })
      if (inviteRewardConfig) {
        inviteRewardPoints = Number.parseInt(inviteRewardConfig.value) || 50
      }

      const invitedUserRewardConfig = await Config.findOne({ where: { key: "invitedUserRewardPoints" } })
      if (invitedUserRewardConfig) {
        invitedUserRewardPoints = Number.parseInt(invitedUserRewardConfig.value) || 100
      }

      console.log("邀请人积分设置:", inviteRewardPoints)
      console.log("被邀请人积分设置:", invitedUserRewardPoints)
    } catch (error) {
      console.error("获取邀请奖励积分设置失败:", error)
    }

    console.log("返回邀请奖励积分设置:", { inviteRewardPoints, invitedUserRewardPoints })
    res.json({
      success: true,
      data: {
        inviteRewardPoints,
        invitedUserRewardPoints
      }
    })
  } catch (error) {
    console.error("获取邀请奖励积分设置失败:", error)
    res.json({
      success: true,
      data: {
        inviteRewardPoints: 50,
        invitedUserRewardPoints: 100
      }
    })
  }
})

// 提交邀请码
router.post("/submit-invite-code", auth, async (req, res) => {
  try {
    const { inviteCode } = req.body
    const { id } = req.user

    // 检查邀请码是否为空
    if (!inviteCode) {
      return res.status(400).json({ success: false, message: "邀请码不能为空" })
    }

    // 查找用户
    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ success: false, message: "用户不存在" })
    }

    const inviteResult = await applyInviteCode(user, inviteCode)
    if (!inviteResult.success) {
      return res.status(400).json(inviteResult)
    }

    res.json({
      success: true,
      message: inviteResult.message,
      data: inviteResult.data
    })
  } catch (error) {
    console.error("提交邀请码失败:", error)
    res.status(500).json({ success: false, message: "提交邀请码失败" })
  }
})

module.exports = router
