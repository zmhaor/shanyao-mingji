const express = require("express")
const router = express.Router()
const { adminAuth } = require("../../middlewares/auth")
const { StudyProgress, User } = require("../../models")

const toolNameMap = {
    shanghan: "伤寒精读助手",
    fangji: "方剂查询",
    neijing: "内经选读"
}

// 获取所有用户的进度列表
router.get("/", adminAuth, async (req, res) => {
    try {
        const { page = 1, pageSize = 10, keyword } = req.query

        // 先查有进度数据的不重复用户 id
        const allProgress = await StudyProgress.findAll({
            attributes: ["user_id"],
            group: ["user_id"]
        })

        const userIds = allProgress.map(p => p.user_id)

        if (userIds.length === 0) {
            return res.json({
                success: true,
                data: {
                    list: [],
                    total: 0,
                    page: Number.parseInt(page),
                    pageSize: Number.parseInt(pageSize)
                }
            })
        }

        // 构建用户查询条件
        const { Op } = require("sequelize")
        const where = { id: { [Op.in]: userIds } }

        if (keyword) {
            where[Op.and] = [
                { id: { [Op.in]: userIds } },
                {
                    [Op.or]: [
                        { email: { [Op.like]: `%${keyword}%` } },
                        { nick_name: { [Op.like]: `%${keyword}%` } }
                    ]
                }
            ]
        }

        const offset = (page - 1) * pageSize

        const [users, total] = await Promise.all([
            User.findAll({
                where,
                limit: Number.parseInt(pageSize),
                offset: Number.parseInt(offset),
                order: [["create_time", "DESC"]]
            }),
            User.count({ where })
        ])

        // 获取每个用户的进度数据
        const usersWithProgress = await Promise.all(
            users.map(async (user) => {
                const progressList = await StudyProgress.findAll({
                    where: { user_id: user.id },
                    attributes: ["tool_name", "total_entries", "reviewed_count", "correct_count", "updated_at"]
                })

                const progressMap = {}
                progressList.forEach(p => {
                    progressMap[p.tool_name] = {
                        totalEntries: p.total_entries,
                        reviewedCount: p.reviewed_count,
                        correctCount: p.correct_count,
                        updatedAt: p.updated_at
                    }
                })

                return {
                    id: user.id,
                    email: user.email,
                    nick_name: user.nick_name,
                    avatar_url: user.avatar_url,
                    progress: progressMap
                }
            })
        )

        res.json({
            success: true,
            data: {
                list: usersWithProgress,
                total,
                page: Number.parseInt(page),
                pageSize: Number.parseInt(pageSize)
            }
        })
    } catch (error) {
        console.error("获取用户进度列表失败:", error)
        res.status(500).json({ success: false, message: "获取用户进度列表失败" })
    }
})

// 获取某用户的进度详情
router.get("/:userId", adminAuth, async (req, res) => {
    try {
        const { userId } = req.params

        const user = await User.findByPk(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: "用户不存在" })
        }

        const progressList = await StudyProgress.findAll({
            where: { user_id: userId }
        })

        const result = progressList.map(p => ({
            toolName: p.tool_name,
            toolLabel: toolNameMap[p.tool_name] || p.tool_name,
            totalEntries: p.total_entries,
            reviewedCount: p.reviewed_count,
            correctCount: p.correct_count,
            updatedAt: p.updated_at
        }))

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    nick_name: user.nick_name,
                    avatar_url: user.avatar_url
                },
                progress: result
            }
        })
    } catch (error) {
        console.error("获取用户进度详情失败:", error)
        res.status(500).json({ success: false, message: "获取用户进度详情失败" })
    }
})

module.exports = router
