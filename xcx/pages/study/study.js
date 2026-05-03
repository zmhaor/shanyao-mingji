

const api = require('../../utils/api');
const share = require('../../utils/share');
const contentUtils = require('../../utils/content');
const { normalizeCustomGroups } = require('../../utils/custom-groups');
const { calculateActionSheetLayout } = require('../../utils/action-sheet-layout');
const {
  buildTagFilterMap,
  buildTagFilterSheetState,
  toggleTagFilterSelection,
} = require('../../utils/tag-filter-sheet');
const app = getApp();

// 艾宾浩斯记忆阶段间隔 (毫秒)
const EBBINGHAUS_INTERVALS = [
  0,               // Stage 0: 初始
  1800000,         // Stage 1: 30分钟
  43200000,        // Stage 2: 12小时
  86400000,        // Stage 3: 1天
  172800000,       // Stage 4: 2天
  345600000,       // Stage 5: 4天
  604800000,       // Stage 6: 7天
  129600000,       // Stage 7: 15天
  2678400000       // Stage 8: 31天
];

const REMOTE_CONTENT_TIMEOUT_MS = 5000;


Page({
  data: {
    isDarkMode: false,
    isPageLoading: true,
    actionSheetContentHeight: 0,
    actionSheetTopOffset: 0,
    loadingText: '内容加载中...',
    entries: [],
    history: [],
    currentTab: 'read',
    searchText: '',
    showSearchBox: false,
    showActionSheet: false,
    displayList: [],
    rankList: [],
    history: [],
    currentTab: 'read',
    searchText: '',
    showSearchBox: false,
    showActionSheet: false,
    displayList: [],
    rankList: [],

    // === 等级过滤器 ===
    filterType: 'all',
    // === 排序方式: 'textbook' | 'clause' ===
    sortType: 'textbook',

    scrollTopVal: 0,
    scrollIntoViewTarget: '',
    showBackTop: false,
    isAllExpanded: false,
    isSearchEntryNavigation: false,
    isFromSearchPage: false,
    searchTargetKey: '',

    quizItem: {},
    quizIndex: -1,
    lastQuizIndex: -1,
    quizStatusText: '',
    quizShowAnswer: false,
    quizShowNote: false,
    quizAnswerButtonText: '查看原文',
    quizNoteButtonText: '显示方剂',
    // === 抽查筛选 ===
    quizFilter: 'all',

    // === 自定义背诵组 ===
    customGroups: [],
    activeGroupId: '',
    activeGroupName: '',
    showFilterModal: false,
    showGroupCreate: false,
    newGroupName: '',
    groupNameError: false,
    groupSelectItems: [],
    groupSearchText: '',
    groupSelectedCount: 0,
    // === 随时背专属：会话复习记录 ===
    reviewedIndices: [],
    isConsolidation: false, // 是否处于”即时巩固”模式 (绕过30分钟限制)
    quizStack: [], // 题目历史栈，用于”上一题”功能
    // === 方歌版本切换 ===
    formulaSongVersions: {}, // 每个方剂的版本选择，如 {"麻黄汤": "v1", "桂枝汤": "v2"}
    formulaSongVersionKey: '', // 方歌版本本地存储键
    // === 标签过滤 ===
    tagFilter: [], // 选中的标签列表，空数组表示显示全部
    tagFilterMap: {}, // 标签选中状态映射
    availableTags: [], // 当前工具可用的标签列表
    tagFilterSheet: null
  },

  async onLoad(options) {
    this._skipNextOnShow = true;
    // 读取工具夜间模式
    this.setData({ isDarkMode: app.getDarkMode() });
    const type = options.type || 'shanghan';
    const loadingTitleMap = {
      shanghan: '伤寒论加载中...',
      neijing: '内经加载中...',
      jinkui: '金匮加载中...',
      wenbing: '温病学加载中...',
      fangji: '方剂学加载中...',
      zhongyao: '中药学加载中...'
    };

    // 检查是否从分享卡片进入（页面栈只有一个页面）
    const pages = getCurrentPages();
    if (pages.length === 1) {
      // 先跳转到首页，再跳回当前页面，确保页面栈中有多个页面
      wx.switchTab({ 
        url: '/pages/index/index',
        success: () => {
          setTimeout(() => {
            wx.navigateTo({ 
              url: `/pages/study/study?type=${type}`
            });
          }, 100);
        }
      });
      return;
    }

    try {
      const bootResult = await this.bootstrapContentData(type);
      const shouldShowLoading = bootResult.source !== 'cache';

      this.setData({
        toolType: type,
        isPageLoading: shouldShowLoading,
        loadingText: loadingTitleMap[type] || '内容加载中...'
      });

      this.dataConfig = bootResult.payload;
      await this.initializePageData(options, this.dataConfig);

      if (bootResult.source === 'cache') {
        this.setData({ isPageLoading: false });
      }

      if (bootResult.shouldSync) {
        this.syncContentInBackground(type, bootResult.payload);
      }
    } finally {
      this.setData({ isPageLoading: false });
    }
  },

  onShow() {
    // 首次加载由 onLoad 处理同步，此处跳过
    if (this._skipNextOnShow) {
      this._skipNextOnShow = false;
      return;
    }
    // 页面恢复可见时（如从后台切回），静默检查数据更新
    const isDark = app.globalData.isToolDarkMode;
    this.setData({ isDarkMode: isDark });
    app.updateUITheme(isDark);
    
    if (!this.data.toolType || !this.storageKey) return;
    this.syncContentInBackground(this.data.toolType, this.dataConfig);
  },

  // === 获取复合键（tab + filterType） ===
  async bootstrapContentData(type) {
    const cached = contentUtils.getCachedContent(type);
    if (cached && Array.isArray(cached.entries) && cached.entries.length > 0) {
      return {
        payload: cached,
        shouldSync: true,
        source: 'cache'
      };
    }

    try {
      const fresh = await this.fetchRemoteFullContent(type);
      return {
        payload: fresh,
        shouldSync: false,
        source: 'remote'
      };
    } catch (error) {
      console.error("Failed to bootstrap remote content:", error);
      return {
        payload: contentUtils.getLocalContent(type),
        shouldSync: false,
        source: 'local'
      };
    }
  },

  async fetchRemoteFullContent(type) {
    const res = await Promise.race([
      api.content.getFull(type, {}),
      this.delay(REMOTE_CONTENT_TIMEOUT_MS).then(() => {
        throw new Error(`content request timeout after ${REMOTE_CONTENT_TIMEOUT_MS}ms`);
      })
    ]);

    if (!res?.success || !res.data) {
      throw new Error("invalid full content response");
    }

    const payload = contentUtils.buildCachePayload(
      type,
      res.data.collection || null,
      Array.isArray(res.data.list) ? res.data.list : [],
      { syncTime: res.data.collection?.last_published_at || res.data.collection?.update_time || 0 }
    );

    wx.setStorageSync(`content_cache_${type}`, payload);
    return payload;
  },

  async syncContentInBackground(type, currentPayload) {
    if (type !== this.data.toolType) return; // 保护：如果类型不匹配，说明是过期的同步请求
    try {
      const meta = await Promise.race([
        api.content.getMeta(type),
        this.delay(REMOTE_CONTENT_TIMEOUT_MS).then(() => {
          throw new Error(`content meta timeout after ${REMOTE_CONTENT_TIMEOUT_MS}ms`);
        })
      ]);

      if (!meta?.success || !meta.data?.collection) return;

      const remoteVersion = Number(meta.data.collection.version || 0);
      const localVersion = Number(currentPayload?.collection?.version || 0);

      // 强制同步温病工具的内容，解决缓存问题
      if (remoteVersion > localVersion || type === 'wenbing') {
        const delta = await Promise.race([
          api.content.getDelta(type, { since: Number(currentPayload?.syncTime || 0) }),
          this.delay(REMOTE_CONTENT_TIMEOUT_MS).then(() => {
            throw new Error(`content delta timeout after ${REMOTE_CONTENT_TIMEOUT_MS}ms`);
          })
        ]);

        if (!delta?.success || !delta.data) return;

        const nextPayload = contentUtils.mergeDeltaPayload(type, currentPayload, {
          collection: delta.data.collection || null,
          upserts: delta.data.upserts || [],
          deletes: delta.data.deletes || [],
          syncTime: delta.data.sync_time || 0
        });

        if (type !== this.data.toolType) return; // 再次检查确保当前页面未切换工具
        wx.setStorageSync(`content_cache_${type}`, nextPayload);
        const preparedPayload = this.prepareContentPayload(type, nextPayload);
        this.dataConfig = preparedPayload;
        this.refreshContentData(preparedPayload);
      }
    } catch (error) {
      console.error("Failed to sync content delta:", error);
    }
  },

  async initializePageData(options, payload) {
    const preparedPayload = this.prepareContentPayload(this.data.toolType, payload);
    this.dataConfig = preparedPayload;

    this.storageKey = `${this.data.toolType}_comments`;
    const lastFilter = wx.getStorageSync(this.storageKey + '_last_filter');
    const lastGroupId = wx.getStorageSync(this.storageKey + '_last_group_id');
    const isSearchEntryNavigation = options?.from === 'search';
    const searchTargetKey = decodeURIComponent(options?.targetKey || '').trim();

    if (!isSearchEntryNavigation && (this.data.toolType === 'shanghan' || this.data.toolType === 'neijing' || this.data.toolType === 'jinkui' || this.data.toolType === 'wenbing')) {
      const setDataObj = { filterType: lastFilter || '1' };
      if (this.data.toolType === 'wenbing') {
        setDataObj.sortType = 'clause';
      }
      this.setData(setDataObj);
    } else if (!isSearchEntryNavigation && lastFilter) {
      this.setData({ filterType: lastFilter });
    }

    this.pageSize = 20;
    this.config = preparedPayload.config;
    this.storageKey = this.config.storageKey;
    this.setData({
      pageTitle: this.config.title,
      showLevels: this.config.showLevels
    });

    wx.setNavigationBarTitle({ title: this.config.title });

    if (options && options.id) {
      this.addHistory(options.id);
    } else {
      const toolId = this._resolveToolId(this.data.toolType);
      if (toolId) this.addHistory(toolId);
    }

    let history = wx.getStorageSync(this.storageKey + '_history');
    if (!history || !Array.isArray(history) || history.length !== this.rawEntries.length) {
      history = this.rawEntries.map(() => []);
      wx.setStorageSync(this.storageKey + '_history', history);
    }

    let savedPositions = wx.getStorageSync(this.storageKey + '_scroll_positions') || {};
    let savedPages = wx.getStorageSync(this.storageKey + '_saved_pages') || {};
    let savedTab = wx.getStorageSync(this.storageKey + '_last_tab') || 'read';

    if (isSearchEntryNavigation) {
      savedTab = 'read';
    } else if (options && options.tab) {
      savedTab = options.tab;
    } else if (savedTab === 'quiz') {
      savedTab = 'read';
    }

    if (options && options.mode) {
      this.setData({ quizMode: options.mode });
    }

    this.scrollPositions = savedPositions;
    this.currentPageMap = savedPages;
    this.setData({ currentTab: savedTab });
    this.isRestoringScroll = true;

    if (savedTab === 'quiz') {
      setTimeout(() => this.initQuiz(), 100);
    }

    // 加载自定义背诵组，并把历史上可能按排序/条文号保存的标识迁移到稳定主键
    const rawCustomGroups = wx.getStorageSync(this.storageKey + '_custom_groups') || [];
    const customGroups = normalizeCustomGroups(rawCustomGroups, this.rawEntries);
    if (JSON.stringify(customGroups) !== JSON.stringify(rawCustomGroups)) {
      wx.setStorageSync(this.storageKey + '_custom_groups', customGroups);
    }

    // 加载方歌版本设置（仅方剂工具，按方剂记录）
    const formulaSongVersionKey = this.storageKey + '_formula_song_versions';
    let formulaSongVersions = {};
    if (this.data.toolType === 'fangji') {
      const savedVersions = wx.getStorageSync(formulaSongVersionKey);
      if (savedVersions && typeof savedVersions === 'object') {
        formulaSongVersions = savedVersions;
      }
    }

    // 获取默认等级过滤
    let defaultFilter = 'all';
    if (this.data.toolType === 'shanghan' || this.data.toolType === 'neijing' || this.data.toolType === 'jinkui' || this.data.toolType === 'wenbing') {
      defaultFilter = '1';
    }
    const initialFilter = options?.quizFilter || lastFilter || defaultFilter;

    // 排序方式
    const isWenbing = this.data.toolType === 'wenbing';
    const activeGroup = customGroups.find(g => g.id === lastGroupId);

    // 初始化标签过滤
    const availableTags = this._getAvailableTags(this.data.toolType);
    const tagFilterKey = this.storageKey + '_tag_filter';
    let tagFilter = wx.getStorageSync(tagFilterKey) || [];
    const tagFilterMap = buildTagFilterMap(tagFilter);
    const tagFilterSheet = buildTagFilterSheetState(this.data.toolType, tagFilter);

    this.setData({
      isFromMnemonic: options && options.from === 'mnemonic',
      targetNew: parseInt(options?.targetNew) || 5,
      filterType: isSearchEntryNavigation ? 'all' : initialFilter,
      sortType: isWenbing ? 'clause' : (this.data.sortType || 'textbook'),
      customGroups,
      activeGroupId: isSearchEntryNavigation ? '' : (activeGroup ? lastGroupId : ''),
      activeGroupName: isSearchEntryNavigation ? '' : (activeGroup ? activeGroup.name : ''),
      searchText: '',
      isSearchEntryNavigation,
      isFromSearchPage: isSearchEntryNavigation,
      searchTargetKey,
      formulaSongVersions,
      formulaSongVersionKey,
      formulaSongVersionSummary: this._calcFormulaSongVersionSummary(formulaSongVersions),
      availableTags,
      tagFilter,
      tagFilterMap,
      tagFilterSheet
    });

    this.refreshContentData(preparedPayload, history, savedTab);
  },

  prepareContentPayload(type, payload) {
    const getGroupColor = (groupStr) => {
      if (!groupStr) return 0;
      let hash = 0;
      for (let i = 0; i < groupStr.length; i++) {
        hash = groupStr.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash) % 10;
    };

    let tData = Array.isArray(payload?.entries) ? [...payload.entries] : [];
    if (type === 'fangji') {
      tData = tData.map((item, index) => ({
        ...item,
        clauseNum: item.clauseNum || index + 1,
        level: item.level || 1,
        title: item.title || item.name || `方剂 ${index + 1}`,
        text: item.text || `【组成】${item.composition || ''}\n【功效】${item.function || ''}`,
        note: item.note || `· 方歌：${item.formula_song_v1 || item.formula_song || item.composition_memo || ''}\n· 趣味：${item.function_memo || ''}`
      }));
    } else if (type === 'zhongyao') {
      tData = tData.map((item, index) => ({
        ...item,
        clauseNum: item.clauseNum || index + 1,
        level: 1,
        title: item.name || `中药 ${index + 1}`,
        colorTheme: getGroupColor(item.group),
        text: item.text || item.function || '',
        note: item.note || `【口诀】${item.memo || ''}\n【联想】${item.association || ''}`,
        zhongyao_memo: item.zhongyao_memo || item.memo || '',
        zhongyao_association: item.zhongyao_association || item.association || ''
      }));

      tData = tData.map((item, index, arr) => {
        const prev = arr[index - 1];
        const next = arr[index + 1];
        const isPrevSameGroup = prev && prev.group === item.group;
        const isNextSameGroup = next && next.group === item.group;

        let groupPos = 'single';
        if (isPrevSameGroup && isNextSameGroup) groupPos = 'mid';
        else if (isPrevSameGroup && !isNextSameGroup) groupPos = 'end';
        else if (!isPrevSameGroup && isNextSameGroup) groupPos = 'start';

        const isPrevSameChapter = prev && prev.chapter === item.chapter;
        const isPrevSameSection = prev && prev.section === item.section;

        return {
          ...item,
          groupPos,
          chapterPos: !isPrevSameChapter ? 'start' : 'mid',
          sectionPos: !isPrevSameSection ? 'start' : 'mid'
        };
      });
    }

    if (type === 'jinkui' || type === 'wenbing' || type === 'fangji') {
      tData = tData.map((item, index, arr) => {
        const prev = arr[index - 1];
        const isPrevSameChapter = prev && prev.chapter === item.chapter;
        const isPrevSameSection = prev && prev.section === item.section;
        return {
          ...item,
          chapterPos: !isPrevSameChapter ? 'start' : 'mid',
          sectionPos: !isPrevSameSection ? 'start' : 'mid'
        };
      });
    }

    this.rawEntries = tData.map((item, index) => {
      if (!item.clauseNum) item.clauseNum = index + 1;
      // 优先级：数据库 ID > 数据库 itemKey > 本地索引 ID
      item.uniqueKey = item.id || item.itemKey || item.item_key || `idx_${index}`;
      return item;
    });

    return {
      ...payload,
      config: payload?.config || {
        title: type,
        storageKey: `${type}_comments`,
        showLevels: this.shouldShowLevels(type)
      },
      entries: this.rawEntries
    };
  },

  refreshContentData(payload, nextHistory, nextTab) {
    let history = nextHistory || wx.getStorageSync(this.storageKey + '_history') || this.rawEntries.map(() => []);
    if (!Array.isArray(history) || history.length !== this.rawEntries.length) {
      history = this.rawEntries.map((_, index) => Array.isArray(history?.[index]) ? history[index] : []);
      wx.setStorageSync(this.storageKey + '_history', history);
    }
    const currentTab = nextTab || this.data.currentTab || 'read';

    this.setData({
      entries: this.getFilteredEntries().slice(0, this._getPageCount('read') * this.pageSize),
      history,
      currentTab
    }, () => {
      this.renderCatalog();
      this.renderRank();
      this.locateTargetEntry();

      const scrollKey = this._scrollKey(currentTab);
      if (this.data.isSearchEntryNavigation && currentTab === 'read') {
        this.setData({
          scrollTopVal: 0,
          showBackTop: false
        });
        this.scrollPositions[scrollKey] = 0;
        setTimeout(() => { this.isRestoringScroll = false; }, 100);
        return;
      }

      setTimeout(() => {
        this.setData({
          scrollTopVal: this.scrollPositions?.[scrollKey] || 0,
          showBackTop: (this.scrollPositions?.[scrollKey] || 0) > 800
        });
        setTimeout(() => { this.isRestoringScroll = false; }, 100);
      }, 50);
    });
  },

  findTargetEntryIndex(entries = []) {
    const targetKey = String(this.data.searchTargetKey || '').trim();
    if (!targetKey) return -1;

    return entries.findIndex((item) => {
      const candidateKeys = [
        item.uniqueKey,
        item.itemKey,
        item.item_key,
        item.id,
        item.clauseNum
      ]
        .map((value) => String(value || '').trim())
        .filter(Boolean);

      return candidateKeys.includes(targetKey);
    });
  },

  locateTargetEntry() {
    if (!this.data.isSearchEntryNavigation || this.data.currentTab !== 'read') {
      return;
    }

    const filteredEntries = this.getFilteredEntries();
    const targetIndex = this.findTargetEntryIndex(filteredEntries);
    if (targetIndex < 0) return;

    const targetPageCount = Math.max(1, Math.ceil((targetIndex + 1) / this.pageSize));
    if (this._getPageCount('read') < targetPageCount) {
      this._setPageCount('read', targetPageCount);
      this.setData({
        entries: filteredEntries.slice(0, targetPageCount * this.pageSize)
      }, () => {
        this.locateTargetEntry();
      });
      return;
    }

    this.scrollToTargetEntry(targetIndex);
  },

  scrollToTargetEntry(targetIndex, retryCount = 0) {
    const query = this.createSelectorQuery();
    query.select('.content-area').boundingClientRect();
    query.select(`#entry-${targetIndex}`).boundingClientRect();
    query.exec((res) => {
      const containerRect = res && res[0];
      const targetRect = res && res[1];

      if (!containerRect || !targetRect) {
        if (retryCount < 6) {
          setTimeout(() => {
            this.scrollToTargetEntry(targetIndex, retryCount + 1);
          }, 80);
        }
        return;
      }

      const scrollKey = this._scrollKey('read');
      const currentScrollTop = Number(this.scrollPositions?.[scrollKey] || 0);
      const nextScrollTop = Math.max(0, currentScrollTop + targetRect.top - containerRect.top - 16);

      this.setData({
        scrollTopVal: nextScrollTop,
        scrollIntoViewTarget: '',
        isSearchEntryNavigation: false
      });
      this.scrollPositions[scrollKey] = nextScrollTop;
    });
  },

  delay(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  },

  shouldShowLevels(type) {
    return type === 'shanghan' || type === 'neijing' || type === 'jinkui' || type === 'wenbing';
  },

  _scrollKey(tab) {
    const filter = this.data.filterType || 'all';
    return tab + '_' + filter;
  },

  // === 获取当前tab+filter的分页数 ===
  _getPageCount(tab) {
    const key = this._scrollKey(tab);
    return this.currentPageMap[key] || 1;
  },

  // === 设置当前tab+filter的分页数 ===
  _setPageCount(tab, val) {
    const key = this._scrollKey(tab);
    this.currentPageMap[key] = val;
  },

  // === 切换 Tab ===
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;

    this.isRestoringScroll = true;

    this.setData({ currentTab: tab }, () => {
      if (tab === 'catalog') {
        this.renderCatalog();
      } else if (tab === 'rank') {
        this.renderRank();
      } else if (tab === 'quiz') {
        this.initQuiz();
      } else if (tab === 'read') {
        this.setData({ entries: this.getFilteredEntries().slice(0, this._getPageCount('read') * this.pageSize) });
      }

      const scrollKey = this._scrollKey(tab);
      // 切换 Tab 时重置复习进度
      if (tab === 'quiz') {
        this.setData({ reviewedIndices: [], quizStack: [] });
      }
      setTimeout(() => {
        this.setData({
          scrollTopVal: this.scrollPositions[scrollKey] || 0,
          showBackTop: (this.scrollPositions[scrollKey] || 0) > 800
        });
        setTimeout(() => { this.isRestoringScroll = false; }, 100);
      }, 50);
    });
  },

  // === 获取筛选+排序后的数据 ===
  getFilteredEntries() {
    const { filterType, sortType, activeGroupId, customGroups, searchText } = this.data;
    let list = this.rawEntries; // rawEntries 已物理排序为 clauseNum 顺序

    // 背诵组过滤：如果激活了某个背诵组，只显示该组内的条文
    if (activeGroupId) {
      const group = customGroups.find(g => g.id === activeGroupId);
      if (group && group.clauseNums) {
        const keySet = new Set(group.clauseNums.map(String));
        list = list.filter(item => keySet.has(String(item.uniqueKey)));
      }
    }

    // 搜索过滤
    if (searchText) {
      const kw = searchText.toLowerCase();
      list = list.filter(item =>
        (item.title || "").toLowerCase().includes(kw) ||
        (item.text || "").toLowerCase().includes(kw) ||
        (item.name || "").toLowerCase().includes(kw)
      );
    }

    // 等级过滤 (仅在未激活背诵组时生效)
    if (!activeGroupId && filterType !== 'all') {
      list = list.filter(item => String(item.level) === filterType);
    }
    // 一级 + 课本序：按 textbookOrder 排序
    if (filterType === '1' && sortType === 'textbook') {
      list = [...list].sort((a, b) => (a.textbookOrder ?? 999) - (b.textbookOrder ?? 999));
    }
    // 其余情况（全部/二级/一级编号序）保持 clauseNum 物理顺序

    // 中药工具特殊处理：动态计算组别位置 (确保搜索结果显示正确)
    if (this.data.toolType === 'zhongyao') {
      list = list.map((item, index, arr) => {
        const prev = arr[index - 1];
        const next = arr[index + 1];
        const isPrevSame = prev && prev.group === item.group;
        const isNextSame = next && next.group === item.group;

        let groupPos = 'single';
        if (isPrevSame && isNextSame) groupPos = 'mid';
        else if (isPrevSame && !isNextSame) groupPos = 'end';
        else if (!isPrevSame && isNextSame) groupPos = 'start';

        return { ...item, groupPos };
      });
    }

    if (this.data.toolType === 'jinkui' || this.data.toolType === 'wenbing' || this.data.toolType === 'fangji' || this.data.toolType === 'zhongyao') {
      list = list.map((item, index, arr) => {
        const prev = arr[index - 1];
        const isPrevSameChapter = prev && prev.chapter === item.chapter;
        const isPrevSameSection = prev && prev.section === item.section;
        let chapterPos = !isPrevSameChapter ? 'start' : 'mid';
        let sectionPos = !isPrevSameSection ? 'start' : 'mid';
        return { ...item, chapterPos, sectionPos };
      });
    }

    return list;
  },

  // === 切换等级筛选 ===
  setFilter(e) {
    const type = e.currentTarget.dataset.type;
    if (this.data.filterType === type) return;

    this.isRestoringScroll = true;

    this.setData({ filterType: type }, () => {
      wx.setStorageSync(this.storageKey + '_last_filter', type);
      const tab = this.data.currentTab;
      if (tab === 'catalog') this.renderCatalog();
      if (tab === 'rank') this.renderRank();
      if (tab === 'read') {
        this.setData({ entries: this.getFilteredEntries().slice(0, this._getPageCount('read') * this.pageSize) });
      }
      if (tab === 'quiz') {
        this.setData({ reviewedIndices: [], quizStack: [] });
        this.nextQuiz();
      }

      // 恢复目标filter的滚动位置
      const scrollKey = this._scrollKey(tab);
      setTimeout(() => {
        this.setData({
          scrollTopVal: this.scrollPositions[scrollKey] || 0,
          showBackTop: (this.scrollPositions[scrollKey] || 0) > 800
        });
        setTimeout(() => { this.isRestoringScroll = false; }, 100);
      }, 50);
    });
  },

  // === 切换排序方式 ===
  toggleSort() {
    const newSort = this.data.sortType === 'textbook' ? 'clause' : 'textbook';
    this._setPageCount('read', 1);
    this._setPageCount('catalog', 1);
    this.setData({ sortType: newSort }, () => {
      if (this.data.currentTab === 'catalog') this.renderCatalog();
      if (this.data.currentTab === 'rank') this.renderRank();
      if (this.data.currentTab === 'read') {
        this.setData({ entries: this.getFilteredEntries().slice(0, this._getPageCount('read') * this.pageSize) });
      }
    });
  },

  toggleFilterModal() {
    this.setData({ showFilterModal: !this.data.showFilterModal });
  },

  setFilterAndClose(e) {
    this.setFilter(e);
    this.setData({ showFilterModal: false });
  },

  toggleSortAndClose(e) {
    // 兼容通过 dataset 传递 sort 的情况
    const sort = e.currentTarget.dataset.sort;
    if (sort) {
      if (this.data.sortType !== sort) {
        this.toggleSort();
      }
    } else {
      this.toggleSort();
    }
    this.setData({ showFilterModal: false });
  },

  toggleExpandAllAndClose() {
    this.toggleExpandAll();
    this.setData({ showFilterModal: false });
  },

  handleSearch(e) {
    const val = e.detail.value.trim().toLowerCase();
    this._setPageCount('read', 1);
    this._setPageCount('catalog', 1);
    this.setData({ searchText: val });
    // 更新通读视图
    this.setData({ entries: this.getFilteredEntries().slice(0, this._getPageCount('read') * this.pageSize) });
    this.renderCatalog();
  },

  toggleSearch() {
    const show = !this.data.showSearchBox;
    if (!show && this.data.searchText) {
      // 关闭搜索框时清空搜索词并刷新
      this._setPageCount('read', 1);
      this._setPageCount('catalog', 1);
      this.setData({ showSearchBox: false, searchText: '' });
      this.setData({ entries: this.getFilteredEntries().slice(0, this._getPageCount('read') * this.pageSize) });
      this.renderCatalog();
    } else {
      this.setData({ showSearchBox: show });
    }
  },

  clearSearch() {
    this._setPageCount('read', 1);
    this._setPageCount('catalog', 1);
    this.setData({ searchText: '' });
    this.setData({ entries: this.getFilteredEntries().slice(0, this._getPageCount('read') * this.pageSize) });
    this.renderCatalog();
  },

  renderCatalog() {
    const { history, searchText, filterType, sortType, displayList } = this.data;
    if (!this.rawEntries || !history) return;

    let source = this.rawEntries; // rawEntries 已物理排序为 clauseNum 顺序
    // 一级 + 课本序：按 textbookOrder 排序
    if (filterType === '1' && sortType === 'textbook') {
      source = [...this.rawEntries].sort((a, b) => (a.textbookOrder ?? 999) - (b.textbookOrder ?? 999));
    }

    // 背诵组过滤
    if (this.data.activeGroupId) {
      const group = this.data.customGroups.find(g => g.id === this.data.activeGroupId);
      if (group && group.clauseNums) {
        const keySet = new Set(group.clauseNums.map(String));
        source = source.filter(item => keySet.has(String(item.uniqueKey)));
      }
    }

    // 保存之前的展开状态
    const previousStates = {};
    if (displayList && displayList.length > 0) {
      displayList.forEach(item => {
        previousStates[item.uniqueKey] = {
          showText: item.showText,
          showNote: item.showNote
        };
      });
    }

    let list = source.map((item, _) => {

      const originalIndex = this.rawEntries.indexOf(item);
      const h = history[originalIndex] || [];
      const lastRecord = h.length > 0 ? h[h.length - 1] : null;
      const lastIsWin = lastRecord !== null ? (typeof lastRecord === 'boolean' ? lastRecord : lastRecord.r) : false;
      const statusClass = h.length > 0 ? (lastIsWin ? 'win' : 'loss') : '';

      // 等级过滤 (仅在未激活背诵组时生效)
      if (!this.data.activeGroupId && filterType !== 'all' && String(item.level) !== filterType) return null;

      // 搜索过滤
      if (searchText) {
        if (!item.title.toLowerCase().includes(searchText) && !item.text.toLowerCase().includes(searchText)) {
          return null;
        }
      }

      // 保留之前的展开状态
      const previousState = previousStates[item.uniqueKey] || {};

      return {
        ...item,
        originalIndex: originalIndex,
        historyDots: h,
        statusClass: statusClass,
        scrollLeftVal: h.length * 50,
        showText: previousState.showText || false,
        showNote: previousState.showNote || false
      };
    }).filter(item => item !== null);

    this.allCatalogList = list;
    this.setData({ displayList: this.allCatalogList.slice(0, this._getPageCount('catalog') * this.pageSize) });
  },

  toggleExpand(e) {
    const { index, type } = e.currentTarget.dataset;
    const list = this.data.displayList;
    const target = list[index];

    if (type === 'text') target.showText = !target.showText;
    if (type === 'note') target.showNote = !target.showNote;

    this.setData({ [`displayList[${index}]`]: target });
  },

  renderRank() {
    const { history, filterType, activeGroupId, customGroups, rankList } = this.data;
    if (!this.rawEntries || !history) return;

    let items = this.rawEntries.map((item, index) => ({ item, index }))
      .filter(x => (history[x.index] || []).length > 0);

    // 背诵组过滤
    if (activeGroupId) {
      const group = customGroups.find(g => g.id === activeGroupId);
      if (group && group.clauseNums) {
        const keySet = new Set(group.clauseNums.map(String));
        items = items.filter(x => keySet.has(String(x.item.uniqueKey)));
      }
    }

    // 加入等级过滤 (仅在未激活背诵组时生效)
    if (!activeGroupId && filterType !== 'all') {
      items = items.filter(x => String(x.item.level) === filterType);
    }

    // 保存之前的展开状态
    const previousStates = {};
    if (rankList && rankList.length > 0) {
      rankList.forEach(item => {
        previousStates[item.uniqueKey] = {
          showText: item.showText,
          showNote: item.showNote
        };
      });
    }

    items.sort((a, b) => {
      const ha = history[a.index];
      const hb = history[b.index];
      let lastA = ha[ha.length - 1];
      lastA = typeof lastA === 'boolean' ? lastA : lastA.r;
      let lastB = hb[hb.length - 1];
      lastB = typeof lastB === 'boolean' ? lastB : lastB.r;

      if (lastA !== lastB) return lastA ? 1 : -1;

      const errorsA = ha.filter(x => (typeof x === 'boolean' ? !x : !x.r)).length;
      const errorsB = hb.filter(x => (typeof x === 'boolean' ? !x : !x.r)).length;
      const rateA = errorsA / ha.length;
      const rateB = errorsB / hb.length;
      if (rateA !== rateB) return rateB - rateA;

      return hb.length - ha.length;
    });

    const rankDisplay = items.map(obj => {
      const h = history[obj.index];
      const lastRecord = h[h.length - 1];
      const lastIsWin = typeof lastRecord === 'boolean' ? lastRecord : lastRecord.r;
      
      // 保留之前的展开状态
      const previousState = previousStates[obj.item.uniqueKey] || {};
      
      return {
        ...obj.item,
        originalIndex: obj.index,
        historyDots: h,
        statusClass: lastIsWin ? 'win' : 'loss',
        scrollLeftVal: h.length * 50,
        showText: previousState.showText || false,
        showNote: previousState.showNote || false
      };
    });

    this.allRankList = rankDisplay;
    this.setData({ rankList: this.allRankList.slice(0, this._getPageCount('rank') * this.pageSize) });
  },

  toggleRankExpand(e) {
    const { index, type } = e.currentTarget.dataset;
    const target = this.data.rankList[index];
    if (type === 'text') target.showText = !target.showText;
    if (type === 'note') target.showNote = !target.showNote;
    this.setData({ [`rankList[${index}]`]: target });
  },

  // === 一键展开/隐藏全部 ===
  toggleExpandAll() {
    const tab = this.data.currentTab;
    const nextState = !this.data.isAllExpanded;
    const toolType = this.data.toolType;

    const hasNoteContent = (item) => {
      if (toolType === 'fangji') return Boolean(item.formula_song_v1 || item.formula_song || item.composition_memo || item.function_memo);
      if (toolType === 'zhongyao') return Boolean(item.zhongyao_memo || item.zhongyao_association);
      const hasNoteStr = typeof item.note === 'string' ? item.note.trim().length > 0 : Boolean(item.note);
      const hasCustomNotes = Array.isArray(item.customNotes) ? item.customNotes.length > 0 : Boolean(item.customNotes);
      return hasNoteStr || hasCustomNotes;
    };

    if (tab === 'catalog') {
      const list = this.data.displayList.map(item => {
        return { ...item, showText: nextState, showNote: nextState && hasNoteContent(item) };
      });
      if (this.allCatalogList) {
        this.allCatalogList = this.allCatalogList.map(item => {
          return { ...item, showText: nextState, showNote: nextState && hasNoteContent(item) };
        });
      }
      this.setData({ displayList: list, isAllExpanded: nextState });
    } else if (tab === 'rank') {
      const list = this.data.rankList.map(item => {
        return { ...item, showText: nextState, showNote: nextState && hasNoteContent(item) };
      });
      if (this.allRankList) {
        this.allRankList = this.allRankList.map(item => {
          return { ...item, showText: nextState, showNote: nextState && hasNoteContent(item) };
        });
      }
      this.setData({ rankList: list, isAllExpanded: nextState });
    }
  },

  // === 触底加载下一页 ===
  loadMoreCards() {
    if (this._isLoadingMore) return;
    const tab = this.data.currentTab;
    let targetData = null;
    let targetAll = null;

    if (tab === 'catalog' || tab === 'read') {
      targetData = tab === 'read' ? 'entries' : 'displayList';
      targetAll = tab === 'read' ? this.getFilteredEntries() : this.allCatalogList;
    } else if (tab === 'rank') {
      targetData = 'rankList';
      targetAll = this.allRankList;
    }

    if (!targetAll || this.data[targetData].length >= targetAll.length) return;

    this._isLoadingMore = true;
    const newPage = this._getPageCount(tab) + 1;
    this._setPageCount(tab, newPage);
    this.setData({
      [targetData]: targetAll.slice(0, newPage * this.pageSize)
    }, () => {
      this._isLoadingMore = false;
    });
  },

  // 优化滚动事件处理，取消频繁setData带来的卡顿
  onScroll(e) {
    if (this.isRestoringScroll) return;
    if (!this.scrollPositions) this.scrollPositions = {};
    const scrollTop = e.detail.scrollTop;
    const scrollKey = this._scrollKey(this.data.currentTab);
    this.scrollPositions[scrollKey] = scrollTop;

    const threshold = 800;
    if (scrollTop > threshold && !this.data.showBackTop) {
      this.setData({ showBackTop: true });
    } else if (scrollTop <= threshold && this.data.showBackTop) {
      this.setData({ showBackTop: false });
    }
  },

  scrollToTop() {
    const scrollKey = this._scrollKey(this.data.currentTab);
    this.setData({
      scrollTopVal: this.scrollPositions[scrollKey] || 0
    }, () => {
      this.setData({ scrollTopVal: 0, showBackTop: false });
      this.scrollPositions[scrollKey] = 0;
    });
  },

  onScroll(e) {
    if (this.isRestoringScroll) return;
    const { scrollTop } = e.detail;
    const tab = this.data.currentTab;
    const filter = this.data.filterType || 'all';
    const key = tab + '_' + filter;
    
    if (!this.scrollPositions) this.scrollPositions = {};
    this.scrollPositions[key] = scrollTop;

    // 控制“回到顶部”按钮显示
    if (scrollTop > 800 && !this.data.showBackTop) {
      this.setData({ showBackTop: true });
    } else if (scrollTop <= 800 && this.data.showBackTop) {
      this.setData({ showBackTop: false });
    }
  },

  loadMoreCards() {
    const tab = this.data.currentTab;
    if (tab === 'quiz') return;

    const pageCount = this._getPageCount(tab);
    const filtered = this.getFilteredEntries();
    
    // 如果已经加载完全部数据，则不再增加
    if (pageCount * this.pageSize >= filtered.length && tab === 'read') return;
    if (tab === 'catalog' && this.allCatalogList && pageCount * this.pageSize >= this.allCatalogList.length) return;
    if (tab === 'rank' && this.allRankList && pageCount * this.pageSize >= this.allRankList.length) return;

    const nextPageCount = pageCount + 1;
    this._setPageCount(tab, nextPageCount);

    if (tab === 'read') {
      this.setData({
        entries: filtered.slice(0, nextPageCount * this.pageSize)
      });
    } else if (tab === 'catalog') {
      this.setData({
        displayList: this.allCatalogList.slice(0, nextPageCount * this.pageSize)
      });
    } else if (tab === 'rank') {
      this.setData({
        rankList: this.allRankList.slice(0, nextPageCount * this.pageSize)
      });
    }
  },

  scrollToTop() {
    this.setData({ scrollTopVal: 0, showBackTop: false });
    const tab = this.data.currentTab;
    const filter = this.data.filterType || 'all';
    const key = tab + '_' + filter;
    if (this.scrollPositions) {
      this.scrollPositions[key] = 0;
    }
  },

  saveScroll() {
    if (this.scrollPositions) {
      wx.setStorageSync(this.storageKey + '_scroll_positions', this.scrollPositions);
      wx.setStorageSync(this.storageKey + '_saved_pages', this.currentPageMap);
      wx.setStorageSync(this.storageKey + '_last_tab', this.data.currentTab);
    }
  },

  onHide() { this.saveScroll(); this._reportDuration(); },
  onUnload() { this.saveScroll(); this._reportDuration(); },

  recordResult(e) {
    const { index, result } = e.currentTarget.dataset;
    this.recordLogic(index, result);
    if (this.data.currentTab === 'catalog') this.renderCatalog();
    if (this.data.currentTab === 'rank') this.renderRank();
  },

  recordLogic(index, isWin) {
    let history = this.data.history;
    if (!history[index]) history[index] = [];

    // 兼容旧数据
    if (history[index].length > 0 && typeof history[index][0] === 'boolean') {
      history[index] = this._migrateHistoryItem(history[index]);
    }

    const isFirstTime = history[index].length === 0;

    // 计算新阶段
    let lastStage = 0;
    if (!isFirstTime) {
      lastStage = history[index][history[index].length - 1].s || 0;
    }

    // 记得则阶数+1，忘记则归零
    const newStage = isWin ? Math.min(lastStage + 1, 8) : 0;
    const nextInterval = EBBINGHAUS_INTERVALS[newStage];
    const now = Date.now();

    const newRecord = {
      t: now,             // Time
      r: isWin,           // Result
      s: newStage,        // Stage
      d: now + nextInterval // Due date
    };

    history[index].push(newRecord);
    this.setData({ history });
    wx.setStorageSync(this.storageKey + '_history', history);

    // 同步更新“随时背”的今日进度
    if (this.data.isFromMnemonic && isWin) {
      this._updateMnemonicStats(isFirstTime ? 'new' : 'review');
      if (isFirstTime) {
        this._checkGoalReached();
      }
    }
  },

  // 检查是否达到今日新学目标
  _checkGoalReached() {
    const today = new Date().toISOString().split('T')[0];
    const popupShownKey = 'mnemonic_goal_popup_shown_' + this.data.toolType + '_' + today;

    // 如果今天已经弹过窗了，就不再弹
    if (wx.getStorageSync(popupShownKey)) {
      return;
    }

    const stats = wx.getStorageSync('mnemonic_today_stats_' + this.data.toolType + '_' + today) || { new: 0, review: 0 };
    const target = this.data.targetNew || 5;

    if (stats.new >= target) {
      wx.setStorageSync(popupShownKey, true);
      wx.showModal({
        title: '每日计划已达标！',
        content: `恭喜！您已完成今日设定的 ${target} 条新学任务。`,
        confirmText: '知道了',
        showCancel: false
      });
    }
  },

  _updateMnemonicStats(type) {
    const today = new Date().toISOString().split('T')[0];
    const statsKey = 'mnemonic_today_stats_' + this.data.toolType + '_' + today;
    const stats = wx.getStorageSync(statsKey) || { new: 0, review: 0 };
    if (type === 'new') stats.new++;
    else stats.review++;
    wx.setStorageSync(statsKey, stats);
  },

  resetSingle(e) {
    const index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '重置',
      content: '确定重置这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          let history = this.data.history;
          history[index] = [];
          this.setData({ history });
          wx.setStorageSync(this.storageKey + '_history', history);

          if (this.data.currentTab === 'catalog') this.renderCatalog();
          if (this.data.currentTab === 'rank') this.renderRank();
        }
      }
    });
  },

  resetAll() {
    wx.showModal({
      title: '⚠️ 危险操作',
      content: '确定要清空所有背诵进度吗？',
      confirmColor: '#ff3b30',
      success: (res) => {
        if (res.confirm) {
          const newHistory = this.rawEntries.map(() => []);
          this.setData({ history: newHistory });
          wx.setStorageSync(this.storageKey + '_history', newHistory);

          if (this.data.currentTab === 'catalog') this.renderCatalog();
          if (this.data.currentTab === 'rank') this.renderRank();

          wx.showToast({ title: '已全部清空', icon: 'success' });
        }
      }
    });
  },

  initQuiz() {
    this.nextQuiz();
  },

  nextQuiz() {
    const { history, lastQuizIndex, filterType, quizMode, quizIndex, quizStack } = this.data;
    const fullEntries = this.rawEntries;

    // 记录历史，用于“上一题”
    if (quizIndex >= 0) {
      let newStack = quizStack || [];
      // 避免重复压入同一个索引（例如点击“忘了”后再次点击“下一题”）
      if (newStack.length === 0 || newStack[newStack.length - 1] !== quizIndex) {
        newStack.push(quizIndex);
        // 限制栈大小，防止内存占用过高（如最多保留50条）
        if (newStack.length > 50) newStack.shift();
        this.setData({ quizStack: newStack });
      }
    }

    // 如果当前是学习模式，且是从上一题跳过来的（即 quizIndex >= 0），自动记录为“记得”
    if (quizMode === 'study' && quizIndex >= 0) {
      this.recordLogic(quizIndex, true);
    }

    // 根据 quizFilter 筛选可用索引
    let validIndices = [];
    const isReviewMode = this.data.quizMode === 'review';
    const reviewedIndices = this.data.reviewedIndices || [];

    let historyCountValidForFilter = 0;

    // 背诵组过滤
    let groupKeySet = null;
    if (this.data.activeGroupId) {
      const group = this.data.customGroups.find(g => g.id === this.data.activeGroupId);
      if (group && group.clauseNums) {
        groupKeySet = new Set(group.clauseNums.map(String));
      }
    }

    fullEntries.forEach((entry, i) => {
      if (groupKeySet && !groupKeySet.has(String(entry.uniqueKey))) return; // 背诵组过滤
      if (!this.data.activeGroupId && filterType !== 'all' && String(entry.level) !== filterType) return;

      // 如果是复习模式
      if (isReviewMode) {
        // 1. 要求必须有历史记录
        if (!history[i] || history[i].length === 0) return;
        historyCountValidForFilter++;
        // 2. 必须是本轮还没复习过的
        if (reviewedIndices.includes(i)) return;
      }

      validIndices.push(i);
    });

    if (validIndices.length === 0) {
      if (isReviewMode && historyCountValidForFilter > 0) {
        this.setData({ reviewedIndices: [] });
        const today = new Date().toISOString().split('T')[0];
        const popupShownKey = 'mnemonic_review_done_' + this.data.toolType + '_' + today;
        if (!wx.getStorageSync(popupShownKey)) {
          wx.showModal({
            title: '复习完成！',
            content: '本轮所有学过的条目已复习完毕。接下来将自动开启自由复习模式，您可以继续巩固。',
            showCancel: false,
            confirmText: '知道了',
            success: () => {
              wx.setStorageSync(popupShownKey, true);
              this.nextQuiz();
            }
          });
        } else {
          this.nextQuiz();
        }
      } else if (isReviewMode && historyCountValidForFilter === 0) {
        wx.showToast({ title: '当前暂无可复习内容', icon: 'none' });
      }
      return;
    }

    // 过滤掉最近刚复习过的题目，防止刚答错马上又出
    let recent = this.data.recentQuizIndices || [];
    let availableIndices = validIndices.filter(i => !recent.includes(i));
    if (availableIndices.length === 0) {
      availableIndices = validIndices.filter(i => i !== lastQuizIndex);
      if (availableIndices.length === 0) availableIndices = validIndices;
    }

    // 如果是复习模式，启动艾宾浩斯筛选与加权
    let isFreeReview = false;
    if (isReviewMode) {
      const reviewPool = this._getEbbinghausReviewPool(availableIndices, fullEntries, history, this.data.isConsolidation);
      if (reviewPool.length === 0) {
        // 如果没到期的，则进入“自由复习”模式，基于已学的所有条目随机展示
        isFreeReview = true;
      } else {
        // 取权重前5名作为随机池
        availableIndices = reviewPool.slice(0, 5);
      }
    }

    let poolWrong = [];
    let poolNew = [];
    let poolReview = [];

    availableIndices.forEach(i => {
      const h = history[i] || [];
      if (h.length === 0) {
        poolNew.push(i);
      } else {
        let lastVal = h[h.length - 1];
        lastVal = typeof lastVal === 'boolean' ? lastVal : lastVal.r;
        if (lastVal === false) poolWrong.push(i);
        else poolReview.push(i);
      }
    });

    let finalPool = [];
    const rand = Math.random();

    if (poolWrong.length > 0 && rand < 0.6) finalPool = poolWrong;
    else if (poolNew.length > 0 && rand < 0.9) finalPool = poolNew;
    else if (poolReview.length > 0) finalPool = poolReview;
    else finalPool = poolWrong.length > 0 ? poolWrong : (poolNew.length > 0 ? poolNew : poolReview);

    if (!finalPool || finalPool.length === 0) finalPool = [validIndices[0]];

    const nextIdx = finalPool[Math.floor(Math.random() * finalPool.length)];
    const h = history[nextIdx] || [];
    const isStudyMode = this.data.quizMode === 'study';

    recent.push(nextIdx);
    if (recent.length > 3) recent.shift();

    let statusText = h.length > 0 ? `复习第 ${h.length + 1} 次` : '首次遇见';
    if (isStudyMode) statusText = '学习模式';
    else if (isReviewMode) {
      statusText = isFreeReview ? `自由复习模式 (${h.length}次记录)` : `复习中 (${h.length}次记录)`;
    }

    this.setData({
      quizIndex: nextIdx,
      lastQuizIndex: nextIdx,
      recentQuizIndices: recent,
      quizItem: fullEntries[nextIdx],
      quizStatusText: statusText,
      quizShowAnswer: false,
      quizShowNote: false,
      quizAnswerButtonText: this._getAnswerButtonText(fullEntries[nextIdx], false),
      quizNoteButtonText: this._getFormulaButtonText(fullEntries[nextIdx], false),
      quizFinishedRound: false
    });
  },

  // 艾宾浩斯核心：复习池筛选与加权排序
  // 复习逻辑说明：
  // 1. 基于 8 阶时间梯度：0.5h, 12h, 1d, 2d, 4d, 7d, 15d, 31d
  // 2. recordLogic 中根据 '记得' 推进 Stage，'忘记' 归零
  // 3. 正常模式：now >= d (到期时间) 才进入复习池
  // 4. 巩固模式 (isConsolidation)：允许复习 Stage 1 (30分钟内) 的当日新学条目
  _getEbbinghausReviewPool(indices, fullEntries, history, isConsolidation = false) {
    const now = Date.now();
    let pool = [];

    indices.forEach(idx => {
      let h = history[idx] || [];
      // 兼容旧数据映射
      if (h.length > 0 && typeof h[0] === 'boolean') {
        h = this._migrateHistoryItem(h);
      }

      if (h.length === 0) return;

      const last = h[h.length - 1];
      const due = last.d || 0;

      // 物理判定：是否已到期？
      // 优化：如果是“即时巩固模式”，且是 Stage 1 (刚学的)，允许放行
      let isDue = now >= due;
      if (!isDue && isConsolidation && last.s === 1) {
        isDue = true;
      }

      if (!isDue) return;

      // 计算权重 ... (保持原有权重算法)
      let weight = 0;
      const entry = fullEntries[idx];

      // 1. 等级权重 (一级优先)
      if (String(entry.level) === '1') weight += 500;

      // 2. 错误权重 (历史错误次数)
      const errorCount = h.filter(record => record.r === false).length;
      weight += errorCount * 100;

      // 3. 逾期紧迫度 (逾期时间越长权重越高)
      const overdueTime = now - due;
      weight += Math.min(overdueTime / 3600000, 1000); // 每小时增加1分，封顶1000分

      pool.push({ index: idx, weight });
    });

    // 按权重由高到低排序
    return pool.sort((a, b) => b.weight - a.weight).map(p => p.index);
  },

  _migrateHistoryItem(boolArray) {
    // 将旧的 [true, false] 转换为新格式
    return boolArray.map((r, i) => ({
      t: Date.now() - (boolArray.length - i) * 86400000, // 伪造历史时间
      r: r,
      s: r ? 1 : 0,
      d: Date.now() // 设为立即到期
    }));
  },

  // === 抽查筛选切换 ===
  _getFormulaNames(item) {
    if (!item || !Array.isArray(item.customNotes)) return [];
    const names = item.customNotes
      .filter(note => note && note.isTitle && note.label)
      .map(note => String(note.label).trim())
      .filter(Boolean);
    return [...new Set(names)];
  },

  _getFormulaButtonText(item, expanded = false) {
    if (expanded) return '隐藏方剂';
    const names = this._getFormulaNames(item);
    if (names.length === 1) return `显示方剂：${names[0]}`;
    if (names.length > 1) return `显示方剂：${names[0]}等`;
    if (item && this.data.toolType === 'fangji' && item.title) return `显示方剂：${item.title}`;
    return '显示方剂';
  },

  _getAnswerButtonText(item, expanded = false) {
    if (this.data.toolType === 'fangji') {
      return this._getFormulaButtonText(item, expanded);
    }
    return expanded ? '隐藏原文' : '查看原文';
  },

  // === “上一题”功能 ===
  backQuiz() {
    let { quizStack, history } = this.data;
    if (!quizStack || quizStack.length === 0) return;

    const prevIdx = quizStack.pop();
    const h = history[prevIdx] || [];
    const isStudyMode = this.data.quizMode === 'study';

    let statusText = h.length > 0 ? `复习第 ${h.length} 次` : '首次遇见';
    if (isStudyMode) statusText = '学习模式';
    else if (this.data.quizMode === 'review') {
      statusText = `复习中 (${h.length}次记录)`;
    }

    this.setData({
      quizIndex: prevIdx,
      lastQuizIndex: prevIdx,
      quizItem: this.rawEntries[prevIdx],
      quizStatusText: statusText,
      quizShowAnswer: false,
      quizShowNote: false,
      quizAnswerButtonText: this._getAnswerButtonText(this.rawEntries[prevIdx], false),
      quizNoteButtonText: this._getFormulaButtonText(this.rawEntries[prevIdx], false),
      quizFinishedRound: false,
      quizStack: quizStack
    });
  },

  toggleQuizPeek() {
    const quizShowAnswer = !this.data.quizShowAnswer;
    this.setData({
      quizShowAnswer,
      quizAnswerButtonText: this._getAnswerButtonText(this.data.quizItem, quizShowAnswer)
    });
  },

  toggleQuizNote() {
    const quizShowNote = !this.data.quizShowNote;
    this.setData({
      quizShowNote,
      quizNoteButtonText: this._getFormulaButtonText(this.data.quizItem, quizShowNote)
    });
  },

  handleQuizResult(e) {
    const isWin = e.currentTarget.dataset.result;
    const { quizIndex, quizMode } = this.data;

    this.recordLogic(quizIndex, isWin);

    // 如果是复习模式，且【记得】了，才记录为已复习。答错的会在此轮重复出现直到答对。
    if (quizMode === 'review') {
      let reviewed = this.data.reviewedIndices;
      if (isWin && !reviewed.includes(quizIndex)) {
        reviewed.push(quizIndex);
        this.setData({ reviewedIndices: reviewed });
      }
    }

    if (isWin) {
      this.nextQuiz();
    } else {
      this.setData({
        quizFinishedRound: true,
        quizShowAnswer: true
      });
    }
  },


  // 返回主页 (优化：来自随时背则直接返回，保留 Tab 状态)
  backToHome() {
    const pages = getCurrentPages()
    if (pages.length === 1) {
      // 从分享卡片进入，跳转到首页
      wx.switchTab({ url: '/pages/index/index' })
    } else if (this.data.isFromSearchPage) {
      wx.navigateBack();
    } else if (this.data.isFromMnemonic) {
      wx.navigateBack();
    } else {
      wx.switchTab({ url: '/pages/index/index' });
    }
  },

  // === 自定义背诵组功能 ===
  closeGroupCreate() {
    const fromActionSheet = this._fromActionSheet;
    this._editingGroupId = null;
    this._fromActionSheet = false;
    this.setData({
      showGroupCreate: false,
      showActionSheet: fromActionSheet, // 如果从更多操作弹窗打开，则重新显示
      newGroupName: '',
      groupNameError: false,
      groupSelectItems: [],
      groupSelectedCount: 0,
      groupSearchText: ''
    });
  },

  // 进入新建背诵组模式
  onNewGroup() {
    // 构建勾选列表
    const groupSelectItems = this.rawEntries.map(item => ({
      uniqueKey: item.uniqueKey,
      clauseNum: item.clauseNum,
      title: item.title || item.name || `条文 ${item.clauseNum}`,
      text: (item.text || '').substring(0, 40),
      level: item.level,
      selected: false
    }));
    // 保存原始列表
    this.originalGroupSelectItems = groupSelectItems;
    this.setData({
      showGroupCreate: true,
      newGroupName: '',
      groupNameError: false,
      groupSelectItems,
      groupSearchText: '',
      groupSelectedCount: 0
    });
  },

  // 组名输入
  onGroupNameInput(e) {
    const nextName = e.detail.value.trim();
    this.setData({
      newGroupName: nextName,
      groupNameError: !nextName
    });
  },

  // 勾选条文搜索
  onGroupSearchInput(e) {
    const searchText = e.detail.value.trim().toLowerCase();
    this.setData({ groupSearchText: searchText });
    
    // 过滤列表
    if (this.originalGroupSelectItems) {
      const filteredItems = this.originalGroupSelectItems.filter(item => {
        if (!searchText) return true;
        const title = (item.title || '').toLowerCase();
        const text = (item.text || '').toLowerCase();
        return title.includes(searchText) || text.includes(searchText);
      });
      this.setData({ groupSelectItems: filteredItems });
    }
  },

  // 勾选/取消某条文
  toggleGroupItem(e) {
    const key = String(e.currentTarget.dataset.key);
    const list = this.data.groupSelectItems;
    const idx = list.findIndex(item => String(item.uniqueKey) === key);
    if (idx === -1) return;

    const newVal = !list[idx].selected;
    this.setData({
      [`groupSelectItems[${idx}].selected`]: newVal,
      groupSelectedCount: this.data.groupSelectedCount + (newVal ? 1 : -1)
    });
  },

  // 全选/取消全选（仅对当前搜索可见的条目）
  toggleSelectAllGroup() {
    const { groupSelectItems, groupSearchText } = this.data;
    const kw = groupSearchText.toLowerCase();

    // 获取当前可见的条目
    const visibleIndices = [];
    groupSelectItems.forEach((item, idx) => {
      if (!kw || item.title.toLowerCase().includes(kw) || item.text.toLowerCase().includes(kw)) {
        visibleIndices.push(idx);
      }
    });

    // 判断可见项是否全选
    const allSelected = visibleIndices.every(idx => groupSelectItems[idx].selected);
    const newList = [...groupSelectItems];
    let count = this.data.groupSelectedCount;

    visibleIndices.forEach(idx => {
      if (allSelected) {
        if (newList[idx].selected) count--;
        newList[idx].selected = false;
      } else {
        if (!newList[idx].selected) count++;
        newList[idx].selected = true;
      }
    });

    this.setData({ groupSelectItems: newList, groupSelectedCount: count });
  },

  // 保存新建的背诵组
  saveNewGroup() {
    const { newGroupName, groupSelectItems, customGroups } = this.data;
    if (!newGroupName) {
      this.setData({ groupNameError: true });
      wx.showToast({ title: '请输入组名', icon: 'none' });
      return;
    }

    const selectedKeys = groupSelectItems
      .filter(item => item.selected)
      .map(item => String(item.uniqueKey));

    if (selectedKeys.length === 0) {
      wx.showToast({ title: '请至少选择一条', icon: 'none' });
      return;
    }

    const newGroup = {
      id: 'group_' + Date.now(),
      name: newGroupName,
      clauseNums: selectedKeys, // 存储唯一 Key
      createTime: Date.now()
    };

    const updatedGroups = [...customGroups, newGroup];
    wx.setStorageSync(this.storageKey + '_custom_groups', updatedGroups);

    this.setData({
      customGroups: updatedGroups,
      showGroupCreate: false,
      newGroupName: '',
      groupNameError: false,
      groupSelectItems: [],
      groupSelectedCount: 0
    });

    wx.showToast({ title: `已创建「${newGroupName}」(${selectedKeys.length}条)`, icon: 'none' });
  },

  // 激活某个背诵组
  activateGroup(e) {
    const groupId = e.currentTarget.dataset.id;
    const group = this.data.customGroups.find(g => g.id === groupId);
    if (!group) return;

    this._setPageCount('read', 1);
    this._setPageCount('catalog', 1);

    this.setData({
      activeGroupId: groupId,
      activeGroupName: group.name,
      showGroupModal: false,
      isAllExpanded: false
    }, () => {
      wx.setStorageSync(this.storageKey + '_last_group_id', groupId);
      this._refreshAllTabs();
    });
  },

  // 退出背诵组模式
  deactivateGroup() {
    this._setPageCount('read', 1);
    this._setPageCount('catalog', 1);

    this.setData({
      activeGroupId: '',
      activeGroupName: '',
      isAllExpanded: false
    }, () => {
      wx.setStorageSync(this.storageKey + '_last_group_id', '');
      this._refreshAllTabs();
    });
  },

  // 删除背诵组
  deleteGroup(e) {
    const groupId = e.currentTarget.dataset.id;
    const group = this.data.customGroups.find(g => g.id === groupId);
    if (!group) return;

    wx.showModal({
      title: '删除背诵组',
      content: `确定删除「${group.name}」吗？`,
      confirmColor: '#ff3b30',
      success: (res) => {
        if (res.confirm) {
          const updatedGroups = this.data.customGroups.filter(g => g.id !== groupId);
          wx.setStorageSync(this.storageKey + '_custom_groups', updatedGroups);

          const updates = { customGroups: updatedGroups };
          // 如果删除的是当前激活的组，退出背诵组模式
          if (this.data.activeGroupId === groupId) {
            updates.activeGroupId = '';
            updates.activeGroupName = '';
          }

          this.setData(updates, () => {
            if (this.data.activeGroupId === '') {
              this._refreshAllTabs();
            }
            wx.showToast({ title: '已删除', icon: 'success' });
          });
        }
      }
    });
  },

  // 编辑背诵组（重新进入勾选界面）
  editGroup(e) {
    const groupId = e.currentTarget.dataset.id;
    const group = this.data.customGroups.find(g => g.id === groupId);
    if (!group) return;

    const selectedSet = new Set(group.clauseNums.map(String));
    const groupSelectItems = this.rawEntries.map(item => ({
      uniqueKey: item.uniqueKey,
      clauseNum: item.clauseNum,
      title: item.title || item.name || `条文 ${item.clauseNum}`,
      text: (item.text || '').substring(0, 40),
      level: item.level,
      selected: selectedSet.has(String(item.uniqueKey))
    }));
    // 保存原始列表
    this.originalGroupSelectItems = groupSelectItems;
    this._editingGroupId = groupId;
    this._fromActionSheet = true; // 标记从更多操作弹窗打开
    this.setData({
      showGroupCreate: true,
      showActionSheet: false, // 关闭更多操作弹窗
      newGroupName: group.name,
      groupNameError: false,
      groupSelectItems,
      groupSearchText: '',
      groupSelectedCount: group.clauseNums.length
    });
  },

  // 保存编辑（复用 saveNewGroup 的逻辑，但更新已有组）
  saveEditGroup() {
    const { newGroupName, groupSelectItems, customGroups } = this.data;
    const editId = this._editingGroupId;

    if (!newGroupName) {
      this.setData({ groupNameError: true });
      wx.showToast({ title: '请输入组名', icon: 'none' });
      return;
    }

    const selectedKeys = groupSelectItems
      .filter(item => item.selected)
      .map(item => String(item.uniqueKey));

    if (selectedKeys.length === 0) {
      wx.showToast({ title: '请至少选择一条', icon: 'none' });
      return;
    }

    if (editId) {
      // 编辑模式
      const updatedGroups = customGroups.map(g => {
        if (g.id === editId) {
          return { ...g, name: newGroupName, clauseNums: selectedKeys };
        }
        return g;
      });
      wx.setStorageSync(this.storageKey + '_custom_groups', updatedGroups);
      this.setData({
        customGroups: updatedGroups,
        showGroupCreate: false,
        groupNameError: false,
        activeGroupName: this.data.activeGroupId === editId ? newGroupName : this.data.activeGroupName
      });
      this._editingGroupId = null;
      wx.showToast({ title: '已更新', icon: 'success' });

      // 如果编辑的是当前激活的组，刷新视图
      if (this.data.activeGroupId === editId) {
        this._refreshAllTabs();
      }
    } else {
      // 新建模式
      this.saveNewGroup();
    }
  },

  // 辅助方法：刷新所有 Tab 数据
  _refreshAllTabs() {
    const tab = this.data.currentTab;
    if (tab === 'catalog') this.renderCatalog();
    if (tab === 'rank') this.renderRank();
    if (tab === 'read') {
      this.setData({ entries: this.getFilteredEntries().slice(0, this._getPageCount('read') * this.pageSize) });
    }
    if (tab === 'quiz') this.nextQuiz();
    this.renderCatalog();
    this.renderRank();
  },

  async addHistory(toolId) {
    const token = wx.getStorageSync('token');
    if (token) {
      try {
        await api.history.add(toolId);
        this._currentToolId = toolId;
        this._enterTime = Date.now();
      } catch (error) {
        console.log('添加历史记录失败:', error);
      }
    }
  },

  _reportDuration() {
    if (!this._currentToolId || !this._enterTime) return;
    const duration = Math.round((Date.now() - this._enterTime) / 1000);
    if (duration < 5) return;
    const token = wx.getStorageSync('token');
    if (!token) return;
    api.history.reportDuration(this._currentToolId, duration).catch(err => {
      console.log('上报停留时长失败:', err);
    });
    this._enterTime = Date.now();
  },

  _resolveToolId(type) {
    const typeNameMap = {
      shanghan: '伤寒速速通',
      fangji: '方剂轻松过',
      neijing: '内经随身背',
      zhongyao: '中药快快记',
      jinkui: '金匮简易考',
      wenbing: '温病掌上学'
    };
    const name = typeNameMap[type];
    if (!name) return null;
    const cached = wx.getStorageSync('cached_tools');
    if (Array.isArray(cached)) {
      const tool = cached.find(t => t.name === name);
      if (tool) return tool.id;
    }
    return null;
  },

  onShareAppMessage() {
    const { toolType, pageTitle } = this.data;
    const toolNameMap = {
      shanghan: '伤寒速速通',
      fangji: '方剂轻松过',
      neijing: '内经随身背',
      zhongyao: '中药快快记',
      jinkui: '金匮简易考',
      wenbing: '温病掌上学'
    };
    let name = toolNameMap[toolType] || pageTitle || '';
    // 移除可能存在的拼音（括号内的英文字符）
    name = name.replace(/[\(（][a-zA-Z\s]+[\)）]/g, '').trim();
    
    return share.getDefaultShareConfig({
      title: `山药铭记-${name}`,
      path: `/pages/study/study?type=${toolType}`
    });
  },

  onShareTimeline() {
    const { toolType, pageTitle } = this.data;
    const toolNameMap = {
      shanghan: '伤寒速速通',
      fangji: '方剂轻松过',
      neijing: '内经随身背',
      zhongyao: '中药快快记',
      jinkui: '金匮简易考',
      wenbing: '温病掌上学'
    };
    let name = toolNameMap[toolType] || pageTitle || '';
    name = name.replace(/[\(（][a-zA-Z\s]+[\)）]/g, '').trim();

    return share.getDefaultShareConfig({
      title: `山药铭记-${name}`,
      path: `type=${toolType}`
    });
  },

  // === 夜间模式切换 ===
  toggleDarkMode() {
    const isDark = app.toggleDarkMode();
    this.setData({ isDarkMode: isDark });
  },

  // === 方歌版本切换（按方剂记录） ===
  _calcFormulaSongVersionSummary(versions) {
    const values = Object.values(versions);
    if (values.length === 0) return '版本一';
    const allV1 = values.every(v => v === 'v1');
    const allV2 = values.every(v => v === 'v2');
    if (allV1) return '版本一';
    if (allV2) return '版本二';
    return '自定义';
  },

  toggleFormulaSongVersion(e) {
    const version = e.currentTarget.dataset.version;
    const name = e.currentTarget.dataset.name;
    if (!version || !name) return;
    
    const { formulaSongVersions } = this.data;
    const currentVersion = formulaSongVersions[name] || 'v1';
    if (version === currentVersion) return;
    
    // 更新该方剂的版本选择
    const newVersions = { ...formulaSongVersions, [name]: version };
    const formulaSongVersionSummary = this._calcFormulaSongVersionSummary(newVersions);
    this.setData({ formulaSongVersions: newVersions, formulaSongVersionSummary });
    
    // 保存到本地存储
    if (this.data.formulaSongVersionKey) {
      wx.setStorageSync(this.data.formulaSongVersionKey, newVersions);
    }
  },

  // === 底部动作面板 ===
  openActionSheet() {
    wx.vibrateShort({ type: 'light' });
    this.setData({ 
      showActionSheet: true,
      actionSheetContentHeight: 0,
      actionSheetTopOffset: 0
    });
    
    // 顶部严格限制在胶囊下方，内容区占满剩余可用空间
    setTimeout(() => {
      const query = wx.createSelectorQuery();
      query.select('.action-sheet-handle').boundingClientRect();
      query.select('.action-sheet-header').boundingClientRect();
      query.select('.action-sheet-cancel').boundingClientRect();
      query.exec((res) => {
        if (res && res[0] && res[1] && res[2]) {
          const systemInfo = wx.getSystemInfoSync();
          const menuButtonRect = wx.getMenuButtonBoundingClientRect();
          const layout = calculateActionSheetLayout({
            windowHeight: systemInfo.windowHeight,
            menuButtonBottom: menuButtonRect && menuButtonRect.bottom,
            topGap: 12,
            handleHeight: res[0].height,
            headerHeight: res[1].height,
            cancelHeight: res[2].height,
          });

          this.setData({
            actionSheetTopOffset: layout.topOffset,
            actionSheetContentHeight: layout.contentHeight,
          });
        }
      });
    }, 50);
  },

  closeActionSheet() {
    this.setData({ showActionSheet: false });
  },

  noop() {
    // 阻止事件冒泡，用于弹窗内容区域点击时不关闭弹窗
  },

  onSheetFilter(e) {
    const type = e.currentTarget.dataset.type;
    if (!type) return;
    wx.vibrateShort({ type: 'light' });
    // 如果有激活的背诵组，先退出
    if (this.data.activeGroupId) {
      this.deactivateGroup();
    }
    // 复用已有 setFilter 逻辑，但通过构造 e 对象来调用
    const fakeE = { currentTarget: { dataset: { type } } };
    this.setFilter(fakeE);
  },

  onSheetSort(e) {
    const sort = e.currentTarget.dataset.sort;
    if (!sort) return;
    wx.vibrateShort({ type: 'light' });
    if (this.data.sortType !== sort) {
      this.toggleSort();
    }
  },

  onSheetExpandAll() {
    wx.vibrateShort({ type: 'light' });
    this.toggleExpandAll();
  },

  onSheetGroupModal() {
    wx.vibrateShort({ type: 'light' });
    this.setData({ showActionSheet: false });
    setTimeout(() => this.onNewGroup(), 280);
  },

  onSheetCreateGroup() {
    wx.vibrateShort({ type: 'light' });
    this.setData({ showActionSheet: false });
    setTimeout(() => this.onNewGroup(), 280);
  },

  onSheetGroupSelect(e) {
    const groupId = e.currentTarget.dataset.id;
    wx.vibrateShort({ type: 'light' });
    
    if (groupId === '') {
      // 选择"全部"，退出背诵组模式
      this.deactivateGroup();
      this.setData({ showActionSheet: false });
    } else {
      // 选择指定背诵组
      const group = this.data.customGroups.find(g => g.id === groupId);
      if (group) {
        this._setPageCount('read', 1);
        this._setPageCount('catalog', 1);
        
        this.setData({
          activeGroupId: groupId,
          activeGroupName: group.name,
          showActionSheet: false,
          isAllExpanded: false
        }, () => {
          wx.setStorageSync(this.storageKey + '_last_group_id', groupId);
          this._refreshAllTabs();
        });
      }
    }
  },

  onSheetFormulaSongVersion(e) {
    const version = e.currentTarget.dataset.version;
    if (!version) return;
    wx.vibrateShort({ type: 'light' });
    
    // 批量更新所有方剂的版本
    const { formulaSongVersions, formulaSongVersionKey } = this.data;
    const newVersions = {};
    
    // 获取所有方剂名称，设置新版本
    if (this.rawEntries && Array.isArray(this.rawEntries)) {
      this.rawEntries.forEach(entry => {
        if (entry.name) {
          newVersions[entry.name] = version;
        }
      });
    }
    
    const formulaSongVersionSummary = this._calcFormulaSongVersionSummary(newVersions);
    this.setData({ formulaSongVersions: newVersions, formulaSongVersionSummary });
    
    // 保存到本地存储
    if (formulaSongVersionKey) {
      wx.setStorageSync(formulaSongVersionKey, newVersions);
    }
  },

  onSheetDarkMode() {
    wx.vibrateShort({ type: 'light' });
    const isDark = app.toggleDarkMode();
    this.setData({ isDarkMode: isDark });
  },

  // === 标签过滤 ===
  _getAvailableTags(toolType) {
    if (toolType === 'fangji') {
      return [
        { key: 'composition', label: '组成' },
        { key: 'function', label: '功用' },
        { key: 'composition_memo', label: '组记' },
        { key: 'function_memo', label: '功记' },
        { key: 'formula_song', label: '方歌' },
        { key: 'association', label: '联想' }
      ];
    } else if (toolType === 'zhongyao') {
      return [
        { key: 'function', label: '功效' },
        { key: 'memo', label: '口诀' },
        { key: 'association', label: '联想' }
      ];
    }
    return [];
  },

  _syncTagFilterState(tagFilter) {
    const nextTagFilter = Array.isArray(tagFilter) ? tagFilter : [];
    const tagFilterMap = buildTagFilterMap(nextTagFilter);
    const tagFilterSheet = buildTagFilterSheetState(this.data.toolType, nextTagFilter);

    this.setData({ tagFilter: nextTagFilter, tagFilterMap, tagFilterSheet });
    wx.setStorageSync(this.storageKey + '_tag_filter', nextTagFilter);
  },

  onSheetTagFilter(e) {
    const tag = e.currentTarget.dataset.tag;
    const group = e.currentTarget.dataset.group;
    if (!tag) return;
    wx.vibrateShort({ type: 'light' });
    const nextTagFilter = toggleTagFilterSelection(this.data.tagFilter, tag, group);
    this._syncTagFilterState(nextTagFilter);
  },

  onSheetTagFilterReset() {
    wx.vibrateShort({ type: 'light' });
    this._syncTagFilterState([]);
  }
});

