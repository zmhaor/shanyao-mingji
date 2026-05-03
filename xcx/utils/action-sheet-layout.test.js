const assert = require('assert')
const {
  calculateActionSheetLayout,
} = require('./action-sheet-layout')

assert.deepStrictEqual(
  calculateActionSheetLayout({
    windowHeight: 844,
    menuButtonBottom: 56,
    topGap: 12,
    handleHeight: 12,
    headerHeight: 52,
    cancelHeight: 66,
  }),
  {
    topOffset: 68,
    contentHeight: 646,
  },
  '弹窗顶部应限制在胶囊底部以下，并把剩余空间尽量留给内容区'
)

assert.deepStrictEqual(
  calculateActionSheetLayout({
    windowHeight: 667,
    menuButtonBottom: 52,
    topGap: 10,
    handleHeight: 12,
    headerHeight: 52,
    cancelHeight: 66,
  }),
  {
    topOffset: 62,
    contentHeight: 475,
  },
  '不同机型应统一按胶囊底部计算顶部边界，而不是按页面内容猜测'
)

assert.deepStrictEqual(
  calculateActionSheetLayout({
    windowHeight: 140,
    menuButtonBottom: 56,
    topGap: 12,
    handleHeight: 12,
    headerHeight: 52,
    cancelHeight: 66,
  }),
  {
    topOffset: 68,
    contentHeight: 0,
  },
  '极小高度下内容区也应被钳制为 0，避免出现负值导致超出面板'
)
