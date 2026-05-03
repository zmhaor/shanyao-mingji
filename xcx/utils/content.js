function toText(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
}

function toNumber(value, fallback = null) {
  if (value === '' || value === null || value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCustomNotes(notes) {
  if (!Array.isArray(notes)) {
    return [];
  }

  return notes
    .map((note) => {
      if (typeof note === 'string' || typeof note === 'number' || typeof note === 'boolean') {
        const text = toText(note);
        return text ? {
          label: text,
          content: text,
          color: '',
          isTitle: false
        } : null;
      }

      if (!note || typeof note !== 'object') {
        return null;
      }

      const label = toText(
        note.label
        || note.title
        || note.name
        || note.tag
        || note.key
        || note.type
        || note.heading
        || note.header
        || note.text
      );
      const content = toText(
        note.content
        || note.value
        || note.desc
        || note.description
        || note.body
        || note.detail
        || note.note
        || note.memo
      );
      const color = toText(note.color || note.colour || note.theme || note.variant);
      const isTitle = Boolean(
        note.isTitle
        || note.is_title
        || note.titleOnly
        || note.title_only
        || note.isFormula
        || note.is_formula
        || (label && !content)
      );

      if (!label && !content) {
        return null;
      }

      return {
        label: label || content,
        content: content || label,
        color,
        isTitle
      };
    })
    .filter(Boolean);
}

function normalizeEntry(item, index = 0) {
  const meta = item && item.content_json && typeof item.content_json === 'object' ? item : null;
  const raw = meta ? (item.content_json || {}) : (item || {});

  const normalized = Object.assign({}, raw);
  const clauseNum = item?.clause_num ?? raw.clauseNum ?? raw.clause_num ?? item?.item_key ?? (index + 1);
  const textbookOrder = item?.textbook_order ?? raw.textbookOrder ?? raw.textbook_order ?? index;
  const level = item?.level ?? raw.level ?? null;
  const title = item?.title ?? raw.title ?? raw.name ?? item?.item_key ?? `条文 ${index + 1}`;
  const text = raw.text || raw.content || raw.function || raw.mainText || '';
  const customNotes = normalizeCustomNotes(raw.customNotes || raw.custom_notes);

  normalized.id = item?.id ?? raw.id ?? normalized.id ?? null;
  normalized.itemId = item?.id ?? raw.id ?? null;
  normalized.itemKey = item?.item_key || raw.itemKey || raw.item_key || '';
  normalized.collectionId = item?.collection_id ?? raw.collectionId ?? null;
  normalized.clauseNum = clauseNum;
  normalized.level = toNumber(level, 1);
  normalized.title = toText(title);
  normalized.name = raw.name || normalized.title;
  normalized.text = toText(text);
  normalized.note = toText(
    raw.note
      || raw.notes
      || raw.annotation
      || raw.memo
      || ''
  );
  normalized.chapter = toText(item?.chapter ?? raw.chapter);
  normalized.section = toText(item?.section ?? raw.section);
  normalized.group = toText(item?.group_name ?? raw.group ?? raw.group_name);
  normalized.group_name = normalized.group;
  normalized.textbookOrder = toNumber(textbookOrder, index);
  normalized.sortOrder = toNumber(item?.sort_order ?? raw.sortOrder ?? raw.sort_order, index);
  normalized.customNotes = customNotes;

  if (!normalized.note && customNotes.length > 0) {
    normalized.note = customNotes
      .filter((entry) => !entry.isTitle)
      .map((entry) => `${entry.label}${entry.content && entry.content !== entry.label ? `：${entry.content}` : ''}`)
      .join('\n');
  }

  return normalized;
}

function normalizeEntries(list) {
  if (!Array.isArray(list)) {
    return [];
  }

  return list.map((item, index) => normalizeEntry(item, index));
}

function getLocalContent(type) {
  const localModule = require(`./data_${type}.js`);
  return Object.assign({}, localModule, {
    entries: normalizeEntries(localModule.entries)
  });
}

function getCachedContent(type) {
  const cacheKey = `content_cache_${type}`;
  const cached = wx.getStorageSync(cacheKey);

  if (cached && Array.isArray(cached.entries) && cached.entries.length > 0) {
    return Object.assign({}, cached, {
      entries: normalizeEntries(cached.entries)
    });
  }

  return null;
}

function buildCachePayload(type, collection, entries, extras = {}) {
  return {
    config: {
      title: collection?.name || type,
      storageKey: `${type}_comments`,
      showLevels: type === 'shanghan' || type === 'neijing' || type === 'jinkui' || type === 'wenbing'
    },
    entries: normalizeEntries(entries),
    collection: collection || null,
    syncTime: Number(extras.syncTime || collection?.last_published_at || collection?.update_time || 0)
  };
}

function mergeDeltaPayload(type, basePayload, delta = {}) {
  const baseEntries = Array.isArray(basePayload?.entries) ? normalizeEntries(basePayload.entries) : [];
  const upserts = normalizeEntries(Array.isArray(delta.upserts) ? delta.upserts : []);
  const deletes = Array.isArray(delta.deletes) ? delta.deletes : [];
  const deletedKeys = new Set(
    deletes
      .map((item) => String(item?.item_key || '').trim())
      .filter(Boolean)
  );
  const nextMap = new Map();

  baseEntries.forEach((item) => {
    const key = String(item.itemKey || item.item_key || item.clauseNum || '').trim();
    if (!key || deletedKeys.has(key)) return;
    nextMap.set(key, item);
  });

  upserts.forEach((item) => {
    const key = String(item.itemKey || item.item_key || item.clauseNum || '').trim();
    if (!key) return;
    nextMap.set(key, item);
  });

  const nextEntries = Array.from(nextMap.values()).sort((a, b) => {
    const sortA = Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : 0;
    const sortB = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : 0;
    if (sortA !== sortB) return sortA - sortB;

    const bookA = Number.isFinite(Number(a.textbookOrder)) ? Number(a.textbookOrder) : 999999;
    const bookB = Number.isFinite(Number(b.textbookOrder)) ? Number(b.textbookOrder) : 999999;
    if (bookA !== bookB) return bookA - bookB;

    return Number(a.clauseNum || 0) - Number(b.clauseNum || 0);
  });

  return buildCachePayload(
    type,
    delta.collection || basePayload?.collection || null,
    nextEntries,
    { syncTime: delta.syncTime || basePayload?.syncTime || 0 }
  );
}

function getCachedOrLocalContent(type) {
  return getCachedContent(type) || getLocalContent(type);
}

module.exports = {
  normalizeEntry,
  normalizeEntries,
  getCachedContent,
  getLocalContent,
  buildCachePayload,
  mergeDeltaPayload,
  getCachedOrLocalContent
};
