declare namespace JSX {
  interface Element {}
  interface ElementChildrenAttribute { children: {} }
  interface IntrinsicAttributes { key?: string | number }
}

declare const Storage: {
  set<T>(key: string, value: T, options?: { shared: boolean }): boolean
  get<T>(key: string, options?: { shared: boolean }): T | null
}

declare module "scripting" {
  export const AppIntentProtocol: { AppIntent: number }
  export const AppIntentManager: {
    register<T>(options: {
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
  export const Intent: {
    shortcutParameter?: { type: string; value: unknown }
    textsParameter?: string[]
    text(value: string): unknown
  }
  export const Navigation: {
    present(options: { element: JSX.Element } | JSX.Element): Promise<void>
  }
  export function useState<T>(initial: T | (() => T)): [T, (value: T) => void]
  export const Script: { exit(result?: unknown): void }
  export const Widget: {
    family: string
    present(element: JSX.Element): void
    preview(options?: { family?: string }): Promise<void>
    reloadAll(): void
  }
}
