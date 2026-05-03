const express = require("express")
const router = express.Router()
const { auth } = require("../middlewares/auth")
const { StudyProgress, SyncHistory, Tool } = require("../models")
const { mergeCustomGroups } = require("../shared/custom-groups")
const { Op } = require("sequelize")

// 每个用户每个工具最多保存的同步历史记录数
const MAX_SYNC_HISTORY = 3

// 上传/更新进度（支持选择性上传）
router.post("/upload", auth, async (req, res) => {
    try {
        const { id } = req.user
        const { toolName, historyData, hiddenMap, customGroups, formulaSongVersion, formulaSongVersions, dataTypes = [] } = req.body

        console.log(`[Progress Upload] User: ${id}, Tool: ${toolName}`, {
            dataTypes,
            hasHistory: !!historyData,
            hasHidden: !!hiddenMap,
            hasGroups: !!customGroups,
            formulaSongVersion,
            hasFormulaSongVersions: !!formulaSongVersions
        })

        // 验证参数
        if (!toolName || typeof toolName !== 'string' || toolName.trim() === '') {
            return res.status(400).json({ success: false, message: "无效的工具名称" })
        }

        if (!Array.isArray(dataTypes) || dataTypes.length === 0) {
            return res.status(400).json({ success: false, message: "请选择要同步的数据类型" })
        }

        const now = Date.now()

        // 获取现有记录
        let record = await StudyProgress.findOne({
            where: { user_id: id, tool_name: toolName }
        })

        // 准备更新数据
        const updateData = { updated_at: now }
        const createData = {
            user_id: id,
            tool_name: toolName,
            progress_data: '[]',
            total_entries: 0,
            reviewed_count: 0,
            correct_count: 0,
            updated_at: now
        }

        // 根据选择的数据类型处理
        if (dataTypes.includes('history') && Array.isArray(historyData)) {
            const progressDataStr = JSON.stringify(historyData)
            const totalEntries = historyData.length
            let reviewedCount = 0
            let correctCount = 0

            historyData.forEach(h => {
                if (Array.isArray(h) && h.length > 0) {
                    reviewedCount++
                    if (h[h.length - 1] === true) {
                        correctCount++
                    }
                }
            })

            updateData.progress_data = progressDataStr
            updateData.total_entries = totalEntries
            updateData.reviewed_count = reviewedCount
            updateData.correct_count = correctCount

            createData.progress_data = progressDataStr
            createData.total_entries = totalEntries
            createData.reviewed_count = reviewedCount
            createData.correct_count = correctCount
        }

        if (dataTypes.includes('groups') && Array.isArray(customGroups)) {
            let existingCustomGroups = []
            if (record && record.custom_groups) {
                try {
                    const parsedGroups = JSON.parse(record.custom_groups)
                    existingCustomGroups = Array.isArray(parsedGroups) ? parsedGroups : []
                } catch (error) {
                    existingCustomGroups = []
                }
            }

            const nextCustomGroups = mergeCustomGroups(customGroups, existingCustomGroups)
            const customGroupsStr = JSON.stringify(nextCustomGroups)
            updateData.custom_groups = customGroupsStr
            createData.custom_groups = customGroupsStr
        }

        if (dataTypes.includes('hiddenMap') && hiddenMap) {
            const hiddenMapStr = JSON.stringify(hiddenMap)
            updateData.hidden_map = hiddenMapStr
            createData.hidden_map = hiddenMapStr
        }

        if (dataTypes.includes('formulaVersion')) {
            // 支持新的按方剂记录版本格式
            if (formulaSongVersions && typeof formulaSongVersions === 'object') {
                const versionsStr = JSON.stringify(formulaSongVersions)
                updateData.formula_song_versions = versionsStr
                createData.formula_song_versions = versionsStr
            }
            // 兼容旧的全局版本格式
            if (formulaSongVersion && (formulaSongVersion === 'v1' || formulaSongVersion === 'v2')) {
                updateData.formula_song_version = formulaSongVersion
                createData.formula_song_version = formulaSongVersion
            }
        }

        // 更新或创建记录
        let created = false
        if (record) {
            await record.update(updateData)
        } else {
            record = await StudyProgress.create(createData)
            created = true
        }

        // 保存同步历史记录
        const syncHistoryData = {
            user_id: id,
            tool_name: toolName,
            sync_type: 'upload',
            data_types: JSON.stringify(dataTypes),
            created_at: now
        }

        // 只保存被同步的数据类型
        if (dataTypes.includes('history') && Array.isArray(historyData)) {
            syncHistoryData.progress_data = JSON.stringify(historyData)
            syncHistoryData.total_entries = historyData.length
            let reviewedCount = 0
            let correctCount = 0
            historyData.forEach(h => {
                if (Array.isArray(h) && h.length > 0) {
                    reviewedCount++
                    if (h[h.length - 1] === true) correctCount++
                }
            })
            syncHistoryData.reviewed_count = reviewedCount
            syncHistoryData.correct_count = correctCount
        }
        if (dataTypes.includes('groups') && Array.isArray(customGroups)) {
            syncHistoryData.custom_groups = JSON.stringify(customGroups)
        }
        if (dataTypes.includes('hiddenMap') && hiddenMap) {
            syncHistoryData.hidden_map = JSON.stringify(hiddenMap)
        }
        if (dataTypes.includes('formulaVersion')) {
            if (formulaSongVersions && typeof formulaSongVersions === 'object') {
                syncHistoryData.formula_song_versions = JSON.stringify(formulaSongVersions)
            }
            if (formulaSongVersion) {
                syncHistoryData.formula_song_version = formulaSongVersion
            }
        }

        await SyncHistory.create(syncHistoryData)

        // 清理旧的历史记录，保留最新的MAX_SYNC_HISTORY条
        const historyCount = await SyncHistory.count({
            where: { user_id: id, tool_name: tool_name, sync_type: 'upload' }
        })

        if (historyCount > MAX_SYNC_HISTORY) {
            const oldRecords = await SyncHistory.findAll({
                where: { user_id: id, tool_name: toolName, sync_type: 'upload' },
                order: [['created_at', 'ASC']],
                limit: historyCount - MAX_SYNC_HISTORY
            })

            const oldIds = oldRecords.map(r => r.id)
            await SyncHistory.destroy({
                where: { id: { [Op.in]: oldIds } }
            })
        }

        res.json({
            success: true,
            message: created ? "进度上传成功" : "进度更新成功",
            data: {
                toolName,
                dataTypes,
                totalEntries: record.total_entries,
                reviewedCount: record.reviewed_count,
                correctCount: record.correct_count
            }
        })
    } catch (error) {
        console.error("上传进度失败:", error)
        res.status(500).json({ success: false, message: "上传进度失败" })
    }
})

