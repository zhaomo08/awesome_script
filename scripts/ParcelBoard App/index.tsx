import {
  Button,
  List,
  Navigation,
  NavigationStack,
  Picker,
  Script,
  Section,
  SecureField,
  Text,
  TextField,
  Widget,
  useState,
} from "scripting"
import { CARRIERS, getCarrier, isTrackingNumberValid, parseSmsText } from "./domain"
import {
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

function App() {
  const [parcels, setParcels] = useState<Parcel[]>(() => loadParcels())
  const [configured, setConfigured] = useState(() => loadCredentials() != null)
  const [status, setStatus] = useState("")
  const [customer, setCustomer] = useState(() => loadCredentials()?.customer ?? "")
  const [key, setKey] = useState("")
  const [carrierCode, setCarrierCode] = useState(CARRIERS[0].code)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [nickname, setNickname] = useState("")
  const [phone, setPhone] = useState("")
  const [deleteArmedId, setDeleteArmedId] = useState("")

  const selectedCarrier = getCarrier(carrierCode)

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
    }
  }

  async function saveApi() {
    const current = loadCredentials()
    const nextCustomer = customer.trim()
    const nextKey = key.trim() || current?.key || ""
    if (!nextCustomer || !nextKey) {
      setStatus("配置失败：customer 和 key 都不能为空。")
      return
    }
    saveApiConsent(true)
    saveCredentials({ customer: nextCustomer, key: nextKey })
    setCustomer(nextCustomer)
    setKey("")
    setStatus("快递100 API 已保存。")
    Widget.reloadAll()
  }

  async function addParcel() {
    const compactNumber = trackingNumber.replace(/\s+/g, "")
    if (!isTrackingNumberValid(compactNumber)) {
      setStatus("添加失败：请输入 6–32 位字母、数字或连字符组成的运单号。")
      return
    }
    if (loadParcels().some(
      (parcel) => parcel.carrierCode === carrierCode && parcel.trackingNumber === compactNumber,
    )) {
      setStatus("添加失败：这个运单号已经存在。")
      return
    }
    if (selectedCarrier.requiresPhone && !phone.trim()) {
      setStatus(`添加失败：${selectedCarrier.name}查询需要关联手机号。`)
      return
    }

    const parcel: Parcel = {
      id: newId(),
      nickname: nickname.trim() || selectedCarrier.name,
      carrierCode,
      trackingNumber: compactNumber,
      phone: selectedCarrier.requiresPhone ? phone.trim() : undefined,
      createdAt: Date.now(),
    }
    saveParcels([...loadParcels(), parcel])
    setTrackingNumber("")
    setNickname("")
    setPhone("")
    setStatus(`已添加：${parcel.nickname}。`)
    Widget.reloadAll()
  }

  async function refreshNow() {
    if (!loadCredentials()) {
      setStatus("刷新失败：请先保存快递100 API 配置。")
      return
    }
    if (loadParcels().length === 0) {
      setStatus("刷新失败：请先添加一个运单号。")
      return
    }
    setStatus("正在刷新…")
    const result = await refreshAllParcels()
    const cacheNote = result.skipped > 0 ? `；${result.skipped} 件仍在 30 分钟缓存期内` : ""
    setStatus(`刷新完成：成功 ${result.refreshed} 件，失败 ${result.failed} 件${cacheNote}。`)
    Widget.reloadAll()
  }

  async function deleteParcel(parcel: Parcel) {
    saveParcels(loadParcels().filter((item) => item.id !== parcel.id))
    removeParcelData(parcel.id)
    setDeleteArmedId("")
    setStatus(`已删除：${parcel.nickname}。`)
    Widget.reloadAll()
  }

  async function identifyFromClipboard() {
    let text = ""
    try {
      if (typeof (Pasteboard as any)?.readString === "function") {
        text = (await (Pasteboard as any).readString()) ?? ""
      } else if (typeof (Pasteboard as any)?.getString === "function") {
        text = (await (Pasteboard as any).getString()) ?? ""
      } else if (typeof (Pasteboard as any)?.string === "string") {
        text = (Pasteboard as any).string
      }
    } catch {
      setStatus("读取剪贴板失败，请确保已允许访问剪贴板。")
      return
    }

    if (!text || text.trim().length === 0) {
      setStatus("剪贴板内容为空，请先复制快递短信。")
      return
    }

    const result = parseSmsText(text)
    if (!result) {
      setStatus("未能从剪贴板文本中识别出快递单号。")
      return
    }

    setCarrierCode(result.carrierCode)
    setTrackingNumber(result.trackingNumber)
    const carrier = getCarrier(result.carrierCode)
    setStatus(`已识别：${carrier.name} · ${result.trackingNumber}`)
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
          <Text>{`版本 ${Script.metadata.version} · 声明式表单`}</Text>
          {status ? <Text>{status}</Text> : null}
        </Section>

        <Section
          header={<Text>快递100 API</Text>}
          footer={<Text>保存即表示同意：查询时会将快递公司、运单号及可选手机号发送给快递100；customer 和 key 仅保存在当前脚本的私有 Storage。</Text>}
        >
          <TextField
            title="customer"
            value={customer}
            onChanged={setCustomer}
            prompt="企业管理后台 customer"
          />
          <SecureField
            title="key"
            value={key}
            onChanged={setKey}
            prompt={configured ? "已保存；留空保持原 key" : "企业管理后台 key"}
          />
          <Button title={configured ? "保存 API 配置" : "同意数据说明并保存"} action={() => runAction(saveApi)} />
        </Section>

        <Section
          header={<Text>添加快递</Text>}
          footer={<Text>支持复制快递短信后点击“从剪贴板识别”，自动提取快递公司和运单号。</Text>}
        >
          <Button title="从剪贴板识别短信" action={() => runAction(identifyFromClipboard)} />
          <Picker
            title="快递公司"
            value={carrierCode}
            onChanged={(value: string | number) => {
              setCarrierCode(String(value))
              setPhone("")
            }}
            pickerStyle="navigationLink"
          >
            {CARRIERS.map((carrier) => <Text key={carrier.code} tag={carrier.code}>{carrier.name}</Text>)}
          </Picker>
          <TextField
            title="运单号"
            value={trackingNumber}
            onChanged={setTrackingNumber}
            prompt="6–32 位字母、数字或连字符"
          />
          <TextField
            title="名称"
            value={nickname}
            onChanged={setNickname}
            prompt={`例如：键盘；默认 ${selectedCarrier.name}`}
          />
          {selectedCarrier.requiresPhone ? (
            <TextField
              title="关联手机号"
              value={phone}
              onChanged={setPhone}
              prompt="收/寄件手机号；虚拟号保留后四位"
            />
          ) : null}
          <Button title="保存这件快递" action={() => runAction(addParcel)} />
        </Section>

        <Section header={<Text>刷新与预览</Text>}>
          <Button title="刷新到最新（30 分钟缓存）" action={() => runAction(refreshNow)} />
          <Button
            title="预览中号组件"
            action={() => runAction(async () => Widget.preview({ family: "systemMedium" }))}
          />
        </Section>

        {parcels.length === 0 ? (
          <Section header={<Text>快递列表</Text>}>
            <Text>暂无快递，请先点击“添加快递”。</Text>
          </Section>
        ) : parcels.map((parcel) => (
          <Section key={parcel.id} header={<Text>{parcel.nickname}</Text>}>
            <Text>{`${getCarrier(parcel.carrierCode).name} · ${parcel.trackingNumber}`}</Text>
            {deleteArmedId === parcel.id ? (
              <>
                <Text foregroundStyle="systemRed">只会删除当前脚本内保存的运单和缓存。</Text>
                <Button title={`确认删除“${parcel.nickname}”`} role="destructive" action={() => runAction(() => deleteParcel(parcel))} />
                <Button title="取消" action={() => setDeleteArmedId("")} />
              </>
            ) : (
              <Button title={`删除“${parcel.nickname}”…`} action={() => setDeleteArmedId(parcel.id)} />
            )}
          </Section>
        ))}
      </List>
    </NavigationStack>
  )
}

async function run() {
  await Navigation.present({ element: <App /> })
  Script.exit()
}

run()
