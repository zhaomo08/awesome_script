import { Button, HStack, Image, Text, VStack, Widget } from "scripting"
import { RemovePickupCodeIntent } from "./app_intents"
import { formatClock } from "./domain"
import { loadPickupCodes } from "./storage"
import type { PickupCode } from "./types"

const background = { light: "#F8F9FB", dark: "#151619" }
const primary = { light: "#17181A", dark: "#F7F7F8" }
const secondary = { light: "#73767C", dark: "#A7A9AE" }

function CodeRow({ item }: { item: PickupCode }) {
  return (
    <HStack spacing={10} frame={{ maxWidth: "infinity", alignment: "leading" }}>
      <Image systemName="shippingbox.fill" imageScale="large" foregroundStyle="#FF8A3D" />
      <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity", alignment: "leading" }}>
        <Text font="title3" fontWeight="bold" foregroundStyle={primary} lineLimit={1}>{item.code}</Text>
        <Text font="caption" foregroundStyle={secondary}>{item.carrier} · {formatClock(item.receivedAt)}</Text>
      </VStack>
      <Button
        title="已取件"
        systemImage="checkmark.circle"
        buttonStyle="plain"
        intent={RemovePickupCodeIntent({ id: item.id })}
      />
    </HStack>
  )
}

function PickupCodeWidget() {
  const codes = loadPickupCodes()
  if (codes.length === 0) {
    return (
      <VStack spacing={8} frame={{ maxWidth: "infinity", maxHeight: "infinity", alignment: "center" }}>
        <Image systemName="shippingbox.fill" imageScale="large" foregroundStyle="#FF8A3D" />
        <Text font="headline" foregroundStyle={primary}>暂无取件码</Text>
        <Text font="caption" foregroundStyle={secondary}>等待短信自动化</Text>
      </VStack>
    )
  }

  const limit = Widget.family === "systemLarge" ? 6 : Widget.family === "systemSmall" ? 2 : 3
  return (
    <VStack alignment="leading" spacing={10} frame={{ maxWidth: "infinity", maxHeight: "infinity", alignment: "topLeading" }}>
      <Text font="headline" foregroundStyle={primary}>快递取件码</Text>
      {codes.slice(0, limit).map((item) => <CodeRow key={item.id} item={item} />)}
    </VStack>
  )
}

Widget.present(
  <VStack
    padding={14}
    widgetBackground={background}
    frame={{ maxWidth: "infinity", maxHeight: "infinity", alignment: "topLeading" }}
  >
    <PickupCodeWidget />
  </VStack>,
)
