const { defineProperties } = Object

export const ProxyWithECS = <T>(store: Record<string | keyof T, any>, obj: T, ...keys: (keyof T)[]) => {
  return defineProperties(
    obj,
    keys.reduce(
      (accum, key) => {
        accum[key] = {
          get() {
            return store[key]
          },
          set(n) {
            return (store[key] = n)
          },
          configurable: true
        }
        return accum
      },
      {} as Record<keyof T, any>
    )
  )
}
