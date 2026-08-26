const assert = require("node:assert/strict")
const crypto = require("node:crypto")

let captured
global.Data = {
  fromRawString(value) {
    return { value }
  },
}
global.Crypto = {
  md5(data) {
    return {
      toHexString() {
        return crypto.createHash("md5").update(data.value).digest("hex")
      },
    }
  },
}
global.fetch = async (url, init) => {
  captured = { url, init }
  return {
    ok: true,
    status: 200,
    async json() {
      return {
        status: "200",
        state: "5",
        data: [
          { context: "快件正在派送", ftime: "2026-08-26 12:00:00", status: "派件" },
          { context: "到达网点", time: "2026-08-26 09:00:00" },
        ],
      }
    },
  }
}

const checkDir = process.env.PARCELBOARD_CHECK_DIR || "../.check-dist"
const { queryKuaidi100 } = require(`${checkDir}/kuaidi100.js`)

async function main() {
  const result = await queryKuaidi100(
    {
      id: "1",
      nickname: "测试包裹",
      carrierCode: "shunfeng",
      trackingNumber: "SF1234567890",
      phone: "13800000000",
      createdAt: 0,
    },
    { customer: "customer-demo", key: "key-demo" },
  )

  assert.equal(captured.url, "https://poll.kuaidi100.com/poll/query.do")
  assert.equal(captured.init.method, "POST")
  assert.equal(captured.init.timeout, 15)

  const form = new URLSearchParams(captured.init.body)
  const paramText = form.get("param")
  const param = JSON.parse(paramText)
  assert.equal(param.com, "shunfeng")
  assert.equal(param.num, "SF1234567890")
  assert.equal(param.phone, "13800000000")
  assert.equal(param.order, "desc")

  const expectedSign = crypto
    .createHash("md5")
    .update(`${paramText}key-democustomer-demo`)
    .digest("hex")
    .toUpperCase()
  assert.equal(form.get("sign"), expectedSign)
  assert.equal(result.state, "5")
  assert.equal(result.latestMessage, "快件正在派送")
  assert.equal(result.events.length, 2)

  global.Data.fromRawString = () => null
  await assert.rejects(
    queryKuaidi100(
      {
        id: "2",
        nickname: "签名失败",
        carrierCode: "ems",
        trackingNumber: "EMS123456",
        createdAt: 0,
      },
      { customer: "customer-demo", key: "key-demo" },
    ),
    /无法生成快递100签名数据/,
  )

  console.log("kuaidi100 adapter tests passed")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
