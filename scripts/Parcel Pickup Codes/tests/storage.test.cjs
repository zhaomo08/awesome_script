const assert = require("node:assert/strict")

const values = new Map()
global.Storage = {
  get: (key) => values.get(key) ?? null,
  set: (key, value) => (values.set(key, value), true),
}

const storage = require(`${process.env.PARCELBOARD_CHECK_DIR || "../.check-dist"}/storage.js`)

storage.savePickupCodes([
  { id: "old", code: "1111", carrier: "快递", receivedAt: 1 },
  { id: "new", code: "2222", carrier: "快递", receivedAt: 2 },
])
assert.deepEqual(storage.loadPickupCodes().map((item) => item.id), ["new", "old"])
assert.equal(storage.removePickupCode("new"), true)
assert.deepEqual(storage.loadPickupCodes().map((item) => item.id), ["old"])
assert.equal(storage.removePickupCode("missing"), false)

console.log("storage tests passed")
