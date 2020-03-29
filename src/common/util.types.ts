export type Nullable<T> = {
  [P in keyof T]?: T[P] | null | undefined
}
export type OptionalPick<T, K extends keyof T> = {
  [P in K]?: T[P] | undefined
}

export type AnyFunction = (...args: any) => any

export type MakeAsync<T> = T extends AnyFunction
  ? (
      ...parameters: Parameters<T>
    ) => ReturnType<T> extends Promise<any>
      ? ReturnType<T>
      : Promise<ReturnType<T>>
  : {
      [K in keyof T]: MakeAsync<T[K]>
    }

export type AddParameter<T, P> = T extends AnyFunction
  ? (params: Parameters<T>[0], parameter: P) => ReturnType<T>
  : {
      [K in keyof T]: AddParameter<T[K], P>
    }
