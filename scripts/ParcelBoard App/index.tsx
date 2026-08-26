import {
  Button,
  List,
  Navigation,
  NavigationStack,
  Script,
  Section,
  Text,
  Widget,
  useState,
} from "scripting"
import { CARRIERS, getCarrier, isTrackingNumberValid } from "./domain"
import {
  hasApiConsent,
  loadCredentials,
  loadParcels,
  removeParcelData,
  saveApiConsent,
  saveCredentials,
  saveParcels,
} from "./storage"
import { refreshAllParcels } from "./tracker"
import type { Parcel } from "./types"

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

async function configureApi() {
  if (!hasApiConsent()) {
    const accepted = await Dialog.confirm({
      title: "连接快递100",
      message: "查询时会把快递公司、运单号及你填写的可选手机号发送给快递100。授权码和密钥仅保存在本项目的私有 Storage 中。是否继续？",
      cancelLabel: "取消",
      confirmLabel: "同意并继续",
    })
    if (!accepted) return
    saveApiConsent(true)
  }

  const current = loadCredentials()
  const customer = await Dialog.prompt({
    title: "快递100 customer",
    message: "填写企业管理后台中的 customer 授权码。",
    defaultValue: current?.customer ?? "",
    placeholder: "customer",
    cancelLabel: "取消",
    confirmLabel: "下一步",
  })
  if (customer == null) return

  const key = await Dialog.prompt({
    title: "快递100 key",
    message: "密钥会保存到当前脚本的私有 Storage，不会写入源码。",
    placeholder: current ? "重新输入 key" : "key",
    obscureText: true,
    cancelLabel: "取消",
    confirmLabel: "保存",
  })
  if (key == null) return

  if (!customer.trim() || !key.trim()) {
    await Dialog.alert({ title: "无法保存", message: "customer 和 key 都不能为空。" })
    return
  }

  saveCredentials({ customer: customer.trim(), key: key.trim() })
  Widget.reloadAll()
  await Dialog.alert({ title: "配置完成", message: "现在可以添加并刷新快递了。" })
}

async function addParcel() {
  const carrierIndex = await Dialog.actionSheet({
    title: "选择快递公司",
    actions: CARRIERS.map((carrier) => ({ label: carrier.name })),
  })
  if (carrierIndex == null) return
  const carrier = CARRIERS[carrierIndex]

  const trackingNumber = await Dialog.prompt({
    title: `${carrier.name}运单号`,
    placeholder: "输入 6–32 位运单号",
    selectAll: true,
    cancelLabel: "取消",
    confirmLabel: "下一步",
  })
  if (trackingNumber == null) return
  const compactNumber = trackingNumber.replace(/\s+/g, "")
  if (!isTrackingNumberValid(compactNumber)) {
    await Dialog.alert({
      title: "运单号格式不正确",
      message: "请输入 6–32 位字母、数字或连字符。",
    })
    return
  }

  const duplicate = loadParcels().some(
    (parcel) => parcel.carrierCode === carrier.code && parcel.trackingNumber === compactNumber,
  )
  if (duplicate) {
    await Dialog.alert({ title: "已经添加", message: "这个运单号已在列表中。" })
    return
  }

  const nickname = await Dialog.prompt({
    title: "给它起个名字",
    placeholder: "例如：键盘、猫粮、生日礼物",
    defaultValue: carrier.name,
    cancelLabel: "取消",
    confirmLabel: "下一步",
  })
  if (nickname == null) return

  let phone: string | undefined
  if (carrier.requiresPhone) {
    const value = await Dialog.prompt({
      title: "填写关联手机号",
      message: `${carrier.name}查询要求提供收件人或寄件人手机号；电商虚拟号请保留“-”后的四位。`,
      placeholder: "手机号或含后四位的虚拟号",
      keyboardType: "phonePad",
      cancelLabel: "取消",
      confirmLabel: "保存",
    })
    if (value == null) return
    if (!value.trim()) {
      await Dialog.alert({ title: "缺少手机号", message: `${carrier.name}查询需要关联手机号。` })
      return
    }
    phone = value.trim()
  }

  const parcel: Parcel = {
    id: newId(),
    nickname: nickname.trim() || carrier.name,
    carrierCode: carrier.code,
    trackingNumber: compactNumber,
    phone,
    createdAt: Date.now(),
  }
  saveParcels([...loadParcels(), parcel])
  Widget.reloadAll()
  await Dialog.alert({ title: "已添加", message: `${parcel.nickname} 已加入快递汇总。` })
}

