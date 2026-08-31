import type { Kuaidi100Credentials, Parcel, ParcelSnapshot } from "./types"

const PARCELS_KEY = "parcelboard.parcels.v1"
const SNAPSHOTS_KEY = "parcelboard.snapshots.v1"
const CREDENTIALS_KEY = "parcelboard.kuaidi100.credentials.v1"

export function loadParcels(): Parcel[] {
  return Storage.get<Parcel[]>(PARCELS_KEY) ?? []
}

export function saveParcels(parcels: Parcel[]) {
  return Storage.set(PARCELS_KEY, parcels)
}

export function loadSnapshots(): Record<string, ParcelSnapshot> {
  return Storage.get<Record<string, ParcelSnapshot>>(SNAPSHOTS_KEY) ?? {}
}

export function saveSnapshots(snapshots: Record<string, ParcelSnapshot>) {
  return Storage.set(SNAPSHOTS_KEY, snapshots)
}

export function loadCredentials(): Kuaidi100Credentials | null {
  return Storage.get<Kuaidi100Credentials>(CREDENTIALS_KEY)
}

export function saveCredentials(credentials: Kuaidi100Credentials) {
  return Storage.set(CREDENTIALS_KEY, credentials)
}

export function removeParcelData(parcelId: string) {
  const snapshots = loadSnapshots()
  delete snapshots[parcelId]
  saveSnapshots(snapshots)
}
