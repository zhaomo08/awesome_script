import type { Kuaidi100Credentials, Parcel, TrackingEvent } from "./types"

type Kuaidi100Response = {
  status?: string
  message?: string
  state?: string
  data?: Array<{
    context?: string
    time?: string
    ftime?: string
    status?: string
    statusCode?: string
  }>
}

export type Kuaidi100Result = {
  state: string
  latestMessage: string
  events: TrackingEvent[]
}

const QUERY_URL = "https://poll.kuaidi100.com/poll/query.do"

export async function queryKuaidi100(
  parcel: Parcel,
  credentials: Kuaidi100Credentials,
): Promise<Kuaidi100Result> {
  const param = {
    com: parcel.carrierCode,
    num: parcel.trackingNumber,
    ...(parcel.phone ? { phone: parcel.phone } : {}),
    resultv2: "1",
    show: "0",
    order: "desc",
  }
  const paramText = JSON.stringify(param)
  const signInput = Data.fromRawString(`${paramText}${credentials.key}${credentials.customer}`)
  if (!signInput) {
    throw new Error("无法生成快递100签名数据")
  }
  const sign = Crypto.md5(signInput)
    .toHexString()
    .toUpperCase()

  const body = [
    `customer=${encodeURIComponent(credentials.customer)}`,
    `sign=${encodeURIComponent(sign)}`,
    `param=${encodeURIComponent(paramText)}`,
  ].join("&")

  const response = await fetch(QUERY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    timeout: 15,
    debugLabel: `ParcelBoard ${parcel.carrierCode}`,
  })

  if (!response.ok) {
    throw new Error(`快递100请求失败（HTTP ${response.status}）`)
  }

  const payload = (await response.json()) as Kuaidi100Response
  const rawEvents = Array.isArray(payload.data) ? payload.data : []
  if (rawEvents.length === 0) {
    throw new Error(payload.message || "暂未查询到物流轨迹")
  }

  const events = rawEvents.slice(0, 12).map((event) => ({
    context: event.context?.trim() || "物流状态已更新",
    time: event.ftime || event.time || "",
    status: event.status,
    statusCode: event.statusCode,
  }))

  return {
    state: payload.state || "0",
    latestMessage: events[0]?.context || "物流状态已更新",
    events,
  }
}
