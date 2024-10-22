
export const pipe =
  (...fns) =>
  (input) => {
    let tmp = input
    for (let i = 0; i < fns.length; i++) {
      const fn = fns[i]
      tmp = fn(tmp)
    }
    return tmp
  }