// 获取同步历史列表
router.get("/history", auth, async (req, res) => {
    try {
        const { id } = req.user
        const { toolName, syncType = 'upload' } = req.query

        if (!toolName || typeof toolName !== 'string' || toolName.trim() === '') {
            return res.status(400).json({ success: false, message: "无效的工具名称" })
        }

        const records = await SyncHistory.findAll({
            where: { 
                user_id: id, 
                tool_name: toolName,
                sync_type: syncType
            },
            order: [['created_at', 'DESC']],
            limit: MAX_SYNC_HISTORY
        })

        const result = records.map(r => {
            let dataTypes = []
            try {
                dataTypes = JSON.parse(r.data_types)
            } catch (e) {}

            return {
                id: r.id,
                dataTypes,
                totalEntries: r.total_entries,
                reviewedCount: r.reviewed_count,
                correctCount: r.correct_count,
                hasGroups: !!r.custom_groups,
                hasHiddenMap: !!r.hidden_map,
                hasFormulaVersion: !!r.formula_song_version,
                createdAt: r.created_at
            }
        })

        res.json({
            success: true,
            data: result
        })
    } catch (error) {
        console.error("获取同步历史失败:", error)
        res.status(500).json({ success: false, message: "获取同步历史失败" })
    }
})

// 获取指定同步历史的详细数据
router.get("/history/:id", auth, async (req, res) => {
    try {
        const userId = req.user.id
        const { id } = req.params

        const record = await SyncHistory.findOne({
            where: { id, user_id: userId }
        })

        if (!record) {
            return res.status(404).json({ success: false, message: "未找到同步记录" })
        }

        let dataTypes = []
        try {
            dataTypes = JSON.parse(record.data_types)
        } catch (e) {}

        let progressData = null
        if (record.progress_data) {
            try {
                progressData = JSON.parse(record.progress_data)
            } catch (e) {}
        }

        let customGroups = null
        if (record.custom_groups) {
            try {
                customGroups = JSON.parse(record.custom_groups)
            } catch (e) {}
        }

        let hiddenMap = null
        if (record.hidden_map) {
            try {
                hiddenMap = JSON.parse(record.hidden_map)
            } catch (e) {}
        }

        res.json({
            success: true,
            data: {
                id: record.id,
                toolName: record.tool_name,
                dataTypes,
                progressData,
                customGroups,
                hiddenMap,
                formulaSongVersion: record.formula_song_version,
                totalEntries: record.total_entries,
                reviewedCount: record.reviewed_count,
                correctCount: record.correct_count,
                createdAt: record.created_at
            }
        })
    } catch (error) {
        console.error("获取同步历史详情失败:", error)
        res.status(500).json({ success: false, message: "获取同步历史详情失败" })
    }
})

