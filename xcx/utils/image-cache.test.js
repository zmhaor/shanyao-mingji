const assert = require('assert')
const {
  buildCacheStorageKey,
  shouldRefreshCache
} = require('./image-cache')

assert.strictEqual(
  buildCacheStorageKey('about-author', 'avatar'),
  'image_cache_about-author_avatar'
)

assert.strictEqual(
  shouldRefreshCache({
    sourceUrl: 'https://example.com/a.png',
    localPath: 'wxfile://user/a.png',
    expiresAt: Date.now() + 60 * 1000
  }, 'https://example.com/a.png', Date.now()),
  false
)

assert.strictEqual(
  shouldRefreshCache({
    sourceUrl: 'https://example.com/a.png',
    localPath: 'wxfile://user/a.png',
    expiresAt: Date.now() - 1
  }, 'https://example.com/a.png', Date.now()),
  true
)

assert.strictEqual(
  shouldRefreshCache({
    sourceUrl: 'https://example.com/a.png',
    localPath: 'wxfile://user/a.png',
    expiresAt: Date.now() + 60 * 1000
  }, 'https://example.com/b.png', Date.now()),
  true
)

console.log('image-cache helper tests passed')
