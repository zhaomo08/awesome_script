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

type ScriptingData = { toHexString(): string }

declare const Data: {
  fromRawString(value: string, encoding?: string): ScriptingData | null
}

declare const Crypto: {
  md5(data: ScriptingData): ScriptingData
}

declare const Pasteboard: {
  getString(): Promise<string | null>
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
  export const Picker: (props: any) => JSX.Element
  export const SecureField: (props: any) => JSX.Element
  export const Section: (props: any) => JSX.Element
  export const Text: (props: any) => JSX.Element
  export const TextField: (props: any) => JSX.Element
  export const VStack: (props: any) => JSX.Element
  export const Navigation: {
    present(options: { element: JSX.Element } | JSX.Element): Promise<void>
  }
  export function useState<T>(initial: T | (() => T)): [T, (value: T) => void]
  export const Script: {
    metadata: { version: string }
    exit(result?: unknown): void
  }
  export const Widget: {
    family: string
    present(element: JSX.Element, options?: {
      reloadPolicy?: { policy: "after"; date: Date } | { policy: "atEnd" }
    }): void
    preview(options?: { family?: string }): Promise<void>
    reloadAll(): void
  }
}
