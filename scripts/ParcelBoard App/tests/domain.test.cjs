const assert = require("node:assert/strict")
const {
  displayState,
  formatClock,
  getCarrier,
  getStateMeta,
  isTrackingNumberValid,
  maskTrackingNumber,
  truncate,
  parseSmsText,
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

// 短信识别测试
const sfSms = "【顺丰速运】您的快件 SF123456789012 已到达指定网点，请凭取件码取件。"
assert.deepEqual(parseSmsText(sfSms), { carrierCode: "shunfeng", trackingNumber: "SF123456789012" })

const ztSms = "【中通快递】您的快递 781234567890 已送达菜鸟驿站，请凭取件码领取。"
assert.deepEqual(parseSmsText(ztSms), { carrierCode: "zhongtong", trackingNumber: "781234567890" })

const jdSms = "【京东物流】您的订单 JD001234567890 正在派送中。"
assert.deepEqual(parseSmsText(jdSms), { carrierCode: "jd", trackingNumber: "JD001234567890" })

const ytSms = "【圆通速递】单号YT123456789012已揽收。"
assert.deepEqual(parseSmsText(ytSms), { carrierCode: "yuantong", trackingNumber: "YT123456789012" })

assert.equal(parseSmsText("这是一条普通验证码短信：123456"), null)
assert.equal(parseSmsText(""), null)

console.log("domain tests passed")

