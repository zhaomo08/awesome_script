const CARRIERS: [RegExp, string][] = [
  [/顺丰/, "顺丰"],
  [/中通/, "中通"],
  [/圆通/, "圆通"],
  [/韵达/, "韵达"],
  [/申通/, "申通"],
  [/极兔/, "极兔"],
  [/京东/, "京东"],
  [/EMS|邮政/i, "邮政 EMS"],
  [/德邦/, "德邦"],
  [/菜鸟/, "菜鸟"],
  [/丰巢/, "丰巢"],
]

const CODE_PATTERNS = [
  /(?:取件|取货|提货|领取)码(?:是|为)?\s*[：:]?\s*([A-Z0-9]+(?:[-－][A-Z0-9]+){0,3})/i,
  /(?:凭|使用)\s*([A-Z0-9]+(?:[-－][A-Z0-9]+){0,3})\s*(?:取件|取货|领取)/i,
]

export type PickupCodeMatch = {
  code: string
  carrier: string
}

export function extractPickupCode(text: string): PickupCodeMatch | null {
  if (!text.trim()) return null

  for (const pattern of CODE_PATTERNS) {
    const raw = text.match(pattern)?.[1]
    if (!raw) continue
    const code = raw.replace(/－/g, "-").toUpperCase()
    if (code.replace(/-/g, "").length >= 4) {
      return {
        code,
        carrier: CARRIERS.find(([keywords]) => keywords.test(text))?.[1] ?? "快递",
      }
    }
  }

  return null
}

export function formatClock(timestamp: number) {
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hour = String(date.getHours()).padStart(2, "0")
  const minute = String(date.getMinutes()).padStart(2, "0")
  return `${month}-${day} ${hour}:${minute}`
}