async function deleteParcel() {
  const parcels = loadParcels()
  if (parcels.length === 0) {
    await Dialog.alert({ title: "暂无快递", message: "当前没有可以删除的运单。" })
    return
  }
  const index = await Dialog.actionSheet({
    title: "删除快递",
    actions: parcels.map((parcel) => ({
      label: `${parcel.nickname} · ${getCarrier(parcel.carrierCode).name}`,
      destructive: true,
    })),
  })
  if (index == null) return
  const parcel = parcels[index]
  const confirmed = await Dialog.confirm({
    title: `删除“${parcel.nickname}”？`,
    message: "只会删除本地保存的运单和缓存，不会在快递平台执行其他操作。",
    cancelLabel: "取消",
    confirmLabel: "删除",
  })
  if (!confirmed) return

  saveParcels(parcels.filter((item) => item.id !== parcel.id))
  removeParcelData(parcel.id)
  Widget.reloadAll()
}

async function refreshNow() {
  if (!loadCredentials()) {
    await Dialog.alert({ title: "尚未配置 API", message: "请先选择“配置快递100 API”。" })
    return
  }
  if (loadParcels().length === 0) {
    await Dialog.alert({ title: "暂无快递", message: "请先添加一个运单号。" })
    return
  }

  const result = await refreshAllParcels()
  Widget.reloadAll()
  const cacheNote = result.skipped > 0 ? `；${result.skipped} 件仍在 30 分钟缓存期内` : ""
  await Dialog.alert({
    title: "刷新完成",
    message: `成功 ${result.refreshed} 件，失败 ${result.failed} 件${cacheNote}。`,
  })
}

function App() {
  const [parcels, setParcels] = useState<Parcel[]>(() => loadParcels())
  const [configured, setConfigured] = useState(() => loadCredentials() != null)
  const [status, setStatus] = useState("")

  function syncState() {
    setParcels([...loadParcels()])
    setConfigured(loadCredentials() != null)
  }

  async function runAction(action: () => Promise<void>) {
    try {
      await action()
      syncState()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setStatus(`操作失败：${message}`)
      await Dialog.alert({ title: "ParcelBoard 操作失败", message })
    }
  }

  return (
    <NavigationStack>
      <List navigationTitle="快递进度汇总" navigationBarTitleDisplayMode="inline">
        <Section
          header={<Text>当前状态</Text>}
          footer={<Text>查询快递时会把快递公司、运单号及可选手机号发送给快递100；凭据只保存在当前脚本的私有 Storage。</Text>}
        >
          <Text>{configured ? "快递100 API 已配置" : "尚未配置快递100 API"}</Text>
          <Text>{`已添加 ${parcels.length} 件快递`}</Text>
          {status ? <Text>{status}</Text> : null}
        </Section>

        <Section header={<Text>操作</Text>}>
          <Button title="添加快递" action={() => runAction(addParcel)} />
          <Button
            title="刷新到最新（30 分钟缓存）"
            action={() => runAction(async () => {
              setStatus("正在刷新…")
              await refreshNow()
              setStatus("刷新完成")
            })}
          />
          <Button
            title="预览中号组件"
            action={() => runAction(async () => Widget.preview({ family: "systemMedium" }))}
          />
          <Button
            title={configured ? "重新配置快递100 API" : "配置快递100 API"}
            action={() => runAction(configureApi)}
          />
        </Section>

        <Section header={<Text>快递列表</Text>}>
          {parcels.length === 0 ? (
            <Text>暂无快递，请先点击“添加快递”。</Text>
          ) : (
            parcels.map((parcel) => (
              <Text key={parcel.id}>{`${parcel.nickname} · ${getCarrier(parcel.carrierCode).name}`}</Text>
            ))
          )}
          {parcels.length > 0 ? (
            <Button title="删除快递…" action={() => runAction(deleteParcel)} />
          ) : null}
        </Section>
      </List>
    </NavigationStack>
  )
}

Navigation.present({ element: <App /> }).then(() => Script.exit()).catch(async (error) => {
  const message = error instanceof Error ? error.message : String(error)
  try {
    await Dialog.alert({ title: "ParcelBoard 无法启动", message })
  } finally {
    Script.exit()
  }
})
