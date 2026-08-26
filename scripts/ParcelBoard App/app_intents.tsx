import { AppIntentManager, AppIntentProtocol, Widget } from "scripting"
import { refreshAllParcels } from "./tracker"

export const RefreshParcelsIntent = AppIntentManager.register({
  name: "RefreshParcelsIntent",
  protocol: AppIntentProtocol.AppIntent,
  perform: async (_params: undefined) => {
    await refreshAllParcels()
    Widget.reloadAll()
  },
})