// 获取自己的进度概览
router.get("/my", auth, async (req, res) => {
    try {
        const { id } = req.user

        const progressList = await StudyProgress.findAll({
            where: { user_id: id },
            attributes: ["tool_name", "total_entries", "reviewed_count", "correct_count", "custom_groups", "updated_at"]
        })

        // 获取所有的工具名称映射
        const allTools = await Tool.findAll({ attributes: ["id", "name"] })
        const toolNameMap = {}
        allTools.forEach(t => {
            toolNameMap[t.id] = t.name
            toolNameMap[t.name] = t.name
        })

        // 补充硬编码别名保障向下兼容
        const fallbackMap = {
            shanghan: "伤寒精读助手",
            fangji: "方剂查询",
            neijing: "内经选读",
            zhongyao: "中药学",
            jinkui: "金匮简易考",
            wenbing: "温病掌上学"
        }

        const result = progressList.map(p => {
            let customGroupsCount = 0
            if (p.custom_groups) {
                try {
                    const groups = JSON.parse(p.custom_groups)
                    customGroupsCount = Array.isArray(groups) ? groups.length : 0
                } catch (e) {}
            }
            return {
                toolName: p.tool_name,
                toolLabel: toolNameMap[p.tool_name] || fallbackMap[p.tool_name] || p.tool_name,
                totalEntries: p.total_entries,
                reviewedCount: p.reviewed_count,
                correctCount: p.correct_count,
                customGroupsCount: customGroupsCount,
                updatedAt: p.updated_at
            }
        })

        res.json({
            success: true,
            data: result
        })
    } catch (error) {
        console.error("获取进度失败:", error)
        res.status(500).json({ success: false, message: "获取进度失败" })
    }
})

