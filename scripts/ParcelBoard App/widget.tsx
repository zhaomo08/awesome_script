import { HStack, Image, Text, VStack, Widget } from "scripting"
import { formatClock, getCarrier, maskTrackingNumber } from "./domain"
import { loadParcels } from "./storage"
import type { Parcel } from "./types"

const background = { light: "#F8F9FB", dark: "#151619" }
const primary = { light: "#17181A", dark: "#F7F7F8" }
const secondary = { light: "#73767C", dark: "#A7A9AE" }

function ParcelRow({ parcel }: { parcel: Parcel }) {
  return (
    <HStack spacing={9} frame={{ maxWidth: "infinity", alignment: "leading" }}>
      <Image systemName="message.fill" imageScale="large" foregroundStyle="#FF8A3D" />
      <VStack alignment="leading" spacing={3} frame={{ maxWidth: "infinity", alignment: "leading" }}>
        <Text font="headline" foregroundStyle={primary} lineLimit={1}>{parcel.nickname}</Text>
        <Text font="caption" foregroundStyle={secondary} lineLimit={1}>
          {getCarrier(parcel.carrierCode).name} · {maskTrackingNumber(parcel.trackingNumber)} · {formatClock(parcel.importedAt)}
        </Text>
      </VStack>
    </HStack>
  )
}

function ParcelWidget() {
  const parcels = loadParcels()
  if (parcels.length === 0) {
    return (
      <VStack spacing={8} frame={{ maxWidth: "infinity", maxHeight: "infinity", alignment: "center" }}>
        <Image systemName="message.fill" imageScale="large" foregroundStyle="#FF8A3D" />
        <Text font="headline" foregroundStyle={primary}>暂无快递短信</Text>
        <Text font="caption" foregroundStyle={secondary}>打开脚本从剪贴板导入</Text>
      </VStack>
    )
  }

  const limit = Widget.family === "systemLarge" ? 6 : Widget.family === "systemSmall" ? 2 : 3
  return (
    <VStack alignment="leading" spacing={10} frame={{ maxWidth: "infinity", maxHeight: "infinity", alignment: "topLeading" }}>
      <Text font="headline" foregroundStyle={primary}>快递短信 · {parcels.length} 件</Text>
      {parcels.slice(0, limit).map((parcel) => <ParcelRow key={parcel.id} parcel={parcel} />)}
      {parcels.length > limit ? (
        <Text font="caption2" foregroundStyle={secondary}>另有 {parcels.length - limit} 件</Text>
      ) : null}
    </VStack>
  )
}

Widget.present(
  <VStack
    padding={14}
    widgetBackground={background}
    frame={{ maxWidth: "infinity", maxHeight: "infinity", alignment: "topLeading" }}
  >
    <ParcelWidget />
  </VStack>,
)
