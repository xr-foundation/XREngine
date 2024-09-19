
import { API } from '@xrengine/common'

async function waitForClientAuthenticated(): Promise<void> {
  const api = API.instance // as FeathersClient
  console.log('Client authenticated?', api.authentication?.authenticated)
  if (api.authentication?.authenticated === true) return
  else
    return await new Promise((resolve) =>
      setTimeout(async () => {
        await waitForClientAuthenticated()
        resolve()
      }, 100)
    )
}

export default waitForClientAuthenticated