// 下载学习记录（支持选择性下载）
router.post("/download", auth, async (req, res) => {
    try {
        const { id } = req.user
        const { toolName, historyId, dataTypes = [] } = req.body

        // 验证参数
        if (!toolName || typeof toolName !== 'string' || toolName.trim() === '') {
            return res.status(400).json({ success: false, message: "无效的工具名称" })
        }

        if (!Array.isArray(dataTypes) || dataTypes.length === 0) {
            return res.status(400).json({ success: false, message: "请选择要下载的数据类型" })
        }

        let sourceData = null

        // 如果指定了历史记录ID，从历史记录下载
        if (historyId) {
            const historyRecord = await SyncHistory.findOne({
                where: { id: historyId, user_id: id, tool_name: toolName }
            })

            if (!historyRecord) {
                return res.status(404).json({ success: false, message: "未找到指定的同步记录" })
            }

            let progressData = null
            if (historyRecord.progress_data) {
                try {
                    progressData = JSON.parse(historyRecord.progress_data)
                } catch (e) {}
            }

            let customGroups = null
            if (historyRecord.custom_groups) {
                try {
                    customGroups = JSON.parse(historyRecord.custom_groups)
                } catch (e) {}
            }

            let hiddenMap = null
            if (historyRecord.hidden_map) {
                try {
                    hiddenMap = JSON.parse(historyRecord.hidden_map)
                } catch (e) {}
            }

            let formulaSongVersions = null
            if (historyRecord.formula_song_versions) {
                try {
                    formulaSongVersions = JSON.parse(historyRecord.formula_song_versions)
                } catch (e) {}
            }

            sourceData = {
                progressData,
                customGroups,
                hiddenMap,
                formulaSongVersion: historyRecord.formula_song_version,
                formulaSongVersions,
                totalEntries: historyRecord.total_entries,
                reviewedCount: historyRecord.reviewed_count,
                correctCount: historyRecord.correct_count,
                createdAt: historyRecord.created_at
            }
        } else {
            // 否则从当前进度下载
            const record = await StudyProgress.findOne({
                where: { user_id: id, tool_name: toolName }
            })

            if (!record) {
                return res.status(404).json({ success: false, message: "未找到学习记录" })
            }

            let progressData = null
            if (record.progress_data) {
                try {
                    progressData = JSON.parse(record.progress_data)
                } catch (e) {}
            }

            let customGroups = null
            if (record.custom_groups) {
                try {
                    customGroups = JSON.parse(record.custom_groups)
                } catch (e) {}
            }

            let hiddenMap = null
            if (record.hidden_map) {
                try {
                    hiddenMap = JSON.parse(record.hidden_map)
                } catch (e) {}
            }

            let formulaSongVersions = null
            if (record.formula_song_versions) {
                try {
                    formulaSongVersions = JSON.parse(record.formula_song_versions)
                } catch (e) {}
            }

            sourceData = {
                progressData,
                customGroups,
                hiddenMap,
                formulaSongVersion: record.formula_song_version,
                formulaSongVersions,
                totalEntries: record.total_entries,
                reviewedCount: record.reviewed_count,
                correctCount: record.correct_count,
                createdAt: record.updated_at
            }
        }

        // 根据选择的数据类型返回数据
        const result = {
            toolName,
            dataTypes,
            createdAt: sourceData.createdAt
        }

        if (dataTypes.includes('history') && sourceData.progressData) {
            result.progressData = sourceData.progressData
            result.totalEntries = sourceData.totalEntries
            result.reviewedCount = sourceData.reviewedCount
            result.correctCount = sourceData.correctCount
        }

        if (dataTypes.includes('groups') && sourceData.customGroups) {
            result.customGroups = sourceData.customGroups
        }

        if (dataTypes.includes('hiddenMap') && sourceData.hiddenMap) {
            result.hiddenMap = sourceData.hiddenMap
        }

        if (dataTypes.includes('formulaVersion')) {
            if (sourceData.formulaSongVersions) {
                result.formulaSongVersions = sourceData.formulaSongVersions
            }
            if (sourceData.formulaSongVersion) {
                result.formulaSongVersion = sourceData.formulaSongVersion
            }
        }

        // 保存下载同步历史
        await SyncHistory.create({
            user_id: id,
            tool_name: toolName,
            sync_type: 'download',
            data_types: JSON.stringify(dataTypes),
            progress_data: sourceData.progressData ? JSON.stringify(sourceData.progressData) : null,
            custom_groups: sourceData.customGroups ? JSON.stringify(sourceData.customGroups) : null,
            hidden_map: sourceData.hiddenMap ? JSON.stringify(sourceData.hiddenMap) : null,
            formula_song_version: sourceData.formulaSongVersion || null,
            total_entries: sourceData.totalEntries || 0,
            reviewed_count: sourceData.reviewedCount || 0,
            correct_count: sourceData.correctCount || 0,
            created_at: Date.now()
        })

        // 清理旧的下载历史记录
        const downloadCount = await SyncHistory.count({
            where: { user_id: id, tool_name: toolName, sync_type: 'download' }
        })

        if (downloadCount > MAX_SYNC_HISTORY) {
            const oldRecords = await SyncHistory.findAll({
                where: { user_id: id, tool_name: toolName, sync_type: 'download' },
                order: [['created_at', 'ASC']],
                limit: downloadCount - MAX_SYNC_HISTORY
            })

            const oldIds = oldRecords.map(r => r.id)
            await SyncHistory.destroy({
                where: { id: { [Op.in]: oldIds } }
            })
        }

        res.json({
            success: true,
            data: result
        })
    } catch (error) {
        console.error("下载学习记录失败:", error)
        res.status(500).json({ success: false, message: "下载学习记录失败" })
    }
})

module.exports = router
