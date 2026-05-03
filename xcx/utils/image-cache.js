const config = require('./config');
const ASSET_HOST = config.assetHost;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000
const inFlightDownloads = {}

function buildCacheStorageKey(scope, assetName) {
  return `image_cache_${scope}_${assetName}`
}

function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return ''
  }

  if (/^https?:\/\//.test(url)) {
    return url
  }

  if (url.startsWith('/uploads/')) {
    return `${ASSET_HOST}${url}`
  }

  return url
}

function shouldRefreshCache(cacheRecord, sourceUrl, now = Date.now()) {
  if (!cacheRecord || typeof cacheRecord !== 'object') {
    return true
  }

  if (!sourceUrl || cacheRecord.sourceUrl !== sourceUrl) {
    return true
  }

  if (!cacheRecord.localPath) {
    return true
  }

  if (!cacheRecord.expiresAt || cacheRecord.expiresAt <= now) {
    return true
  }

  return false
}

function getStoredCacheRecord(scope, assetName) {
  if (typeof wx === 'undefined') {
    return null
  }

  const key = buildCacheStorageKey(scope, assetName)
  const record = wx.getStorageSync(key)
  return record && typeof record === 'object' ? record : null
}

function setStoredCacheRecord(scope, assetName, record) {
  if (typeof wx === 'undefined') {
    return
  }

  wx.setStorageSync(buildCacheStorageKey(scope, assetName), record)
}

function isRemoteUrl(url) {
  return /^https?:\/\//.test(url)
}

function getFileExtension(sourceUrl, tempFilePath) {
  const candidates = [tempFilePath, sourceUrl]
  for (const value of candidates) {
    if (!value || typeof value !== 'string') {
      continue
    }
    const cleanValue = value.split('?')[0]
    const match = cleanValue.match(/\.[a-zA-Z0-9]+$/)
    if (match) {
      return match[0].toLowerCase()
    }
  }
  return '.png'
}

function buildLocalFilePath(scope, assetName, sourceUrl, tempFilePath) {
  const ext = getFileExtension(sourceUrl, tempFilePath)
  return `${wx.env.USER_DATA_PATH}/${scope}_${assetName}${ext}`
}

function accessFile(filePath) {
  if (typeof wx === 'undefined' || !filePath) {
    return Promise.resolve(false)
  }

  const fs = wx.getFileSystemManager()
  return new Promise((resolve) => {
    fs.access({
      path: filePath,
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
}

function removeFileIfExists(filePath) {
  if (typeof wx === 'undefined' || !filePath) {
    return Promise.resolve()
  }

  const fs = wx.getFileSystemManager()
  return new Promise((resolve) => {
    fs.unlink({
      filePath,
      success: () => resolve(),
      fail: () => resolve()
    })
  })
}

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url,
      success: resolve,
      fail: reject
    })
  })
}

function saveFile(tempFilePath, filePath) {
  const fs = wx.getFileSystemManager()
  return new Promise((resolve, reject) => {
    fs.saveFile({
      tempFilePath,
      filePath,
      success: (res) => resolve(res.savedFilePath),
      fail: reject
    })
  })
}

async function getImageForDisplay(scope, assetName, sourceUrl, options = {}) {
  const normalizedUrl = normalizeImageUrl(sourceUrl)
  if (!isRemoteUrl(normalizedUrl)) {
    return {
      path: normalizedUrl,
      needsRefresh: false
    }
  }

  const record = getStoredCacheRecord(scope, assetName)
  if (!record || record.sourceUrl !== normalizedUrl) {
    return {
      path: normalizedUrl,
      needsRefresh: true
    }
  }

  const exists = await accessFile(record.localPath)
  if (!exists) {
    return {
      path: normalizedUrl,
      needsRefresh: true
    }
  }

  return {
    path: record.localPath,
    needsRefresh: shouldRefreshCache(record, normalizedUrl, options.now || Date.now())
  }
}

async function cacheRemoteImage(scope, assetName, sourceUrl, options = {}) {
  const normalizedUrl = normalizeImageUrl(sourceUrl)
  if (!isRemoteUrl(normalizedUrl) || typeof wx === 'undefined') {
    return ''
  }

  const inFlightKey = `${scope}:${assetName}:${normalizedUrl}`
  if (inFlightDownloads[inFlightKey]) {
    return inFlightDownloads[inFlightKey]
  }

  const task = (async () => {
    try {
      const response = await downloadFile(normalizedUrl)
      if (response.statusCode !== 200 || !response.tempFilePath) {
        return ''
      }

      const filePath = buildLocalFilePath(scope, assetName, normalizedUrl, response.tempFilePath)
      await removeFileIfExists(filePath)
      const savedFilePath = await saveFile(response.tempFilePath, filePath)

      setStoredCacheRecord(scope, assetName, {
        sourceUrl: normalizedUrl,
        localPath: savedFilePath,
        expiresAt: (options.now || Date.now()) + (options.ttlMs || DEFAULT_TTL_MS)
      })

      return savedFilePath
    } catch (error) {
      console.error(`缓存图片失败 [${scope}/${assetName}]:`, error)
      return ''
    } finally {
      delete inFlightDownloads[inFlightKey]
    }
  })()

  inFlightDownloads[inFlightKey] = task
  return task
}

module.exports = {
  DEFAULT_TTL_MS,
  buildCacheStorageKey,
  normalizeImageUrl,
  shouldRefreshCache,
  getImageForDisplay,
  cacheRemoteImage
}
