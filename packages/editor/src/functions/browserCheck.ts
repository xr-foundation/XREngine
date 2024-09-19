
export const isSupportedBrowser = () => {
  const userAgent = window.navigator.userAgent
  const isGoogleChrome = /Chrome/.test(userAgent) && !/Chromium|Edg|OPR|Brave|CriOS/.test(userAgent)
  const isSafari = /^((?!chrome|androidg).)*safari/i.test(userAgent)

  return isGoogleChrome || isSafari
}
