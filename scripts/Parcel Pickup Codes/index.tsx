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
import { formatClock } from "./domain"
import { loadPickupCodes, savePickupCodes } from "./storage"
import type { PickupCode } from "./types"

function App() {
  const [codes, setCodes] = useState<PickupCode[]>(() => loadPickupCodes())
  const [deleteArmedId, setDeleteArmedId] = useState("")

  function deleteCode(item: PickupCode) {
    const next = loadPickupCodes().filter((code) => code.id !== item.id)
    savePickupCodes(next)
    setCodes(next)
    setDeleteArmedId("")
    Widget.reloadAll()
  }

  return (
    <NavigationStack>
      <List navigationTitle="快递取件码" navigationBarTitleDisplayMode="inline">
        <Section
          header={<Text>自动抓取设置</Text>}
          footer={<Text>iOS 不向第三方 App 开放短信收件箱；系统快捷指令会在收到短信时把正文传给本脚本。</Text>}
        >
          <Text>1. 打开“快捷指令”→“自动化”→“信息”。</Text>
          <Text>2. 选择“立即运行”，关键词填写“码”。</Text>
          <Text>3. 添加 Scripting 的“Run Script”，选择“快递取件码”。</Text>
          <Text>4. 输入选择“快捷指令输入”中的“信息内容”。</Text>
        </Section>

        <Section header={<Text>组件</Text>}>
          <Button title="预览中号组件" action={() => Widget.preview({ family: "systemMedium" })} />
        </Section>

        {codes.length === 0 ? (
          <Section header={<Text>取件码</Text>}>
            <Text>等待收到包含“取件码”的短信。</Text>
          </Section>
        ) : codes.map((item) => (
          <Section key={item.id} header={<Text>{item.carrier}</Text>}>
            <Text>{item.code}</Text>
            <Text>{formatClock(item.receivedAt)}</Text>
            {deleteArmedId === item.id ? (
              <>
                <Button title={`确认删除 ${item.code}`} role="destructive" action={() => deleteCode(item)} />
                <Button title="取消" action={() => setDeleteArmedId("")} />
              </>
            ) : (
              <Button title="删除…" action={() => setDeleteArmedId(item.id)} />
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
