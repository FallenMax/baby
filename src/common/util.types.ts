export type Nullable<T> = {
  [P in keyof T]?: T[P] | null | undefined
}
export type OptionalPick<T, K extends keyof T> = {
  [P in K]?: T[P] | undefined
}

export type AnyFunction = (...args: any) => any

export type ReturnPromise<T> = T extends AnyFunction
  ? (
      ...parameters: Parameters<T>
    ) => ReturnType<T> extends Promise<any>
      ? ReturnType<T>
      : Promise<ReturnType<T>>
  : {
      [K in keyof T]: ReturnPromise<T[K]>
    }
