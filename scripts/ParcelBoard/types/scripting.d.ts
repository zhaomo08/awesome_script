declare namespace JSX {
  interface Element {}
  interface ElementChildrenAttribute { children: {} }
  interface IntrinsicAttributes { key?: string | number }
}

declare const Storage: {
  set<T>(key: string, value: T, options?: { shared: boolean }): boolean
  get<T>(key: string, options?: { shared: boolean }): T | null
  remove(key: string, options?: { shared: boolean }): void
}

declare const Dialog: {
  alert(options: { message: string; title?: string; buttonLabel?: string }): Promise<void>
  confirm(options: { message: string; title?: string; cancelLabel?: string; confirmLabel?: string }): Promise<boolean>
  prompt(options: {
    title: string
    message?: string
    defaultValue?: string
    obscureText?: boolean
    selectAll?: boolean
    placeholder?: string
    cancelLabel?: string
    confirmLabel?: string
    keyboardType?: string
  }): Promise<string | null>
  actionSheet(options: {
    title: string
    message?: string
    cancelButton?: boolean
    actions: Array<{ label: string; destructive?: boolean }>
  }): Promise<number | null>
}

declare const Data: {
  fromString(value: string): { toHexString(): string }
}

declare const Crypto: {
  md5(data: ReturnType<typeof Data.fromString>): { toHexString(): string }
}

type ScriptingResponse = {
  ok: boolean
  status: number
  json(): Promise<unknown>
}

declare function fetch(url: string, init?: {
  method?: string
  headers?: Record<string, string>
  body?: string
  timeout?: number
  debugLabel?: string
}): Promise<ScriptingResponse>

declare module "scripting" {
  export const AppIntentProtocol: { AppIntent: number }
  export const AppIntentManager: {
    register<T = undefined>(options: {
      name: string
      protocol: number
      perform: (params: T) => Promise<void>
    }): (params: T) => unknown
  }
  export const Button: (props: any) => JSX.Element
  export const HStack: (props: any) => JSX.Element
  export const Image: (props: any) => JSX.Element
  export const List: (props: any) => JSX.Element
  export const NavigationStack: (props: any) => JSX.Element
  export const Section: (props: any) => JSX.Element
  export const Text: (props: any) => JSX.Element
  export const VStack: (props: any) => JSX.Element
  export const Navigation: {
    present(options: { element: JSX.Element } | JSX.Element): Promise<void>
  }
  export function useState<T>(initial: T | (() => T)): [T, (value: T) => void]
  export const Script: { exit(result?: unknown): void }
  export const Widget: {
    family: string
    present(element: JSX.Element, reloadPolicy?: { policy: "after"; date: Date } | { policy: "atEnd" }): void
    preview(options?: { family?: string }): Promise<void>
    reloadAll(): void
  }
}
