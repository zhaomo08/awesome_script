import type { Parcel } from "./types"

const PARCELS_KEY = "parcelboard.parcels.v1"

export function loadParcels(): Parcel[] {
  return Storage.get<Parcel[]>(PARCELS_KEY) ?? []
}

export function saveParcels(parcels: Parcel[]) {
  return Storage.set(PARCELS_KEY, parcels)
}
