import type { PickupCode } from "./types"

const PICKUP_CODES_KEY = "parcel-pickup-codes.v1"

export function loadPickupCodes(): PickupCode[] {
  return Storage.get<PickupCode[]>(PICKUP_CODES_KEY) ?? []
}

export function savePickupCodes(codes: PickupCode[]) {
  return Storage.set(PICKUP_CODES_KEY, codes)
}

export function upsertPickupCode(code: string, carrier: string): PickupCode {
  const current = loadPickupCodes()
  const existing = current.find((item) => item.code === code)
  const item: PickupCode = existing
    ? { ...existing, carrier, receivedAt: Date.now() }
    : { id: `${Date.now().toString(36)}-${code}`, code, carrier, receivedAt: Date.now() }
  savePickupCodes([item, ...current.filter((entry) => entry.id !== item.id)])
  return item
}
