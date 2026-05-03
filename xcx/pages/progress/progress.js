const api = require('../../utils/api')
const auth = require('../../utils/auth')
const { mergeCustomGroups } = require('../../utils/custom-groups')
const app = getApp()

const TOOLS = [
    { key: 'shanghan', name: '伤寒速速通', storageKey: 'shanghan_comments_history', hiddenMapKey: null, customGroupsKey: 'shanghan_comments_custom_groups', dataTypes: ['history', 'groups'] },
    { key: 'fangji', name: '方剂轻松过', storageKey: 'fangji_comments_history', hiddenMapKey: 'fangji_comments_hidden_map', customGroupsKey: 'fangji_comments_custom_groups', formulaSongVersionsKey: 'fangji_comments_formula_song_versions', dataTypes: ['history', 'groups', 'formulaVersion'] },
    { key: 'neijing', name: '内经随身背', storageKey: 'neijing_comments_history', hiddenMapKey: null, customGroupsKey: 'neijing_comments_custom_groups', dataTypes: ['history', 'groups'] },
    { key: 'zhongyao', name: '中药快快记', storageKey: 'zhongyao_comments_history', hiddenMapKey: null, customGroupsKey: 'zhongyao_comments_custom_groups', dataTypes: ['history', 'groups'] },
    { key: 'jinkui', name: '金匮简易考', storageKey: 'jinkui_comments_history', hiddenMapKey: null, customGroupsKey: 'jinkui_comments_custom_groups', dataTypes: ['history', 'groups'] },
    { key: 'wenbing', name: '温病掌上学', storageKey: 'wenbing_comments_history', hiddenMapKey: null, customGroupsKey: 'wenbing_comments_custom_groups', dataTypes: ['history', 'groups'] }
]

// 数据类型显示名称映射
const DATA_TYPE_LABELS = {
    history: '检查记录',
    groups: '背诵组',
    formulaVersion: '方歌版本',
    hiddenMap: '隐藏映射'
}

