import { Button, HStack, Image, Text, VStack, Widget } from "scripting"
import { displayState, formatClock, getCarrier, maskTrackingNumber, truncate } from "./domain"
import { RefreshParcelsIntent } from "./app_intents"
import { loadCredentials, loadParcels, loadSnapshots } from "./storage"
import { MIN_REFRESH_INTERVAL_MS, refreshAllParcels } from "./tracker"
import type { Parcel, ParcelSnapshot } from "./types"

const background = { light: "#F8F9FB", dark: "#151619" }
const primary = { light: "#17181A", dark: "#F7F7F8" }
const secondary = { light: "#73767C", dark: "#A7A9AE" }

function ParcelRow({ parcel, snapshot }: { parcel: Parcel; snapshot?: ParcelSnapshot }) {
  const carrier = getCarrier(parcel.carrierCode)
  const state = displayState(snapshot)
  const message = snapshot?.error && !snapshot.updatedAt
    ? snapshot.error
    : snapshot?.latestMessage || "等待首次查询"

  return (
    <HStack alignment="top" spacing={9} frame={{ maxWidth: "infinity", alignment: "leading" }}>
      <Image
        systemName={state.icon}
        imageScale="large"
        foregroundStyle={state.color}
        frame={{ width: 24, alignment: "top" }}
      />
      <VStack alignment="leading" spacing={3} frame={{ maxWidth: "infinity", alignment: "leading" }}>
        <HStack spacing={6} frame={{ maxWidth: "infinity", alignment: "leading" }}>
          <Text font="headline" foregroundStyle={primary} lineLimit={1} frame={{ maxWidth: "infinity", alignment: "leading" }}>
            {parcel.nickname}
          </Text>
          <Text font="footnote" foregroundStyle={state.color} lineLimit={1}>
            {state.label}
          </Text>
        </HStack>
        <Text font="footnote" foregroundStyle={primary} lineLimit={1}>
          {truncate(message, 34)}
        </Text>
        <Text font="caption2" foregroundStyle={secondary} lineLimit={1}>
          {carrier.name} · {maskTrackingNumber(parcel.trackingNumber)} · {formatClock(snapshot?.updatedAt)}
        </Text>
      </VStack>
    </HStack>
  )
}

function EmptyWidget() {
  return (
    <VStack alignment="leading" spacing={8} frame={{ maxWidth: "infinity", maxHeight: "infinity", alignment: "center" }}>
      <Image systemName="shippingbox.fill" imageScale="large" foregroundStyle="#FF8A3D" />
      <Text font="headline" foregroundStyle={primary}>暂无快递</Text>
      <Text font="caption" foregroundStyle={secondary}>打开 ParcelBoard 添加单号</Text>
    </VStack>
  )
}

function SmallWidget({ parcel, snapshot }: { parcel: Parcel; snapshot?: ParcelSnapshot }) {
  const state = displayState(snapshot)
  return (
    <VStack alignment="leading" spacing={7} frame={{ maxWidth: "infinity", maxHeight: "infinity", alignment: "topLeading" }}>
      <HStack frame={{ maxWidth: "infinity", alignment: "leading" }}>
        <Image systemName={state.icon} imageScale="large" foregroundStyle={state.color} />
        <Text font="caption" foregroundStyle={secondary} frame={{ maxWidth: "infinity", alignment: "trailing" }}>
          {formatClock(snapshot?.updatedAt)}
        </Text>
      </HStack>
      <Text font="headline" foregroundStyle={primary} lineLimit={1}>{parcel.nickname}</Text>
      <Text font="title3" foregroundStyle={state.color} lineLimit={1}>{state.label}</Text>
      <Text font="caption" foregroundStyle={primary} lineLimit={2}>
        {truncate(snapshot?.latestMessage || snapshot?.error || "等待首次查询", 38)}
      </Text>
    </VStack>
  )
}

function ParcelWidget() {
  const parcels = loadParcels()
  const snapshots = loadSnapshots()
  if (parcels.length === 0) return <EmptyWidget />
  if (Widget.family === "systemSmall") {
    return <SmallWidget parcel={parcels[0]} snapshot={snapshots[parcels[0].id]} />
  }

  const limit = Widget.family === "systemLarge" ? 5 : 2
  const visible = parcels.slice(0, limit)
  const lastUpdated = Math.max(0, ...visible.map((parcel) => snapshots[parcel.id]?.updatedAt ?? 0))
  const configured = loadCredentials() != null

  return (
    <VStack alignment="leading" spacing={10} frame={{ maxWidth: "infinity", maxHeight: "infinity", alignment: "topLeading" }}>
      <HStack spacing={8} frame={{ maxWidth: "infinity", alignment: "leading" }}>
        <Text font="headline" foregroundStyle={primary} frame={{ maxWidth: "infinity", alignment: "leading" }}>
          快递 · {parcels.length} 件
        </Text>
        <Text font="caption2" foregroundStyle={secondary}>{formatClock(lastUpdated)}</Text>
        <Button intent={RefreshParcelsIntent(undefined)} buttonStyle="plain">
          <Image systemName="arrow.clockwise" imageScale="small" foregroundStyle="#FF8A3D" />
        </Button>
      </HStack>
      {!configured ? (
        <Text font="caption" foregroundStyle="#C27C0E">打开脚本配置快递100 API</Text>
      ) : null}
      {visible.map((parcel) => (
        <ParcelRow key={parcel.id} parcel={parcel} snapshot={snapshots[parcel.id]} />
      ))}
      {parcels.length > limit ? (
        <Text font="caption2" foregroundStyle={secondary}>另有 {parcels.length - limit} 件快递</Text>
      ) : null}
    </VStack>
  )
}

async function run() {
  await refreshAllParcels()
  Widget.present(
    <VStack
      padding={14}
      widgetBackground={background}
      frame={{ maxWidth: "infinity", maxHeight: "infinity", alignment: "topLeading" }}
    >
      <ParcelWidget />
    </VStack>,
    {
      reloadPolicy: {
        policy: "after",
        date: new Date(Date.now() + MIN_REFRESH_INTERVAL_MS),
      },
    },
  )
}

run()
