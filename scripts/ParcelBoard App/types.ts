export type Carrier = {
  code: string
  name: string
}

export type Parcel = {
  id: string
  nickname: string
  carrierCode: string
  trackingNumber: string
  importedAt: number
}
