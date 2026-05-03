const path = require("path")

const sequelize = require("../config/database")
const { ContentCollection, ContentItem } = require("../models")

const SOURCE_MAP = {
  shanghan: {
    file: path.resolve(__dirname, "..", "..", "xcx", "utils", "data_shanghan.js"),
    name: "Shanghan",
    description: "Imported from legacy mini-program data_shanghan.js"
  },
  fangji: {
    file: path.resolve(__dirname, "..", "..", "xcx", "utils", "data_fangji.js"),
    name: "Fangji",
    description: "Imported from legacy mini-program data_fangji.js"
  },
  neijing: {
    file: path.resolve(__dirname, "..", "..", "xcx", "utils", "data_neijing.js"),
    name: "Neijing",
    description: "Imported from legacy mini-program data_neijing.js"
  },
  zhongyao: {
    file: path.resolve(__dirname, "..", "..", "xcx", "utils", "data_zhongyao.js"),
    name: "Zhongyao",
    description: "Imported from legacy mini-program data_zhongyao.js"
  },
  jinkui: {
    file: path.resolve(__dirname, "..", "..", "xcx", "utils", "data_jinkui.js"),
    name: "Jinkui",
    description: "Imported from legacy mini-program data_jinkui.js"
  },
  wenbing: {
    file: path.resolve(__dirname, "..", "..", "xcx", "utils", "data_wenbing.js"),
    name: "Wenbing",
    description: "Imported from legacy mini-program data_wenbing.js"
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function toText(value) {
  if (value === null || value === undefined) {
    return ""
  }
  if (typeof value === "string") {
    return value.trim()
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  return ""
}

function flattenText(value, bucket = []) {
  if (value === null || value === undefined) {
    return bucket
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const text = String(value).trim()
    if (text) {
      bucket.push(text)
    }
    return bucket
  }

  if (Array.isArray(value)) {
    value.forEach((item) => flattenText(item, bucket))
    return bucket
  }

  if (typeof value === "object") {
    Object.values(value).forEach((item) => flattenText(item, bucket))
  }

  return bucket
}

function pickTitle(entry, index) {
  return [
    toText(entry.title),
    toText(entry.name),
    toText(entry.chapter),
    toText(entry.section),
    `item_${index + 1}`
  ].find(Boolean)
}

function buildItemKey(entry, index) {
  const parts = [
    toText(entry.clauseNum),
    toText(entry.clause_num),
    toText(entry.textbookOrder),
    toText(entry.textbook_order),
    toText(entry.name),
    toText(entry.title)
  ].filter(Boolean)

  if (parts.length === 0) {
    return `item_${index + 1}`
  }

  return parts.join("_").slice(0, 100)
}

function normalizeEntry(entry, index) {
  const raw = isPlainObject(entry) ? entry : { value: entry }
  const title = pickTitle(raw, index)
  const chapter = toText(raw.chapter)
  const section = toText(raw.section)
  const groupName = toText(raw.group) || toText(raw.group_name)
  const clauseNum = toText(raw.clauseNum) || toText(raw.clause_num)
  const textbookOrderRaw = raw.textbookOrder ?? raw.textbook_order ?? null
  const levelRaw = raw.level ?? null
  const searchText = flattenText(raw).join(" ")

  return {
    item_key: buildItemKey(raw, index),
    title,
    chapter,
    section,
    group_name: groupName,
    level: levelRaw === "" || levelRaw === undefined ? null : Number(levelRaw),
    clause_num: clauseNum,
    textbook_order: textbookOrderRaw === "" || textbookOrderRaw === undefined || textbookOrderRaw === null
      ? null
      : Number(textbookOrderRaw),
    sort_order: index,
    status: "published",
    content_json: raw,
    search_text: searchText
  }
}

async function ensureCollection(key, metadata, transaction) {
  const existing = await ContentCollection.findOne({
    where: { key },
    transaction
  })

  if (existing) {
    await existing.update({
      name: metadata.name,
      description: metadata.description
    }, { transaction })
    return existing
  }

  return ContentCollection.create({
    key,
    name: metadata.name,
    description: metadata.description,
    version: 1,
    is_active: true
  }, { transaction })
}

async function importOne(key) {
  const source = SOURCE_MAP[key]
  if (!source) {
    throw new Error(`Unsupported collection key: ${key}`)
  }

  delete require.cache[require.resolve(source.file)]
  const payload = require(source.file)
  const entries = Array.isArray(payload.entries) ? payload.entries : []

  const transaction = await sequelize.transaction()
  try {
    const collection = await ensureCollection(key, source, transaction)

    await ContentItem.destroy({
      where: { collection_id: collection.id },
      transaction
    })

    if (entries.length > 0) {
      const rows = entries.map((entry, index) => ({
        collection_id: collection.id,
        ...normalizeEntry(entry, index)
      }))
      await ContentItem.bulkCreate(rows, { transaction })
    }

    await collection.update({
      version: (collection.version || 0) + 1,
      last_published_at: Date.now()
    }, { transaction })

    await transaction.commit()
    console.log(`Imported ${key}: ${entries.length} items`)
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function main() {
  const arg = (process.argv[2] || "all").trim()
  const keys = arg === "all" ? Object.keys(SOURCE_MAP) : [arg]

  try {
    await sequelize.authenticate()
    for (const key of keys) {
      await importOne(key)
    }
    console.log("Import completed")
    process.exit(0)
  } catch (error) {
    console.error("Import failed:", error)
    process.exit(1)
  }
}

main()
