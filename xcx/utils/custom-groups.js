function toKey(value) {
  if (value === null || value === undefined) return ""
  return String(value).trim()
}

function buildEntryMatcher(entries) {
  const exactMap = new Map()
  const fallbackMap = new Map()

  ;(Array.isArray(entries) ? entries : []).forEach((entry) => {
    const uniqueKey = toKey(entry.uniqueKey || entry.id || entry.itemKey || entry.item_key)
    if (!uniqueKey) return

    ;[
      uniqueKey,
      toKey(entry.id),
      toKey(entry.itemKey),
      toKey(entry.item_key)
    ].filter(Boolean).forEach((key) => {
      exactMap.set(key, uniqueKey)
    })

    ;[
      toKey(entry.clauseNum),
      toKey(entry.clause_num),
      toKey(entry.sortOrder),
      toKey(entry.sort_order)
    ].filter(Boolean).forEach((key) => {
      const current = fallbackMap.get(key) || []
      current.push(uniqueKey)
      fallbackMap.set(key, current)
    })
  })

  return (rawKey) => {
    const key = toKey(rawKey)
    if (!key) return ""
    if (exactMap.has(key)) return exactMap.get(key)

    const matched = fallbackMap.get(key) || []
    return matched.length === 1 ? matched[0] : ""
  }
}

function normalizeCustomGroups(groups, entries) {
  const matchEntryKey = buildEntryMatcher(entries)

  return (Array.isArray(groups) ? groups : [])
    .map((group) => {
      if (!group || typeof group !== "object") return null

      const nextKeys = []
      const seenKeys = new Set()

      ;(Array.isArray(group.clauseNums) ? group.clauseNums : []).forEach((rawKey) => {
        const matchedKey = matchEntryKey(rawKey)
        if (!matchedKey || seenKeys.has(matchedKey)) return
        seenKeys.add(matchedKey)
        nextKeys.push(matchedKey)
      })

      return {
        ...group,
        clauseNums: nextKeys
      }
    })
    .filter(Boolean)
}

function getGroupIdentity(group) {
  if (!group || typeof group !== "object") return ""

  const id = toKey(group.id)
  if (id) return `id:${id}`

  const name = toKey(group.name)
  if (name) return `name:${name}`

  return ""
}

function mergeClauseNums(primaryClauseNums, secondaryClauseNums) {
  const merged = []
  const seen = new Set()

  ;[
    ...(Array.isArray(primaryClauseNums) ? primaryClauseNums : []),
    ...(Array.isArray(secondaryClauseNums) ? secondaryClauseNums : [])
  ].forEach((value) => {
    const key = toKey(value)
    if (!key || seen.has(key)) return
    seen.add(key)
    merged.push(key)
  })

  return merged
}

function mergeGroupRecord(primaryGroup, secondaryGroup) {
  return {
    ...(secondaryGroup || {}),
    ...(primaryGroup || {}),
    clauseNums: mergeClauseNums(primaryGroup?.clauseNums, secondaryGroup?.clauseNums)
  }
}

function mergeCustomGroups(primaryGroups, secondaryGroups) {
  const result = []
  const indexMap = new Map()

  const appendGroup = (group) => {
    if (!group || typeof group !== "object") return

    const identity = getGroupIdentity(group)
    const normalizedGroup = {
      ...group,
      clauseNums: mergeClauseNums(group.clauseNums, [])
    }

    if (!identity) {
      result.push(normalizedGroup)
      return
    }

    if (!indexMap.has(identity)) {
      indexMap.set(identity, result.length)
      result.push(normalizedGroup)
      return
    }

    const index = indexMap.get(identity)
    result[index] = mergeGroupRecord(result[index], normalizedGroup)
  }

  ;(Array.isArray(primaryGroups) ? primaryGroups : []).forEach(appendGroup)
  ;(Array.isArray(secondaryGroups) ? secondaryGroups : []).forEach(appendGroup)

  return result
}

module.exports = {
  mergeCustomGroups,
  normalizeCustomGroups
}
