const share = require('../../utils/share');
const contentUtils = require('../../utils/content');
const app = getApp();

// 数据库配置
const DB_LIST = [
    {
        key: 'shanghan',
        name: '伤寒论',
        icon: '/images/伤寒速速通.png',
        storageKey: 'shanghan_comments',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        lightBg: 'rgba(99, 102, 241, 0.08)',
        accentColor: '#6366f1',
        hasLevels: true
    },
    {
        key: 'fangji',
        name: '方剂学',
        icon: '/images/方剂轻松过.png',
        storageKey: 'fangji_comments',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        lightBg: 'rgba(244, 114, 182, 0.08)',
        accentColor: '#ec4899'
    },
    {
        key: 'neijing',
        name: '黄帝内经',
        icon: '/images/内经随身背.png',
        storageKey: 'neijing_comments',
        gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        lightBg: 'rgba(234, 179, 8, 0.08)',
        accentColor: '#eab308',
        hasLevels: true
    },
    {
        key: 'zhongyao',
        name: '中药学',
        icon: '/images/中药快快记.png',
        storageKey: 'zhongyao_comments',
        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        lightBg: 'rgba(16, 185, 129, 0.08)',
        accentColor: '#10b981'
    },
    {
        key: 'jinkui',
        name: '金匮要略',
        icon: '/images/金匮简易考.png',
        storageKey: 'jinkui_comments',
        gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
        lightBg: 'rgba(34, 197, 94, 0.08)',
        accentColor: '#22c55e'
    },
    {
        key: 'wenbing',
        name: '温病学',
        icon: '/images/温病掌上学.png',
        storageKey: 'wenbing_comments',
        gradient: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
        lightBg: 'rgba(139, 92, 246, 0.08)',
        accentColor: '#8b5cf6'
    }
];

