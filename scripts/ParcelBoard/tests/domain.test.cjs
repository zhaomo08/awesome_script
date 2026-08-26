const assert = require("node:assert/strict")
const {
  displayState,
  formatClock,
  getCarrier,
  getStateMeta,
  isTrackingNumberValid,
  maskTrackingNumber,
  truncate,
} = require(`${process.env.PARCELBOARD_CHECK_DIR || "../.check-dist"}/domain.js`)

assert.equal(getCarrier("shunfeng").name, "顺丰速运")
assert.equal(getCarrier("custom").name, "custom")
assert.equal(getStateMeta("3").label, "已签收")
assert.equal(displayState({ error: "失败" }).label, "查询失败")
assert.equal(maskTrackingNumber("SF1234567890"), "SF1••••7890")
assert.equal(isTrackingNumberValid("YT123456789"), true)
assert.equal(isTrackingNumberValid("坏 单号"), false)
assert.equal(truncate("123456", 5), "1234…")
assert.match(formatClock(Date.now()), /^\d{2}-\d{2} \d{2}:\d{2}$/)

console.log("domain tests passed")
