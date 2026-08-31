import { AppIntentManager, AppIntentProtocol, Widget } from "scripting"
import { removePickupCode } from "./storage"

export const RemovePickupCodeIntent = AppIntentManager.register({
  name: "RemovePickupCodeIntent",
  protocol: AppIntentProtocol.AppIntent,
  perform: async ({ id }: { id: string }) => {
    if (removePickupCode(id)) Widget.reloadAll()
  },
})
