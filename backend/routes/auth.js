const express = require("express")

const router = express.Router()
const axios = require("axios")
const jwt = require("jsonwebtoken")
const { User, Admin, Config } = require("../models")
const { applyInviteCode } = require("../services/inviteService")

function getFullAvatarUrl(url) {
  if (url && url.startsWith('/uploads')) {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}${url}`;
  }
  return url;
}

// 用户注册
router.post("/register", async (req, res) => {
  try {
    const { nickName, email, password, inviteCode } = req.body
    let inviteResult = null

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ success: false, message: "邮箱已被注册" })
    }

    // 获取初始积分设置
    let initialPoints = 0
    try {
      const config = await Config.findOne({ where: { key: "initialPoints" } })
      if (config) {
        initialPoints = Number.parseInt(config.value) || 0
      }
    } catch (error) {
      console.error("获取初始积分设置失败:", error)
    }

    // 创建用户
    const user = await User.create({
      nick_name: nickName,
      email,
      password,
      points: initialPoints
    })

    if (inviteCode) {
      inviteResult = await applyInviteCode(user, inviteCode)
    }

    // 生成 JWT token
    const newToken = jwt.sign(
      { id: user.id, email: user.email, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.json({
      success: true,
      message: "注册成功",
      data: {
        token: newToken,
        user: {
          id: user.id,
          email: user.email,
          nickName: user.nick_name,
          avatarUrl: getFullAvatarUrl(user.avatar_url),
          points: user.points,
          inviteCode: user.invite_code
        },
        inviteResult
      }
    })
  } catch (error) {
    console.error("注册失败:", error)
    res.status(500).json({ success: false, message: "注册失败，请稍后重试" })
  }
})

// 用户登录
router.post("/login", async (req, res) => {
  try {
    const { email, password, inviteCode } = req.body
    let inviteResult = null

    // 查找用户
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({ success: false, message: "邮箱或密码错误" })
    }

    // 验证密码
    if (!user.validatePassword(password)) {
      return res.status(401).json({ success: false, message: "邮箱或密码错误" })
    }

    if (inviteCode) {
      inviteResult = await applyInviteCode(user, inviteCode)
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.json({
      success: true,
      message: "登录成功",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          nickName: user.nick_name,
          avatarUrl: getFullAvatarUrl(user.avatar_url),
          points: user.points
        },
        inviteResult
      }
    })
  } catch (error) {
    console.error("登录失败:", error)
    res.status(500).json({ success: false, message: "登录失败，请稍后重试" })
  }
})

// 微信登录
router.post("/wechat", async (req, res) => {
  try {
    const { code, userInfo, inviteCode } = req.body
    let inviteResult = null

    if (!code) {
      return res.status(400).json({ success: false, message: "缺少微信登录凭证" })
    }

    // 调用微信接口获取openid
    const appId = process.env.WECHAT_APPID
    const appSecret = process.env.WECHAT_APPSECRET
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`

    console.log('微信登录请求URL:', url)
    console.log('微信登录请求code:', code)

    let openid, session_key, isNew = false

    try {
      const response = await axios.get(url)
      console.log('微信API响应:', response.data)

      const { openid: wxOpenid, session_key: wxSessionKey, errcode, errmsg } = response.data
      openid = wxOpenid
      session_key = wxSessionKey

      if (errcode) {
        console.error('微信API错误:', errcode, errmsg)
        return res.status(400).json({ success: false, message: `微信登录失败: ${errmsg}` })
      }

      if (!openid) {
        console.error('微信API未返回openid:', response.data)
        return res.status(400).json({ success: false, message: "微信登录失败" })
      }
    } catch (error) {
      console.error('微信API调用失败:', error)
      return res.status(400).json({ success: false, message: "微信登录失败" })
    }

    // 检查是否有已登录的用户（通过token）
    let user = null
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (token) {
      try {
        // 验证token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // 查找当前登录的用户
        user = await User.findByPk(decoded.id)
        console.log('当前已登录用户:', user ? user.id : '无')
      } catch (error) {
        console.error('验证token失败:', error)
        // token无效，继续处理
      }
    }

    // 如果有已登录的用户，将微信openid绑定到该用户
    if (user) {
      // 检查该openid是否已被其他用户绑定
      const existingUserWithOpenid = await User.findOne({ where: { wechat_openid: openid } })
      if (existingUserWithOpenid && existingUserWithOpenid.id !== user.id) {
        return res.status(400).json({ success: false, message: "该微信账号已被其他用户绑定" })
      }

      // 绑定微信openid到当前用户
      await user.update({
        wechat_openid: openid,
        nick_name: userInfo?.nickName || user.nick_name,
        avatar_url: userInfo?.avatarUrl || user.avatar_url
      })

      console.log('微信账号绑定成功，用户ID:', user.id)
    } else {
      // 查找或创建用户
      let existingUser = await User.findOne({ where: { wechat_openid: openid } })

      if (!existingUser) {
        isNew = true
        // 获取初始积分设置
        let initialPoints = 0
        try {
          const config = await Config.findOne({ where: { key: "initialPoints" } })
          if (config) {
            initialPoints = Number.parseInt(config.value) || 0
          }
        } catch (error) {
          console.error("获取初始积分设置失败:", error)
        }

        // 创建新用户
        existingUser = await User.create({
          wechat_openid: openid,
          nick_name: userInfo?.nickName || "微信用户",
          avatar_url: userInfo?.avatarUrl || "",
          points: initialPoints
        })

        if (inviteCode) {
          inviteResult = await applyInviteCode(existingUser, inviteCode)
        }
      } else {
        // 更新用户信息
        if (userInfo) {
          await existingUser.update({
            nick_name: userInfo.nickName || existingUser.nick_name,
            avatar_url: userInfo.avatarUrl || existingUser.avatar_url
          })
        }

        if (inviteCode) {
          inviteResult = await applyInviteCode(existingUser, inviteCode)
        }
      }

      user = existingUser
    }

    // 生成 JWT token
    const newToken = jwt.sign(
      { id: user.id, email: user.email, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.json({
      success: true,
      message: user.wechat_openid ? "微信登录成功" : "微信绑定成功",
      data: {
        token: newToken,
        isNew,
        user: {
          id: user.id,
          email: user.email,
          nickName: user.nick_name,
          avatarUrl: getFullAvatarUrl(user.avatar_url),
          points: user.points,
          inviteCode: user.invite_code,
          openid: user.wechat_openid
        },
        inviteResult
      }
    })
  } catch (error) {
    console.error("微信登录失败:", error)
    res.status(500).json({ success: false, message: "微信登录失败，请稍后重试" })
  }
})

module.exports = router
