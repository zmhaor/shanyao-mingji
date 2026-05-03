const assert = require('assert')

const {
  buildTagFilterSheetState,
  toggleTagFilterSelection,
} = require('./tag-filter-sheet')

assert.deepStrictEqual(
  toggleTagFilterSelection([], 'composition_memo'),
  ['composition_memo', 'composition_association'],
  '选中组记时，应自动带上组记联想'
)

assert.deepStrictEqual(
  toggleTagFilterSelection(['composition_memo', 'composition_association'], 'composition_memo'),
  [],
  '取消组记时，应同时移除它自动带上的组记联想'
)

assert.deepStrictEqual(
  toggleTagFilterSelection([], 'association', 'composition'),
  [],
  '主标签未选中时，单独点击组记联想应无效'
)

assert.deepStrictEqual(
  toggleTagFilterSelection(['composition_memo'], 'association', 'composition'),
  ['composition_memo', 'composition_association'],
  '主标签已选中时，点击组记联想应能切换'
)

assert.deepStrictEqual(
  toggleTagFilterSelection(['composition_memo', 'composition_association'], 'association', 'composition'),
  ['composition_memo'],
  '主标签已选中且联想已选中时，点击应取消联想'
)

const fangjiState = buildTagFilterSheetState('fangji', [
  'function',
  'composition_memo',
  'composition_association',
])

assert.strictEqual(fangjiState.summaryText, '已选 3 项')
assert.strictEqual(fangjiState.sections.length, 2)
assert.strictEqual(fangjiState.sections[0].title, '基础内容')
assert.strictEqual(fangjiState.sections[1].title, '记忆辅助')
assert.strictEqual(fangjiState.sections[1].pairs[0].primary.active, true)
assert.strictEqual(fangjiState.sections[1].pairs[0].secondary.active, true)
assert.strictEqual(fangjiState.sections[1].pairs[0].secondary.linked, true)
assert.strictEqual(fangjiState.sections[1].pairs[0].secondary.disabled, false)

const manualAssociationState = buildTagFilterSheetState('fangji', ['function_association'])
assert.strictEqual(
  manualAssociationState.sections[1].pairs[1].secondary.linked,
  false,
  '如果只有联想被单独选中，不应显示为跟随主按钮联动'
)
assert.strictEqual(
  manualAssociationState.sections[1].pairs[1].secondary.disabled,
  true,
  '主标签未选中时，联想标签应显示为禁用状态'
)

const zhongyaoState = buildTagFilterSheetState('zhongyao', ['memo'])
assert.strictEqual(zhongyaoState.sections.length, 1)
assert.strictEqual(zhongyaoState.sections[0].items[1].active, true)