Page({
    data: {
        progressList: [],
        loading: false,
        isDarkMode: false,
        // 同步弹窗相关
        showSyncTypeModal: false,
        isSyncModalClosing: false,
        syncTypeModalMode: 'upload',
        currentToolKey: null,
        availableDataTypes: [],
        selectedDataTypes: [],
        dataTypeCheckMap: {},
        syncHistoryList: [],
        selectedHistoryIds: [], // 改为数组支持多选
        showHistorySelector: true // 默认展开
    },

    onLoad() {
        // 检查是否从分享卡片进入（页面栈只有一个页面）
        const pages = getCurrentPages();
        if (pages.length === 1) {
            // 先跳转到首页，再跳回当前页面，确保页面栈中有多个页面
            wx.switchTab({ 
                url: '/pages/index/index',
                success: () => {
                    setTimeout(() => {
                        wx.navigateTo({ 
                            url: '/pages/progress/progress'
                        });
                    }, 100);
                }
            });
            return;
        }

        if (!auth.isLoggedIn()) {
            wx.showToast({ title: '请先登录', icon: 'none' })
            setTimeout(() => {
                wx.switchTab({ url: '/pages/profile/profile' })
            }, 1000)
            return
        }
        this.refreshData()
    },

    onShow() {
        const app = getApp();
        const isDark = app.globalData.isDarkMode !== undefined ? app.globalData.isDarkMode : false;
        this.setData({ isDarkMode: isDark });
        app.updateUITheme(isDark);
        this.refreshData()
    },

    async refreshData() {
        if (this.data.loading) return
        this.setData({ loading: true })

        try {
            // 1. 获取本地统计
            const localStats = TOOLS.map(tool => {
                const history = wx.getStorageSync(tool.storageKey) || []
                const totalEntries = history.length
                const customGroups = wx.getStorageSync(tool.customGroupsKey) || []
                const groupCount = Array.isArray(customGroups) ? customGroups.length : 0
                
                let reviewedCount = 0
                let correctCount = 0

                history.forEach(h => {
                    if (Array.isArray(h) && h.length > 0) {
                        reviewedCount++
                        if (h[h.length - 1] === true) {
                            correctCount++
                        }
                    }
                })

                return {
                    key: tool.key,
                    name: tool.name,
                    local: {
                        reviewedCount,
                        totalEntries,
                        correctCount,
                        groupCount
                    },
                    cloud: null,
                    status: 'idle'
                }
            })

            // 2. 获取云端统计
            let cloudData = []
            const token = wx.getStorageSync('token')
            if (token) {
                const res = await api.progress.getMy()
                if (res.success) {
                    cloudData = res.data || []
                }
            }

            // 3. 合并数据并计算状态
            const combined = localStats.map(item => {
                const cloudItem = cloudData.find(c => c.toolName === item.key)
                if (cloudItem) {
                    item.cloud = {
                        reviewedCount: cloudItem.reviewedCount,
                        totalEntries: cloudItem.totalEntries,
                        correctCount: cloudItem.correctCount,
                        groupCount: cloudItem.customGroupsCount || 0,
                        updatedAt: cloudItem.updatedAt
                    }
                }

                // 计算对比状态
                let compareText = '未同步'
                let compareType = 'warn'

                if (item.cloud) {
                    const localCount = item.local.reviewedCount
                    const cloudCount = item.cloud.reviewedCount
                    const localGroups = item.local.groupCount
                    const cloudGroups = item.cloud.groupCount

                    if (localCount > cloudCount || localGroups > cloudGroups) {
                        compareText = '本地有新数据'
                        compareType = 'info'
                    } else if (localCount < cloudCount || localGroups < cloudGroups) {
                        compareText = '云端有新数据'
                        compareType = 'warn'
                    } else {
                        compareText = '数据已同步'
                        compareType = 'success'
                    }
                }

                item.compareText = compareText
                item.compareType = compareType
                return item
            })

            this.setData({ progressList: combined })
        } catch (error) {
            console.error('加载进度失败:', error)
            wx.showToast({ title: '加载失败', icon: 'none' })
        } finally {
            this.setData({ loading: false })
        }
    },

    onUpload(e) {
        const key = e.currentTarget.dataset.key
        const tool = TOOLS.find(t => t.key === key)
        if (!tool) return

        const dataTypes = tool.dataTypes || ['history', 'groups']
        const checkMap = {}
        dataTypes.forEach(type => { checkMap[type] = true })

        // 显示数据类型选择弹窗
        this.setData({
            showSyncTypeModal: true,
            syncTypeModalMode: 'upload',
            currentToolKey: key,
            availableDataTypes: dataTypes,
            selectedDataTypes: [...dataTypes],
            dataTypeCheckMap: checkMap,
            showHistorySelector: true,
            syncHistoryList: [],
            selectedHistoryIds: []
        })
    },

    onDownload(e) {
        const key = e.currentTarget.dataset.key
        const tool = TOOLS.find(t => t.key === key)
        if (!tool) return

        const dataTypes = tool.dataTypes || ['history', 'groups']
        const checkMap = {}
        dataTypes.forEach(type => { checkMap[type] = true })

        // 显示数据类型选择弹窗
        this.setData({
            showSyncTypeModal: true,
            syncTypeModalMode: 'download',
            currentToolKey: key,
            availableDataTypes: dataTypes,
            selectedDataTypes: [...dataTypes],
            dataTypeCheckMap: checkMap,
            showHistorySelector: true,
            syncHistoryList: [],
            selectedHistoryIds: []
        })

        // 加载同步历史
        this.loadSyncHistory()
    },

    formatTimestamp(timestamp) {
        const date = new Date(timestamp)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hour = String(date.getHours()).padStart(2, '0')
        const minute = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day} ${hour}:${minute}`
    },

    async loadSyncHistory() {
        const tool = TOOLS.find(t => t.key === this.data.currentToolKey)
        if (!tool) return

        try {
            const res = await api.progress.getHistory(tool.key, 'upload')
            if (res?.success) {
                const historyList = (res.data || []).map(item => ({
                    ...item,
                    createdAt: this.formatTimestamp(item.createdAt)
                }))
                this.setData({ syncHistoryList: historyList, showHistorySelector: true })
            }
        } catch (error) {
            console.error('加载同步历史失败:', error)
        }
    },

    onCloseSyncTypeModal() {
        this.setData({ isSyncModalClosing: true })
        setTimeout(() => {
            this.setData({ 
                showSyncTypeModal: false,
                isSyncModalClosing: false
            })
        }, 200)
    },

    onToggleDataType(e) {
        const type = e.currentTarget.dataset.type
        if (!type) return

        const { selectedDataTypes, dataTypeCheckMap } = this.data
        const isChecked = !!dataTypeCheckMap[type]
        const newCheckMap = { ...dataTypeCheckMap }
        let newSelected = [...selectedDataTypes]

        if (isChecked) {
            newCheckMap[type] = false
            newSelected = newSelected.filter(t => t !== type)
        } else {
            newCheckMap[type] = true
            if (!newSelected.includes(type)) {
                newSelected.push(type)
            }
        }

        this.setData({ 
            selectedDataTypes: newSelected,
            dataTypeCheckMap: newCheckMap
        })
    },

    onSelectHistory(e) {
        const id = e.currentTarget.dataset.id
        const { selectedHistoryIds } = this.data
        const index = selectedHistoryIds.indexOf(id)
        let newSelected = [...selectedHistoryIds]
        
        if (index > -1) {
            newSelected.splice(index, 1)
        } else {
            newSelected.push(id)
        }
        
        this.setData({ selectedHistoryIds: newSelected })
    },

    onToggleHistorySelector() {
        this.setData({ showHistorySelector: !this.data.showHistorySelector })
    },

    onConfirmSyncType() {
        const { syncTypeModalMode, selectedDataTypes, selectedHistoryIds } = this.data

        if (selectedDataTypes.length === 0) {
            wx.showToast({ title: '请选择要同步的数据', icon: 'none' })
            return
        }

        this.setData({ showSyncTypeModal: false })

        if (syncTypeModalMode === 'upload') {
            this.executeUpload(selectedDataTypes)
        } else {
            this.executeDownload(selectedDataTypes, selectedHistoryIds)
        }
    },

    async executeUpload(dataTypes) {
        const tool = TOOLS.find(t => t.key === this.data.currentToolKey)
        if (!tool) return

        wx.showLoading({ title: '正在上传...' })
        try {
            const payload = {
                toolName: tool.key,
                dataTypes
            }

            if (dataTypes.includes('history')) {
                const historyData = wx.getStorageSync(tool.storageKey) || []
                payload.historyData = historyData
            }

            if (dataTypes.includes('groups')) {
                const customGroups = wx.getStorageSync(tool.customGroupsKey) || []
                if (customGroups.length > 0) {
                    payload.customGroups = customGroups
                }
            }

            if (dataTypes.includes('hiddenMap') && tool.hiddenMapKey) {
                const hiddenMap = wx.getStorageSync(tool.hiddenMapKey)
                if (hiddenMap && Object.keys(hiddenMap).length > 0) {
                    payload.hiddenMap = hiddenMap
                }
            }

            if (dataTypes.includes('formulaVersion') && tool.formulaSongVersionsKey) {
                const formulaSongVersions = wx.getStorageSync(tool.formulaSongVersionsKey)
                if (formulaSongVersions && typeof formulaSongVersions === 'object' && Object.keys(formulaSongVersions).length > 0) {
                    payload.formulaSongVersions = formulaSongVersions
                }
            }

            const res = await api.progress.upload(payload)
            wx.hideLoading()

            if (res?.success) {
                const typeNames = dataTypes.map(t => DATA_TYPE_LABELS[t]).join('、')
                wx.showToast({
                    title: `${typeNames}上传成功`,
                    icon: "none",
                    duration: 1500
                })
                this.refreshData()
            } else {
                wx.showToast({ title: res?.message || "上传失败", icon: "none" })
            }
        } catch (error) {
            wx.hideLoading()
            console.error("上传失败:", error)
            wx.showToast({ title: "上传失败，请重试", icon: "none" })
        }
    },

    async executeDownload(dataTypes, historyIds) {
        const tool = TOOLS.find(t => t.key === this.data.currentToolKey)
        if (!tool) return

        wx.showLoading({ title: '正在下载...' })
        try {
            const payload = {
                toolName: tool.key,
                dataTypes
            }

            if (historyIds && historyIds.length > 0) {
                payload.historyIds = historyIds
            }

            const res = await api.progress.download(payload)
            wx.hideLoading()

            if (res?.success && res.data) {
                // 恢复检查记录
                if (dataTypes.includes('history') && res.data.progressData) {
                    wx.setStorageSync(tool.storageKey, res.data.progressData)
                }

                // 恢复背诵组
                if (dataTypes.includes('groups') && res.data.customGroups) {
                    const localGroups = wx.getStorageSync(tool.customGroupsKey) || []
                    const mergedGroups = mergeCustomGroups(localGroups, res.data.customGroups)
                    wx.setStorageSync(tool.customGroupsKey, mergedGroups)
                }

                // 恢复隐藏映射
                if (dataTypes.includes('hiddenMap') && tool.hiddenMapKey && res.data.hiddenMap) {
                    wx.setStorageSync(tool.hiddenMapKey, res.data.hiddenMap)
                }

                // 恢复方歌版本（新格式：按方剂记录）
                if (dataTypes.includes('formulaVersion') && tool.formulaSongVersionsKey && res.data.formulaSongVersions) {
                    wx.setStorageSync(tool.formulaSongVersionsKey, res.data.formulaSongVersions)
                }

                const typeNames = dataTypes.map(t => DATA_TYPE_LABELS[t]).join('、')
                wx.showToast({
                    title: `${typeNames}下载成功`,
                    icon: "none",
                    duration: 1500
                })
                this.refreshData()
            } else {
                wx.showToast({ title: res?.message || "下载失败", icon: "none" })
            }
        } catch (error) {
            wx.hideLoading()
            console.error("下载失败:", error)
            wx.showToast({ title: "下载失败，请重试", icon: "none" })
        }
    },

    preventModalTap() {
        // 阻止点击内容区域时冒泡关闭弹窗
    },

    onBack() {
        const pages = getCurrentPages()
        if (pages.length === 1) {
            // 从分享卡片进入，跳转到首页
            wx.switchTab({ url: '/pages/index/index' })
        } else {
            // 正常返回
            wx.navigateBack()
        }
    }
})
