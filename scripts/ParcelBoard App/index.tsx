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
import { getCarrier, parseSmsText } from "./domain"
import { loadParcels, saveParcels } from "./storage"
import type { Parcel } from "./types"

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function App() {
  const [parcels, setParcels] = useState<Parcel[]>(() => loadParcels())
  const [status, setStatus] = useState("")
  const [deleteArmedId, setDeleteArmedId] = useState("")

  async function importSms() {
    let text: string | null
    try {
      text = await Pasteboard.getString()
    } catch {
      setStatus("读取剪贴板失败，请在系统设置中允许 Scripting 访问剪贴板。")
      return
    }

    const result = parseSmsText(text ?? "")
    if (!result) {
      setStatus(text?.trim() ? "未识别出支持的快递单号。" : "剪贴板为空，请先复制快递短信。")
      return
    }

    const current = loadParcels()
    const existing = current.find(
      (parcel) => parcel.carrierCode === result.carrierCode
        && parcel.trackingNumber === result.trackingNumber,
    )
    const now = Date.now()
    const next = existing
      ? current.map((parcel) => parcel.id === existing.id ? { ...parcel, importedAt: now } : parcel)
      : [...current, {
        id: newId(),
        nickname: getCarrier(result.carrierCode).name,
        carrierCode: result.carrierCode,
        trackingNumber: result.trackingNumber,
        importedAt: now,
      }]

    saveParcels(next)
    setParcels(next)
    setStatus(`${existing ? "已更新" : "已导入"}：${getCarrier(result.carrierCode).name} · ${result.trackingNumber}`)
    Widget.reloadAll()
  }

  function deleteParcel(parcel: Parcel) {
    const next = loadParcels().filter((item) => item.id !== parcel.id)
    saveParcels(next)
    setParcels(next)
    setDeleteArmedId("")
    setStatus(`已删除：${parcel.nickname}。`)
    Widget.reloadAll()
  }

  return (
    <NavigationStack>
      <List navigationTitle="快递短信" navigationBarTitleDisplayMode="inline">
        <Section
          header={<Text>从短信导入</Text>}
          footer={<Text>先复制快递短信，再点击导入。只保存识别出的快递公司、运单号和导入时间，不发送网络请求。</Text>}
        >
          <Button title="从剪贴板导入快递短信" action={importSms} />
          {status ? <Text>{status}</Text> : null}
        </Section>

        <Section header={<Text>组件</Text>}>
          <Button title="预览中号组件" action={() => Widget.preview({ family: "systemMedium" })} />
        </Section>

        {parcels.length === 0 ? (
          <Section header={<Text>已导入快递</Text>}>
            <Text>暂无快递。</Text>
          </Section>
        ) : parcels.map((parcel) => (
          <Section key={parcel.id} header={<Text>{parcel.nickname}</Text>}>
            <Text>{`${getCarrier(parcel.carrierCode).name} · ${parcel.trackingNumber}`}</Text>
            {deleteArmedId === parcel.id ? (
              <>
                <Button title={`确认删除“${parcel.nickname}”`} role="destructive" action={() => deleteParcel(parcel)} />
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
