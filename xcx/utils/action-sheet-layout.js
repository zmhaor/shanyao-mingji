'use strict'

function toNumber(value) {
  return Number.isFinite(value) ? value : 0
}

function calculateActionSheetLayout(options = {}) {
  const windowHeight = toNumber(options.windowHeight)
  const menuButtonBottom = toNumber(options.menuButtonBottom)
  const topGap = toNumber(options.topGap)
  const handleHeight = toNumber(options.handleHeight)
  const headerHeight = toNumber(options.headerHeight)
  const cancelHeight = toNumber(options.cancelHeight)
  const topOffset = Math.max(0, Math.floor(menuButtonBottom + topGap))
  const panelHeight = Math.max(0, windowHeight - topOffset)
  const reservedHeight = handleHeight + headerHeight + cancelHeight

  return {
    topOffset,
    contentHeight: Math.max(0, Math.floor(panelHeight - reservedHeight)),
  }
}

module.exports = {
  calculateActionSheetLayout,
}