Page({
    data: {
        // 模式: 'dashboard' 仪表盘, 'select' 选择数据库, 'quiz' 背诵模式
        mode: 'dashboard',
        dbList: [],
        // 当前选中的数据库
        currentDb: null,
        // 今日统计 (基于日期)
        todayNew: 0,
        todayReview: 0,
        targetNew: 5,
        targetReview: 10,
        // 动画
        cardAnimClass: '',
        statusBarHeight: 0,
        // === 计划修改相关 ===
        showPlanModal: false,
        planTargetNew: 5,
        planDays: 0,
        // === 分级选择相关 ===
        selectedLevel: 'all', // 'all', '1', '2'
        isDarkMode: false
    },

    onLoad() {
        const sysInfo = wx.getSystemInfoSync();
        this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 });
        this._refreshDbList();
    },

    onShow() {
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({ selected: 1 });
            this.getTabBar().updateTheme();
        }

        const isDark = app.globalData.isToolDarkMode;
        this.setData({ isDarkMode: isDark });
        app.updateUITheme(isDark);

        // 1. 尝试恢复上次学习的科目
        const lastKey = wx.getStorageSync('mnemonic_last_db_key');
        if (lastKey) {
            const db = DB_LIST.find(d => d.key === lastKey);
            if (db) {
                this._selectDb(db, false); // 静默加载数据
            } else {
                this.setData({ mode: 'select' });
            }
        } else {
            this.setData({ mode: 'select' });
        }

        // 2. 刷新全局统计
        this._refreshDbList();
        // 3. 刷新今日数据
        this._loadTodayStats();
    },

    // 刷新数据库列表及统计
    _refreshDbList() {
        const list = DB_LIST.map(db => {
            const dataModule = contentUtils.getCachedOrLocalContent(db.key);
            const total = dataModule.entries.length;
            const history = wx.getStorageSync(db.storageKey + '_history') || [];

            let mastered = 0;
            let unmastered = 0;
            let newCount = 0;

            for (let i = 0; i < total; i++) {
                let h = history[i];
                if (!h || !Array.isArray(h) || h.length === 0) {
                    newCount++;
                } else {
                    const last = h[h.length - 1];
                    const isWin = typeof last === 'boolean' ? last : (last.r === true);
                    if (isWin) mastered++;
                    else unmastered++;
                }
            }

            return {
                ...db,
                total,
                mastered,
                unmastered,
                newCount,
                progress: total > 0 ? Math.round((mastered / total) * 100) : 0
            };
        });

        this.setData({ dbList: list });
    },

    // 选择数据库对外接口
    onSelectDb(e) {
        const key = e.currentTarget.dataset.key;
        const level = e.currentTarget.dataset.level || 'all';
        const db = DB_LIST.find(d => d.key === key);
        if (!db) return;
        this.setData({ selectedLevel: level });
        this._selectDb(db, true);
    },

    // 内部选择逻辑
    _selectDb(db, jumpToDashboard = true) {
        // 保存上次选中
        wx.setStorageSync('mnemonic_last_db_key', db.key);
        // 如果没有传入level，则尝试读取上次该科目的level
        if (jumpToDashboard === false) {
            const lastLevel = wx.getStorageSync('mnemonic_last_level_' + db.key) || 'all';
            this.setData({ selectedLevel: lastLevel });
        } else {
            wx.setStorageSync('mnemonic_last_level_' + db.key, this.data.selectedLevel);
        }

        // 加载数据
        const dataModule = contentUtils.getCachedOrLocalContent(db.key);
        this._rawEntries = this._normalizeEntries(db.key, dataModule.entries);
        this._storageKey = db.storageKey;

        // 加载该科目的计划设置 (默认50)
        const savedTarget = wx.getStorageSync('mnemonic_plan_target_' + db.key) || 5;
        this.setData({ targetNew: savedTarget });

        // 读取历史
        let history = wx.getStorageSync(db.storageKey + '_history');
        if (!history || !Array.isArray(history) || history.length !== this._rawEntries.length) {
            history = this._rawEntries.map(() => []);
            wx.setStorageSync(db.storageKey + '_history', history);
        }
        this._history = history;

        // 计算统计
        const stats = this._calcStats();

        this.setData({
            currentDb: db,
            ...stats
        });

        if (jumpToDashboard) {
            this.setData({ mode: 'dashboard' });
            this._loadTodayStats();
        }
    },

    // 跳转至工具抽查
    onStartQuiz(e) {
        const qMode = e.currentTarget.dataset.mode;
        const db = this.data.currentDb;
        if (!db) return;

        // 如果是复习模式且没有可复习项，提示先学习
        if (qMode === 'review') {
            const stats = this._calcStats();
            if (stats.masteredCount + stats.unmasteredCount === 0) {
                wx.showToast({ title: '请先点击学习', icon: 'none' });
                return;
            }
        }

        wx.navigateTo({
            url: `/pages/study/study?type=${db.key}&tab=quiz&from=mnemonic&mode=${qMode}&quizFilter=${this.data.selectedLevel}&targetNew=${this.data.targetNew}`
        });
    },

    // 切换数据库
    onChangeDb() {
        this.setData({ mode: 'select' });
    },

    // 加载今日统计
    _loadTodayStats() {
        const dbKey = this.data.currentDb ? this.data.currentDb.key : '';
        if (!dbKey) return;
        const today = new Date().toISOString().split('T')[0];
        const stats = wx.getStorageSync('mnemonic_today_stats_' + dbKey + '_' + today) || { new: 0, review: 0 };
        this.setData({
            todayNew: stats.new || 0,
            todayReview: stats.review || 0
        });
    },

    // 更新今日统计
    _updateTodayStats(type) {
        const dbKey = this.data.currentDb ? this.data.currentDb.key : '';
        if (!dbKey) return;
        const today = new Date().toISOString().split('T')[0];
        const statsKey = 'mnemonic_today_stats_' + dbKey + '_' + today;
        const stats = wx.getStorageSync(statsKey) || { new: 0, review: 0 };
        if (type === 'new') stats.new++;
        else stats.review++;
        wx.setStorageSync(statsKey, stats);
        this.setData({
            todayNew: stats.new,
            todayReview: stats.review
        });
    },

    // 数据格式标准化
    _normalizeEntries(type, entries) {
        return entries.map((item, index) => ({
            ...item,
            clauseNum: item.clauseNum || (index + 1)
        }));
    },

    // 计算统计信息
    _calcStats() {
        const history = this._history;
        const totalEntries = this._rawEntries;
        const selectedLevel = this.data.selectedLevel;

        // 过滤等级
        const filteredEntries = selectedLevel === 'all'
            ? totalEntries
            : totalEntries.filter(e => String(e.level) === selectedLevel);

        const total = filteredEntries.length;
        let mastered = 0, unmastered = 0, newCount = 0, dueCount = 0;
        const now = Date.now();

        totalEntries.forEach((entry, i) => {
            // 只统计符合当前等级的
            if (selectedLevel !== 'all' && String(entry.level) !== selectedLevel) return;

            const h = history[i];
            if (!h || h.length === 0) {
                newCount++;
            } else {
                const last = h[h.length - 1];
                const isWin = typeof last === 'boolean' ? last : (last.r === true);
                if (isWin) mastered++;
                else unmastered++;

                // 计算到期复习数 (艾宾浩斯核心逻辑)
                if (typeof last === 'object' && last.d && now >= last.d) {
                    dueCount++;
                } else if (typeof last === 'boolean') {
                    // 旧版布尔数据视为立即到期
                    dueCount++;
                }
            }
        });

        return {
            totalCount: total, masteredCount: mastered, unmasteredCount: unmastered,
            newCount, dueCount
        };
    },

    // --- 计划修改弹窗逻辑 ---
    onOpenPlanModal() {
        const { totalCount, masteredCount, targetNew } = this.data;
        const remaining = totalCount - masteredCount;
        const days = Math.ceil(remaining / targetNew) || 1;

        this.setData({
            showPlanModal: true,
            planTargetNew: targetNew,
            planDays: days
        });
    },

    onClosePlanModal() {
        this.setData({ showPlanModal: false });
    },

    onTargetInput(e) {
        let rawVal = e.detail.value;
        if (rawVal === '') rawVal = '0'; // 允许清空显示为0
        const val = parseInt(rawVal) || 0;

        const { totalCount, masteredCount } = this.data;
        const remaining = totalCount - masteredCount;
        const days = val > 0 ? (Math.ceil(remaining / val) || 1) : 0;

        this.setData({
            planTargetNew: rawVal,
            planDays: days,
            planTargetReview: val * 10 // 联动：新学1个，建议复习10个
        });
    },

    onDaysInput(e) {
        let rawVal = e.detail.value;
        if (rawVal === '') rawVal = '0';
        const days = parseInt(rawVal) || 0;

        const { totalCount, masteredCount } = this.data;
        const remaining = totalCount - masteredCount;
        const val = days > 0 ? (Math.ceil(remaining / days) || 1) : 0;

        this.setData({
            planDays: rawVal,
            planTargetNew: val,
            planTargetReview: val * 10
        });
    },

    onTargetReviewInput(e) {
        let rawVal = e.detail.value;
        this.setData({ planTargetReview: rawVal });
    },

    onSavePlan() {
        let targetNew = parseInt(this.data.planTargetNew) || 0;
        let targetReview = parseInt(this.data.planTargetReview) || 0;

        if (targetNew <= 0) {
            wx.showToast({ title: '新学量需大于0', icon: 'none' });
            return;
        }

        const db = this.data.currentDb;
        wx.setStorageSync(`mnemonic_plan_${db.key}`, { targetNew, targetReview });

        this.setData({
            targetNew,
            targetReview,
            showPlanModal: false
        });

        wx.showToast({ title: '计划已更新', icon: 'success' });
    },

    onBackToDashboard() {
        this._refreshDbList();
        this.setData({
            mode: 'dashboard'
        });
    },

    // 返回选择页
    onBackToSelect() {
        this._refreshDbList();
        this.setData({
            mode: 'select',
            currentDb: null,
            quizItem: null,
            quizIndex: -1,
            lastQuizIndex: -1
        });
    },

    onShareAppMessage() {
        return share.getDefaultShareConfig();
    },

    onShareTimeline() {
        return share.getDefaultShareConfig();
    }
});
