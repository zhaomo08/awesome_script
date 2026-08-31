const assert = require("node:assert/strict")
const {
  extractPickupCode,
  formatClock,
} = require(`${process.env.PARCELBOARD_CHECK_DIR || "../.check-dist"}/domain.js`)

assert.deepEqual(extractPickupCode("【菜鸟】取件码：2-5-3071，请到驿站领取"), {
  code: "2-5-3071",
  carrier: "菜鸟",
})
assert.deepEqual(extractPickupCode("【丰巢】请凭 A12345 取件"), {
  code: "A12345",
  carrier: "丰巢",
})
assert.deepEqual(extractPickupCode("您的取货码为 5397，请及时领取"), {
  code: "5397",
  carrier: "快递",
})
assert.equal(extractPickupCode("验证码：123456"), null)
assert.equal(extractPickupCode("快递已送达"), null)
assert.match(formatClock(Date.now()), /^\d{2}-\d{2} \d{2}:\d{2}$/)

console.log("pickup code tests passed")
