export const getI18nConfigs = (modules: { [module: string]: any }) => {
  if (!Object.keys(modules).length) return {}
  const resources = Object.entries(modules).reduce((obj, [key, translation]) => {
    const [language, namespace] = key
      .slice(key.indexOf('/i18n/') + 6)
      .replace('.json', '')
      .split('/')

    if (!obj[language]) {
      obj[language] = {}
    }
    obj[language][namespace] = obj[language][namespace]
      ? {
          ...obj[language][namespace],
          ...translation,
          default: { ...obj[language][namespace].default, ...translation.default }
        }
      : translation

    return obj
  }, {} as any)
  return {
    resources,
    namespace: Object.keys(resources['en'])
  }
}
