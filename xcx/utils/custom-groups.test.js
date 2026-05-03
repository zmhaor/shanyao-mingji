const assert = require("assert")

const { mergeCustomGroups, normalizeCustomGroups } = require("./custom-groups")

const entries = [
  { uniqueKey: "901", id: 901, itemKey: "sh-001", clauseNum: "1", sortOrder: 100 },
  { uniqueKey: "902", id: 902, itemKey: "sh-002", clauseNum: "2", sortOrder: 200 },
  { uniqueKey: "903", id: 903, itemKey: "sh-003", clauseNum: "3", sortOrder: 300 }
]

const groups = normalizeCustomGroups([
  {
    id: "g1",
    name: "旧排序组",
    clauseNums: ["200", "300"]
  },
  {
    id: "g2",
    name: "旧条文号组",
    clauseNums: ["1", "3"]
  }
], entries)

assert.deepStrictEqual(groups, [
  {
    id: "g1",
    name: "旧排序组",
    clauseNums: ["902", "903"]
  },
  {
    id: "g2",
    name: "旧条文号组",
    clauseNums: ["901", "903"]
  }
])

assert.deepStrictEqual(
  mergeCustomGroups(
    [{ id: "local-1", name: "本地组", clauseNums: ["901"] }],
    [{ id: "cloud-1", name: "云端组", clauseNums: ["902"] }]
  ),
  [
    { id: "local-1", name: "本地组", clauseNums: ["901"] },
    { id: "cloud-1", name: "云端组", clauseNums: ["902"] }
  ]
)

assert.deepStrictEqual(
  mergeCustomGroups(
    [{ id: "same", name: "同一组", clauseNums: ["901", "902"], note: "local" }],
    [{ id: "same", name: "同一组", clauseNums: ["902", "903"], extra: "cloud" }]
  ),
  [
    {
      id: "same",
      name: "同一组",
      clauseNums: ["901", "902", "903"],
      note: "local",
      extra: "cloud"
    }
  ]
)

console.log("custom group migration tests passed")
