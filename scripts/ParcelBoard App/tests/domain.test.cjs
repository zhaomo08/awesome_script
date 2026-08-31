const assert = require("node:assert/strict")
const {
  formatClock,
  getCarrier,
  maskTrackingNumber,
  parseSmsText,
} = require(`${process.env.PARCELBOARD_CHECK_DIR || "../.check-dist"}/domain.js`)

assert.equal(getCarrier("shunfeng").name, "顺丰速运")
assert.equal(getCarrier("custom").name, "custom")
assert.equal(maskTrackingNumber("SF1234567890"), "SF1••••7890")
assert.match(formatClock(Date.now()), /^\d{2}-\d{2} \d{2}:\d{2}$/)
assert.deepEqual(parseSmsText("【顺丰速运】快件 SF123456789012 已到达"), {
  carrierCode: "shunfeng",
  trackingNumber: "SF123456789012",
})
assert.deepEqual(parseSmsText("【中通快递】快递 781234567890 已送达"), {
  carrierCode: "zhongtong",
  trackingNumber: "781234567890",
})
assert.equal(parseSmsText("验证码：123456"), null)
assert.equal(parseSmsText(""), null)

console.log("domain tests passed")
