export type Carrier = {
  code: string
  name: string
  requiresPhone?: boolean
}

export type Parcel = {
  id: string
  nickname: string
  carrierCode: string
  trackingNumber: string
  phone?: string
  createdAt: number
}

export type TrackingEvent = {
  context: string
  time: string
  status?: string
  statusCode?: string
}

export type ParcelSnapshot = {
  parcelId: string
  state: string
  latestMessage: string
  events: TrackingEvent[]
  updatedAt?: number
  lastAttemptAt: number
  error?: string
}

export type Kuaidi100Credentials = {
  customer: string
  key: string
}

export type RefreshSummary = {
  refreshed: number
  skipped: number
  failed: number
  missingCredentials: boolean
}
