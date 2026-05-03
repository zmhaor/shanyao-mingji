// backend/routes/admin/feedback.js
const express = require("express")
const router = express.Router()
const { adminAuth } = require("../../middlewares/auth")
const { Feedback, User, FeedbackReply, Admin } = require("../../models")

// 获取反馈列表
router.get("/list", adminAuth, async (req, res) => {
    try {
        const { page = 1, pageSize = 10, status } = req.query

        const where = {}
        if (status) {
            where.status = status
        }

        const offset = (Number.parseInt(page) - 1) * Number.parseInt(pageSize)

        const [feedbacks, total] = await Promise.all([
            Feedback.findAll({
                where,
                limit: Number.parseInt(pageSize),
                offset,
                order: [["create_time", "DESC"]]
            }),
            Feedback.count({ where })
        ])

        // 获取对应的用户信息和回复数等
        const feedbacksWithUser = await Promise.all(
            feedbacks.map(async (f) => {
                const user = await User.findByPk(f.user_id)
                // 获取回复数
                const replyCount = await FeedbackReply.count({ where: { feedback_id: f.id } })

                let avatar = user ? user.avatar_url : '';
                if (!avatar) avatar = '/images/默认.jpg';
                else if (avatar.startsWith('/uploads')) {
                  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
                  avatar = baseUrl + avatar;
                }

                let nickName = user ? (user.nick_name || "微信用户") : "未知用户";
                if (f.is_anonymous) nickName += " (匿名)";

                return {
                    ...f.toJSON(),
                    createTime: f.create_time,
                    nickName,
                    avatarUrl: avatar,
                    replyCount,
                    user_id: f.user_id
                }
            })
        )

        res.json({
            success: true,
            message: "获取列表成功",
            data: {
                list: feedbacksWithUser,
                total,
                page: Number.parseInt(page),
                pageSize: Number.parseInt(pageSize)
            }
        })

    } catch (error) {
        console.error("获取反馈列表失败:", error)
        res.status(500).json({ success: false, message: "获取反馈列表失败" })
    }
})

// 更新反馈状态
router.put("/status/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const feedback = await Feedback.findByPk(id)
        if (!feedback) {
            return res.status(404).json({ success: false, message: "反馈不存在" })
        }

        await feedback.update({ status })

        res.json({ success: true, message: "状态更新成功" })
    } catch (error) {
        console.error("更新状态失败:", error)
        res.status(500).json({ success: false, message: "更新状态失败" })
    }
})

// 获取单条详情
router.get("/detail/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params
        const feedback = await Feedback.findByPk(id)
        if (!feedback) {
            return res.status(404).json({ success: false, message: "反馈不存在" })
        }

        const user = await User.findByPk(feedback.user_id)
        const replies = await FeedbackReply.findAll({
            where: { feedback_id: id },
            order: [["create_time", "ASC"]]
        })

        const repliesWithUser = await Promise.all(replies.map(async r => {
            let replier = null;
            if (r.admin_id) {
                const admin = await Admin.findByPk(r.admin_id)
                replier = { nick_name: '管理员', avatar_url: '/images/默认.jpg', is_admin: true }
            } else if (r.user_id) {
                const u = await User.findByPk(r.user_id)
                let avatar = u ? u.avatar_url : '';
                if (!avatar) avatar = '/images/默认.jpg';
                else if (avatar.startsWith('/uploads')) {
                  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
                  avatar = baseUrl + avatar;
                }

                let nickName = u ? (u.nick_name || "微信用户") : "未知用户";
                if (r.is_anonymous) nickName += " (匿名)";

                replier = { nick_name: nickName, avatar_url: avatar, is_admin: false, user_id: r.user_id }
            }
            return {
                ...r.toJSON(),
                replier
            }
        }))

        let fbAvatar = user ? user.avatar_url : '';
        if (!fbAvatar) fbAvatar = '/images/默认.jpg';
        else if (fbAvatar.startsWith('/uploads')) {
          const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
          fbAvatar = baseUrl + fbAvatar;
        }

        let fbNickName = user ? (user.nick_name || "微信用户") : "未知用户";
        if (feedback.is_anonymous) fbNickName += " (匿名)";

        res.json({
            success: true,
            data: {
                ...feedback.toJSON(),
                user: {
                    nick_name: fbNickName,
                    avatar_url: fbAvatar,
                    user_id: feedback.user_id
                },
                replies: repliesWithUser
            }
        })
    } catch (error) {
        console.error("获取详情失败:", error)
        res.status(500).json({ success: false, message: "获取详情失败" })
    }
})

// 管理员回复
router.post("/reply", adminAuth, async (req, res) => {
    try {
        const { feedback_id, content } = req.body
        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: "回复内容不能为空" })
        }

        const feedback = await Feedback.findByPk(feedback_id)
        if (!feedback) {
            return res.status(404).json({ success: false, message: "反馈不存在" })
        }

        const reply = await FeedbackReply.create({
            feedback_id,
            admin_id: req.admin.id,
            content,
            owner_read: false
        })

        res.json({ success: true, message: "回复成功", data: reply })
    } catch (error) {
        console.error("回复失败:", error)
        res.status(500).json({ success: false, message: "回复失败" })
  }
})

// 删除反馈
router.delete("/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params

        const feedback = await Feedback.findByPk(id)
        if (!feedback) {
            return res.status(404).json({ success: false, message: "反馈不存在" })
        }

        await FeedbackReply.destroy({ where: { feedback_id: id } })
        await feedback.destroy()

        res.json({ success: true, message: "删除成功" })
    } catch (error) {
        console.error("删除反馈失败:", error)
        res.status(500).json({ success: false, message: "删除反馈失败" })
    }
})

module.exports = router
