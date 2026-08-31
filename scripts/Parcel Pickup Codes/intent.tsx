import { Intent, Script, Widget } from "scripting"
import { extractPickupCode } from "./domain"
import { upsertPickupCode } from "./storage"

const parameter = Intent.shortcutParameter
const text = parameter?.type === "text"
  ? String(parameter.value)
  : Intent.textsParameter?.[0] ?? ""
const match = extractPickupCode(text)

if (!match) {
  Script.exit(Intent.text("未识别到取件码"))
} else {
  upsertPickupCode(match.code, match.carrier)
  Widget.reloadAll()
  Script.exit(Intent.text(`已保存取件码 ${match.code}`))
}
