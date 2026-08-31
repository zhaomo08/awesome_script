import type { Carrier, ParcelSnapshot } from "./types"

export const CARRIERS: Carrier[] = [
  { code: "shunfeng", name: "顺丰速运", requiresPhone: true },
  { code: "zhongtong", name: "中通快递", requiresPhone: true },
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

const STATE_META: Record<string, { label: string; icon: string; color: string }> = {
  "0": { label: "运输中", icon: "shippingbox.fill", color: "#3478F6" },
  "1": { label: "已揽收", icon: "shippingbox.fill", color: "#7857D8" },
  "2": { label: "物流异常", icon: "exclamationmark.triangle.fill", color: "#E5484D" },
  "3": { label: "已签收", icon: "checkmark.circle.fill", color: "#2F9E64" },
  "4": { label: "退签", icon: "arrow.uturn.backward.circle.fill", color: "#E5484D" },
  "5": { label: "派送中", icon: "location.circle.fill", color: "#FF8A3D" },
  "6": { label: "退回中", icon: "arrow.uturn.backward.circle.fill", color: "#C27C0E" },
  "7": { label: "转投中", icon: "arrow.triangle.2.circlepath.circle.fill", color: "#3478F6" },
  "8": { label: "清关中", icon: "globe.asia.australia.fill", color: "#3478F6" },
  "10": { label: "待清关", icon: "clock.fill", color: "#C27C0E" },
  "11": { label: "清关中", icon: "globe.asia.australia.fill", color: "#3478F6" },
  "12": { label: "已清关", icon: "checkmark.seal.fill", color: "#2F9E64" },
  "13": { label: "清关异常", icon: "exclamationmark.triangle.fill", color: "#E5484D" },
  "14": { label: "已拒签", icon: "xmark.circle.fill", color: "#E5484D" },
}

export function getCarrier(code: string): Carrier {
  return CARRIERS.find((carrier) => carrier.code === code) ?? {
    code,
    name: code || "未知快递",
  }
}

export function getStateMeta(state?: string) {
  if (!state) {
    return { label: "等待查询", icon: "clock.fill", color: "#8E8E93" }
  }
  return STATE_META[state] ?? {
    label: "状态更新",
    icon: "shippingbox.fill",
    color: "#3478F6",
  }
}

export function displayState(snapshot?: ParcelSnapshot) {
  if (!snapshot) return getStateMeta()
  if (snapshot.error && !snapshot.updatedAt) {
    return { label: "查询失败", icon: "exclamationmark.triangle.fill", color: "#E5484D" }
  }
  return getStateMeta(snapshot.state)
}

export function maskTrackingNumber(value: string) {
  const trimmed = value.trim()
  if (trimmed.length <= 8) return trimmed
  return `${trimmed.slice(0, 3)}••••${trimmed.slice(-4)}`
}

export function isTrackingNumberValid(value: string) {
  const compact = value.replace(/\s+/g, "")
  return compact.length >= 6 && compact.length <= 32 && /^[A-Za-z0-9-]+$/.test(compact)
}

export function formatClock(timestamp?: number) {
  if (!timestamp) return "未更新"
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hour = String(date.getHours()).padStart(2, "0")
  const minute = String(date.getMinutes()).padStart(2, "0")
  return `${month}-${day} ${hour}:${minute}`
}

export function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`
}

type SmsParseResult = {
  carrierCode: string
  trackingNumber: string
}

// 阶段一：按运单号前缀识别快递公司（无需关键词）
const PREFIX_PATTERNS: { carrierCode: string; pattern: RegExp }[] = [
  { carrierCode: "shunfeng", pattern: /\b(SF\d{10,17})\b/i },
  { carrierCode: "jtexpress", pattern: /\b(JT\d{10,18})\b/i },
  { carrierCode: "jd", pattern: /\b(JD\d{10,15})\b/i },
  { carrierCode: "yuantong", pattern: /\b(YT\d{10,16})\b/i },
  { carrierCode: "ems", pattern: /\b([A-Z]{2}\d{9}[A-Z]{2})\b/ },
]

// 阶段二：通过短信关键词识别快递公司，再提取纯数字运单号
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
  {
    carrierCode: "ems",
    keywords: /EMS|邮政快递包裹/,
    tracking: /\b(\d{13})\b/,
  },
  {
    carrierCode: "youzhengguonei",
    keywords: /中国邮政|邮政包裹/,
    tracking: /\b(\d{13})\b/,
  },
]

/**
 * 从短信文本中解析快递公司和运单号。
 * 先按运单号前缀匹配，再按短信关键词匹配。
 * 返回 null 表示未能识别。
 */
export function parseSmsText(text: string): SmsParseResult | null {
  if (!text || text.trim().length === 0) return null

  for (const { carrierCode, pattern } of PREFIX_PATTERNS) {
    const match = text.match(pattern)
    if (match?.[1]) {
      return { carrierCode, trackingNumber: match[1].toUpperCase() }
    }
  }

  for (const { carrierCode, keywords, tracking } of KEYWORD_PATTERNS) {
    if (keywords.test(text)) {
      const match = text.match(tracking)
      if (match?.[1]) {
        return { carrierCode, trackingNumber: match[1] }
      }
    }
  }

  return null
}
