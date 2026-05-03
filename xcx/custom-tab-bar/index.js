Component({
    data: {
        show: true,
        selected: 0,
        isDarkMode: false,
        color: "#94a3b8",
        selectedColor: "#6366f1",
        list: [
            {
                pagePath: "/pages/index/index",
                iconPath: "/images/首页.png",
                selectedIconPath: "/images/首页.png",
                text: "发现"
            },
            {
                pagePath: "/pages/mnemonic/index",
                iconPath: "/images/随时背.png",
                selectedIconPath: "/images/随时背.png",
                text: "随时背"
            },
            {
                pagePath: "/pages/profile/profile",
                iconPath: "/images/我的.png",
                selectedIconPath: "/images/我的.png",
                text: "我的"
            }
        ]
    },
    methods: {
        switchTab(e) {
            const data = e.currentTarget.dataset
            const url = data.path
            if (this.data.selected === data.index) return
            wx.switchTab({ url })
        },
        updateTheme() {
            const app = getApp()
            const isDark = app.globalData.isDarkMode !== undefined ? app.globalData.isDarkMode : false;
            this.setData({
                isDarkMode: isDark
            })
        }
    },
    pageLifetimes: {
        show() {
            this.updateTheme()
        }
    },
    attached() {
        this.updateTheme()
    }
})
