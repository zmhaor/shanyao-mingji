const { Notice } = require("../models")

/**
 * 获取活动公告 (小程序端使用)
 */
exports.getActiveNotice = async (_req, res) => {
    try {
        const { type = "popup" } = _req.query
        const notices = await Notice.findAll({
            where: { isActive: true, type },
            order: [["create_time", "DESC"]]
        })
        res.json({ success: true, data: notices })
    } catch (error) {
        console.error("Get active notice error:", error)
        res.status(500).json({ success: false, message: "获取公告失败" })
    }
}

/**
 * 获取公告列表 (管理端使用)
 */
exports.adminList = async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query
        const { count, rows } = await Notice.findAndCountAll({
            order: [["create_time", "DESC"]],
            offset: (page - 1) * parseInt(pageSize),
            limit: parseInt(pageSize)
        })
        res.json({
            success: true,
            data: {
                list: rows,
                total: count,
                page: parseInt(page),
                pageSize: parseInt(pageSize)
            }
        })
    } catch (error) {
        console.error("Admin list notices error:", error)
        res.status(500).json({ success: false, message: "获取公告列表失败" })
    }
}

/**
 * 创建新公告
 */
exports.adminCreate = async (req, res) => {
    try {
        const { title, content, type, isActive } = req.body
        const notice = await Notice.create({ title, content, type, isActive })
        res.json({ success: true, data: notice })
    } catch (error) {
        console.error("Admin create notice error:", error)
        res.status(500).json({ success: false, message: "创建公告失败" })
    }
}

/**
 * 修改公告
 */
exports.adminUpdate = async (req, res) => {
    try {
        const { id } = req.params
        const { title, content, type, isActive } = req.body
        const notice = await Notice.findByPk(id)
        if (!notice) {
            return res.status(404).json({ success: false, message: "公告不存在" })
        }
        await notice.update({ title, content, type, isActive })
        res.json({ success: true, data: notice })
    } catch (error) {
        console.error("Admin update notice error:", error)
        res.status(500).json({ success: false, message: "更新公告失败" })
    }
}

/**
 * 删除公告
 */
exports.adminDelete = async (req, res) => {
    try {
        const { id } = req.params
        const notice = await Notice.findByPk(id)
        if (!notice) {
            return res.status(404).json({ success: false, message: "公告不存在" })
        }
        await notice.destroy()
        res.json({ success: true, message: "删除成功" })
    } catch (error) {
        console.error("Admin delete notice error:", error)
        res.status(500).json({ success: false, message: "删除公告失败" })
    }
}

/**
 * 确认公告 (小程序端点击“我知道了”)
 */
exports.confirmNotice = async (req, res) => {
    try {
        const { id } = req.params
        const notice = await Notice.findByPk(id)
        if (!notice) {
            return res.status(404).json({ success: false, message: "公告不存在" })
        }
        // 原子自增
        await notice.increment("confirmed_count")
        res.json({ success: true, message: "确认成功" })
    } catch (error) {
        console.error("Confirm notice error:", error)
        res.status(500).json({ success: false, message: "确认公告失败" })
    }
}
