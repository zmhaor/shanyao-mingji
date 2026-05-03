// backend/routes/feedback.js
const express = require("express")
const router = express.Router()
const { Op } = require("sequelize")
const { auth } = require("../middlewares/auth")
const { Feedback, User, FeedbackLike, FeedbackReply, Admin } = require("../models")

// 提交反馈
router.post("/submit", auth, async (req, res) => {
    try {
        const { content, contact, is_anonymous } = req.body

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: "反馈内容不能为空" })
        }

        const feedback = await Feedback.create({
            user_id: req.user.id,
            content,
            contact: contact || "",
            is_anonymous: is_anonymous || false
        })

        res.json({
            success: true,
            message: "提交成功",
            data: feedback
        })
    } catch (error) {
        console.error("提交反馈失败:", error)
        res.status(500).json({ success: false, message: "提交反馈失败" })
    }
})

// 获取反馈列表
router.get("/list", auth, async (req, res) => {
    try {
        const { page = 1, pageSize = 10, sort = 'new', filter = 'all' } = req.query

        const where = {}
        if (filter === 'mine') {
            where.user_id = req.user.id
        }

        const offset = (Number.parseInt(page) - 1) * Number.parseInt(pageSize)

        let order = [["create_time", "DESC"]]
        if (sort === 'hot') {
            order = [
                ["likes", "DESC"],
                ["create_time", "DESC"]
            ]
        }

        const [feedbacks, total] = await Promise.all([
            Feedback.findAll({
                where,
                limit: Number.parseInt(pageSize),
                offset,
                order
            }),
            Feedback.count({ where })
        ])

        const listWithUser = await Promise.all(
            feedbacks.map(async (f) => {
                const user = await User.findByPk(f.user_id)
                const isLiked = await FeedbackLike.findOne({
                    where: { feedback_id: f.id, user_id: req.user.id }
                })
                const lastReply = await FeedbackReply.findOne({
                    where: { feedback_id: f.id },
                    order: [["create_time", "DESC"]]
                })
                const unreadReplyCount = f.user_id === req.user.id
                    ? await FeedbackReply.count({
                        where: {
                            feedback_id: f.id,
                            owner_read: false,
                            [Op.or]: [
                                { admin_id: { [Op.ne]: null } },
                                {
                                    user_id: {
                                        [Op.and]: [
                                            { [Op.ne]: null },
                                            { [Op.ne]: req.user.id }
                                        ]
                                    }
                                }
                            ]
                        }
                    })
                    : 0

                let userInfo = null;
                if (f.is_anonymous) {
                    userInfo = { nick_name: '匿名用户', avatar_url: '/images/默认.jpg' }
                } else if (user) {
                    let avatar = user.avatar_url;
                    if (!avatar) avatar = '/images/默认.jpg';
                    else if (avatar.startsWith('/uploads')) {
                      const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
                      avatar = baseUrl + avatar;
                    }
                    userInfo = { nick_name: user.nick_name || '微信用户', avatar_url: avatar }
                }

                return {
                    ...f.toJSON(),
                    is_liked: !!isLiked,
                    unread_reply_count: unreadReplyCount,
                    last_reply: lastReply ? lastReply.content : null,
                    user: userInfo
                }
            })
        )

        res.json({
            success: true,
            message: "获取列表成功",
            data: {
                list: listWithUser,
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

router.get("/unread-count", auth, async (req, res) => {
    try {
        const myFeedbacks = await Feedback.findAll({
            where: { user_id: req.user.id },
            attributes: ["id"]
        })

        const feedbackIds = myFeedbacks.map(item => item.id)
        if (feedbackIds.length === 0) {
            return res.json({
                success: true,
                data: {
                    unreadCount: 0
                }
            })
        }

        const unreadCount = await FeedbackReply.count({
            where: {
                feedback_id: { [Op.in]: feedbackIds },
                owner_read: false,
                [Op.or]: [
                    { admin_id: { [Op.ne]: null } },
                    {
                        user_id: {
                            [Op.and]: [
                                { [Op.ne]: null },
                                { [Op.ne]: req.user.id }
                            ]
                        }
                    }
                ]
            }
        })

        res.json({
            success: true,
            data: {
                unreadCount
            }
        })
    } catch (error) {
        console.error("获取反馈未读数失败:", error)
        res.status(500).json({ success: false, message: "获取反馈未读数失败" })
    }
})

// 获取详情及回复
router.get("/detail/:id", auth, async (req, res) => {
    try {
        const { id } = req.params
        const feedback = await Feedback.findByPk(id)
        if (!feedback) {
            return res.status(404).json({ success: false, message: "反馈不存在" })
        }

        if (feedback.user_id === req.user.id) {
            await FeedbackReply.update(
                { owner_read: true },
                {
                    where: {
                        feedback_id: id,
                        owner_read: false,
                        [Op.or]: [
                            { admin_id: { [Op.ne]: null } },
                            {
                                user_id: {
                                    [Op.and]: [
                                        { [Op.ne]: null },
                                        { [Op.ne]: req.user.id }
                                    ]
                                }
                            }
                        ]
                    }
                }
            )
        }

        const user = await User.findByPk(feedback.user_id)
        const isLiked = await FeedbackLike.findOne({
            where: { feedback_id: id, user_id: req.user.id }
        })

        let mainUserInfo = null;
        if (feedback.is_anonymous) {
            mainUserInfo = { nick_name: '匿名用户', avatar_url: '/images/默认.jpg' }
        } else if (user) {
            let avatar = user.avatar_url;
            if (!avatar) avatar = '/images/默认.jpg';
            else if (avatar.startsWith('/uploads')) {
              const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
              avatar = baseUrl + avatar;
            }
            mainUserInfo = { nick_name: user.nick_name || '微信用户', avatar_url: avatar }
        }

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
                if (r.is_anonymous) {
                    replier = { nick_name: '匿名用户', avatar_url: '/images/默认.jpg', is_admin: false }
                } else {
                    const u = await User.findByPk(r.user_id)
                    let avatar = u ? u.avatar_url : '';
                    if (!avatar) avatar = '/images/默认.jpg';
                    else if (avatar.startsWith('/uploads')) {
                      const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
                      avatar = baseUrl + avatar;
                    }
                    replier = { nick_name: u ? (u.nick_name || '微信用户') : '未知', avatar_url: avatar, is_admin: false }
                }
            }
            return {
                ...r.toJSON(),
                replier
            }
        }))

        res.json({
            success: true,
            data: {
                ...feedback.toJSON(),
                is_liked: !!isLiked,
                user: mainUserInfo,
                replies: repliesWithUser
            }
        })
    } catch (error) {
        console.error("获取反馈详情失败:", error)
        res.status(500).json({ success: false, message: "获取详情失败" })
    }
})

// 点赞/取消点赞
router.post("/like", auth, async (req, res) => {
    try {
        const { feedback_id } = req.body
        const user_id = req.user.id

        const feedback = await Feedback.findByPk(feedback_id)
        if (!feedback) {
            return res.status(404).json({ success: false, message: "反馈不存在" })
        }

        const existingLike = await FeedbackLike.findOne({
            where: { feedback_id, user_id }
        })

        if (existingLike) {
            // 取消点赞
            await existingLike.destroy()
            await feedback.decrement('likes')
            res.json({ success: true, message: "已取消点赞", data: { is_liked: false } })
        } else {
            // 点赞
            await FeedbackLike.create({ feedback_id, user_id })
            await feedback.increment('likes')
            res.json({ success: true, message: "点赞成功", data: { is_liked: true } })
        }
    } catch (error) {
        console.error("操作点赞失败:", error)
        res.status(500).json({ success: false, message: "操作失败" })
    }
})

// 用户回复
router.post("/reply", auth, async (req, res) => {
    try {
        const { feedback_id, content, is_anonymous } = req.body
        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: "回复内容不能为空" })
        }

        const feedback = await Feedback.findByPk(feedback_id)
        if (!feedback) {
            return res.status(404).json({ success: false, message: "反馈不存在" })
        }

        const reply = await FeedbackReply.create({
            feedback_id,
            user_id: req.user.id,
            content,
            is_anonymous: is_anonymous || false,
            owner_read: feedback.user_id === req.user.id
        })

        res.json({ success: true, message: "回复成功", data: reply })
    } catch (error) {
        console.error("回复失败:", error)
        res.status(500).json({ success: false, message: "回复失败" })
    }
})

