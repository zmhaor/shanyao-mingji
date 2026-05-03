'use strict'

function uniqueTags(tags = []) {
  return [...new Set(tags.filter(Boolean))]
}

function buildTagFilterMap(tagFilter = []) {
  return uniqueTags(tagFilter).reduce((map, key) => {
    map[key] = true
    return map
  }, {})
}

function toggleTagFilterSelection(currentTags = [], tag, group) {
  if (!tag) return uniqueTags(currentTags)

  let tagFilter = uniqueTags(currentTags)
  const index = tagFilter.indexOf(tag)

  if (tag === 'association') {
    const associationKey = group === 'composition'
      ? 'composition_association'
      : 'function_association'
    const primaryKey = group === 'composition'
      ? 'composition_memo'
      : 'function_memo'

    // 只有当对应的主标签被选中时，才允许切换联想
    if (!tagFilter.includes(primaryKey)) {
      return tagFilter
    }

    if (tagFilter.includes(associationKey)) {
      return tagFilter.filter((item) => item !== associationKey)
    }

    return [...tagFilter, associationKey]
  }

  if (index > -1) {
    tagFilter = tagFilter.filter((item) => item !== tag)

    if (tag === 'composition_memo') {
      tagFilter = tagFilter.filter((item) => item !== 'composition_association')
    } else if (tag === 'function_memo') {
      tagFilter = tagFilter.filter((item) => item !== 'function_association')
    }

    return tagFilter
  }

  tagFilter = [...tagFilter, tag]

  if (tag === 'composition_memo' && !tagFilter.includes('composition_association')) {
    tagFilter.push('composition_association')
  } else if (tag === 'function_memo' && !tagFilter.includes('function_association')) {
    tagFilter.push('function_association')
  }

  return uniqueTags(tagFilter)
}

function createTagItem(key, label, tagFilterMap) {
  return {
    key,
    label,
    active: Boolean(tagFilterMap[key]),
  }
}

function createMemoryPair(options) {
  const {
    primaryKey,
    primaryLabel,
    secondaryKey,
    secondaryLabel,
    group,
    tagFilterMap,
  } = options

  const primaryActive = Boolean(tagFilterMap[primaryKey])
  const secondaryActive = Boolean(tagFilterMap[secondaryKey])

  return {
    id: group,
    primary: {
      key: primaryKey,
      label: primaryLabel,
      active: primaryActive,
    },
    secondary: {
      key: 'association',
      label: secondaryLabel,
      active: secondaryActive,
      linked: primaryActive && secondaryActive,
      disabled: !primaryActive,
      group,
    },
  }
}

function buildTagFilterSheetState(toolType, tagFilter = []) {
  const normalizedTags = uniqueTags(tagFilter)
  const tagFilterMap = buildTagFilterMap(normalizedTags)
  const selectedCount = normalizedTags.length

  if (toolType === 'fangji') {
    return {
      selectedCount,
      summaryText: selectedCount === 0 ? '显示全部' : `已选 ${selectedCount} 项`,
      sections: [
        {
          id: 'base',
          title: '基础内容',
          items: [
            createTagItem('composition', '组成', tagFilterMap),
            createTagItem('function', '功用', tagFilterMap),
            createTagItem('formula_song', '方歌', tagFilterMap),
          ],
        },
        {
          id: 'memory',
          title: '记忆辅助',
          pairs: [
            createMemoryPair({
              primaryKey: 'composition_memo',
              primaryLabel: '组记',
              secondaryKey: 'composition_association',
              secondaryLabel: '组记联想',
              group: 'composition',
              tagFilterMap,
            }),
            createMemoryPair({
              primaryKey: 'function_memo',
              primaryLabel: '功记',
              secondaryKey: 'function_association',
              secondaryLabel: '功记联想',
              group: 'function',
              tagFilterMap,
            }),
          ],
        },
      ],
    }
  }

  if (toolType === 'zhongyao') {
    return {
      selectedCount,
      summaryText: selectedCount === 0 ? '显示全部' : `已选 ${selectedCount} 项`,
      sections: [
        {
          id: 'herb',
          title: '内容类型',
          description: '选择要显示的药性信息与记忆辅助',
          items: [
            createTagItem('function', '功效', tagFilterMap),
            createTagItem('memo', '口诀', tagFilterMap),
            createTagItem('association', '联想', tagFilterMap),
          ],
        },
      ],
    }
  }

  return {
    selectedCount,
    summaryText: selectedCount === 0 ? '显示全部' : `已选 ${selectedCount} 项`,
    sections: [],
  }
}

module.exports = {
  buildTagFilterMap,
  buildTagFilterSheetState,
  toggleTagFilterSelection,
}
