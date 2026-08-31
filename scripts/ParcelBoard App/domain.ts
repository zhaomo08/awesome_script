import type { Carrier } from "./types"

export const CARRIERS: Carrier[] = [
  { code: "shunfeng", name: "顺丰速运" },
  { code: "zhongtong", name: "中通快递" },
  { code: "yuantong", name: "圆通速递" },
  { code: "yunda", name: "韵达快递" },
  { code: "shentong", name: "申通快递" },
  { code: "jtexpress", name: "极兔速递" },
  { code: "jd", name: "京东物流" },
  { code: "ems", name: "EMS" },
  { code: "debangkuaidi", name: "德邦快递" },
  { code: "danniao", name: "菜鸟速递" },
  { code: "youzhengguonei", name: "邮政包裹" },
]

export function getCarrier(code: string): Carrier {
  return CARRIERS.find((carrier) => carrier.code === code) ?? {
    code,
    name: code || "未知快递",
  }
}

export function maskTrackingNumber(value: string) {
  const trimmed = value.trim()
  if (trimmed.length <= 8) return trimmed
  return `${trimmed.slice(0, 3)}••••${trimmed.slice(-4)}`
}

export function formatClock(timestamp?: number) {
  if (!timestamp) return "未导入"
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hour = String(date.getHours()).padStart(2, "0")
  const minute = String(date.getMinutes()).padStart(2, "0")
  return `${month}-${day} ${hour}:${minute}`
}

type SmsParseResult = {
  carrierCode: string
  trackingNumber: string
}

const PREFIX_PATTERNS: { carrierCode: string; pattern: RegExp }[] = [
  { carrierCode: "shunfeng", pattern: /\b(SF\d{10,17})\b/i },
  { carrierCode: "jtexpress", pattern: /\b(JT\d{10,18})\b/i },
  { carrierCode: "jd", pattern: /\b(JD\d{10,15})\b/i },
  { carrierCode: "yuantong", pattern: /\b(YT\d{10,16})\b/i },
  { carrierCode: "ems", pattern: /\b([A-Z]{2}\d{9}[A-Z]{2})\b/ },
]

const KEYWORD_PATTERNS: {
  carrierCode: string
  keywords: RegExp
  tracking: RegExp
}[] = [
  { carrierCode: "shunfeng", keywords: /顺丰/, tracking: /\b(\d{12})\b/ },
  { carrierCode: "zhongtong", keywords: /中通/, tracking: /\b(\d{12,13})\b/ },
  { carrierCode: "yuantong", keywords: /圆通/, tracking: /\b(\d{12,15})\b/ },
  { carrierCode: "yunda", keywords: /韵达/, tracking: /\b(\d{12,13})\b/ },
  { carrierCode: "shentong", keywords: /申通/, tracking: /\b(\d{12,13})\b/ },
  { carrierCode: "jtexpress", keywords: /极兔/, tracking: /\b(\d{14,18})\b/ },
  { carrierCode: "jd", keywords: /京东/, tracking: /\b(\d{12,18})\b/ },
  { carrierCode: "debangkuaidi", keywords: /德邦/, tracking: /\b(\d{12,13})\b/ },
  { carrierCode: "danniao", keywords: /菜鸟速递|菜鸟驿站/, tracking: /\b(\d{12,20})\b/ },
  { carrierCode: "ems", keywords: /EMS|邮政快递包裹/, tracking: /\b(\d{13})\b/ },
  { carrierCode: "youzhengguonei", keywords: /中国邮政|邮政包裹/, tracking: /\b(\d{13})\b/ },
]

export function parseSmsText(text: string): SmsParseResult | null {
  if (!text.trim()) return null

  for (const { carrierCode, pattern } of PREFIX_PATTERNS) {
    const trackingNumber = text.match(pattern)?.[1]
    if (trackingNumber) return { carrierCode, trackingNumber: trackingNumber.toUpperCase() }
  }

  for (const { carrierCode, keywords, tracking } of KEYWORD_PATTERNS) {
    if (!keywords.test(text)) continue
    const trackingNumber = text.match(tracking)?.[1]
    if (trackingNumber) return { carrierCode, trackingNumber }
  }

  return null
}