// 删除回复
router.delete("/reply/:replyId", auth, async (req, res) => {
    try {
        const { replyId } = req.params

        const reply = await FeedbackReply.findByPk(replyId)
        if (!reply) {
            return res.status(404).json({ success: false, message: "回复不存在" })
        }

        // 检查权限：只能删除自己的回复
        if (reply.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: "无权删除此回复" })
        }

        // 管理员回复不能删除
        if (reply.admin_id) {
            return res.status(403).json({ success: false, message: "无权删除管理员回复" })
        }

        await reply.destroy()

        res.json({ success: true, message: "删除成功" })
    } catch (error) {
        console.error("删除回复失败:", error)
        res.status(500).json({ success: false, message: "删除失败" })
    }
})

// 删除反馈
router.delete("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params

        const feedback = await Feedback.findByPk(id)
        if (!feedback) {
            return res.status(404).json({ success: false, message: "反馈不存在" })
        }

        // 检查权限：只能删除自己的反馈
        if (feedback.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: "无权删除此反馈" })
        }

        // 删除关联的回复和点赞 (如果外键没有自动级联的话)
        await FeedbackReply.destroy({ where: { feedback_id: id } })
        await FeedbackLike.destroy({ where: { feedback_id: id } })

        // 删除反馈本身
        await feedback.destroy()

        res.json({ success: true, message: "删除成功" })
    } catch (error) {
        console.error("删除反馈失败:", error)
        res.status(500).json({ success: false, message: "删除失败" })
    }
})

module.exports = router
