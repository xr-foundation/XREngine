
import appRootPath from 'app-root-path'
import cli from 'cli'
import fs from 'fs'
import { join } from 'path'

cli.enable('status')

cli.main(async () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync(join(appRootPath.path, 'package.json')).toString())
    packageJson.workspaces = [
      'packages/common',
      'packages/ecs',
      'packages/engine',
      'packages/hyperflux',
      'packages/matchmaking',
      'packages/network',
      'packages/projects',
      'packages/server',
      'packages/server-core',
      'packages/spatial',
      'packages/visual-script',
      'packages/xrui',
      'packages/projects/projects/**'
    ]
    fs.writeFileSync(join(appRootPath.path, 'package-root-build.json'), Buffer.from(JSON.stringify(packageJson)))
    process.exit(0)
  } catch (err) {
    console.log('Error in creating root build package.json:')
    console.log(err)
    cli.fatal(err)
  }
})
