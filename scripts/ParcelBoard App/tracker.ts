import { queryKuaidi100 } from "./kuaidi100"
import { loadCredentials, loadParcels, loadSnapshots, saveSnapshots } from "./storage"
import type { Parcel, ParcelSnapshot, RefreshSummary } from "./types"

export const MIN_REFRESH_INTERVAL_MS = 30 * 60 * 1000

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return "网络异常，请稍后重试"
}

async function notifyStateChange(
  parcel: Parcel,
  oldSnapshot: ParcelSnapshot | undefined,
  newMessage: string,
) {
  // 仅在有旧数据、且最新消息发生变化时推送通知
  if (!oldSnapshot?.latestMessage || oldSnapshot.latestMessage === newMessage) return

  try {
    await Notification.schedule({
      title: parcel.nickname,
      body: newMessage,
      trigger: new TimeIntervalNotificationTrigger({ timeInterval: 1, repeats: false }),
      tapAction: {
        type: "runScript",
        scriptName: "ParcelBoard App",
      },
    })
  } catch {
    // 通知推送失败不影响主流程
  }
}

async function refreshParcel(parcel: Parcel, now: number) {
  const credentials = loadCredentials()
  if (!credentials) throw new Error("尚未配置快递100 API")

  const snapshots = loadSnapshots()
  const previous = snapshots[parcel.id]
  snapshots[parcel.id] = {
    parcelId: parcel.id,
    state: previous?.state ?? "",
    latestMessage: previous?.latestMessage ?? "等待首次查询",
    events: previous?.events ?? [],
    updatedAt: previous?.updatedAt,
    lastAttemptAt: now,
    error: previous?.error,
  }
  saveSnapshots(snapshots)

  try {
    const result = await queryKuaidi100(parcel, credentials)
    const current = loadSnapshots()
    current[parcel.id] = {
      parcelId: parcel.id,
      state: result.state,
      latestMessage: result.latestMessage,
      events: result.events,
      updatedAt: Date.now(),
      lastAttemptAt: now,
    }
    saveSnapshots(current)
    await notifyStateChange(parcel, previous, result.latestMessage)
  } catch (error) {
    const current = loadSnapshots()
    const cached = current[parcel.id]
    current[parcel.id] = {
      parcelId: parcel.id,
      state: cached?.state ?? "",
      latestMessage: cached?.latestMessage ?? "查询失败",
      events: cached?.events ?? [],
      updatedAt: cached?.updatedAt,
      lastAttemptAt: now,
      error: errorMessage(error),
    }
    saveSnapshots(current)
    throw error
  }
}

export async function refreshAllParcels(): Promise<RefreshSummary> {
  const parcels = loadParcels()
  const credentials = loadCredentials()
  if (!credentials) {
    return { refreshed: 0, skipped: parcels.length, failed: 0, missingCredentials: true }
  }

  const summary: RefreshSummary = {
    refreshed: 0,
    skipped: 0,
    failed: 0,
    missingCredentials: false,
  }

  for (const parcel of parcels) {
    const now = Date.now()
    const snapshot: ParcelSnapshot | undefined = loadSnapshots()[parcel.id]
    if (snapshot && now - snapshot.lastAttemptAt < MIN_REFRESH_INTERVAL_MS) {
      summary.skipped += 1
      continue
    }

    try {
      await refreshParcel(parcel, now)
      summary.refreshed += 1
    } catch {
      summary.failed += 1
    }
  }

  return summary
}

