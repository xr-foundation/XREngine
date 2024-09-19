/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const appRootPath = require('app-root-path')
const cli = require('cli')
const path = require('path')

cli.enable('status')

cli.main(async () => {
  try {
    const serverPackageJSONPath = path.join(appRootPath.path, 'packages/server-core/package.json')
    const defaultProjectJSONPath = path.join(
      appRootPath.path,
      'packages/projects/xrengine/default-project/manifest.json'
    )
    const templateProjectJSONPath = path.join(appRootPath.path, 'packages/projects/template-project/mainfest.json')
    const serverPackageJSON = JSON.parse(fs.readFileSync(serverPackageJSONPath, { encoding: 'utf-8' }))
    const defaultProjectJSON = JSON.parse(fs.readFileSync(defaultProjectJSONPath, { encoding: 'utf-8' }))
    const templateProjectJSON = JSON.parse(fs.readFileSync(templateProjectJSONPath, { encoding: 'utf-8' }))
    defaultProjectJSON.engineVersion = serverPackageJSON.version
    templateProjectJSON.engineVersion = serverPackageJSON.version
    fs.writeFileSync(defaultProjectJSONPath, Buffer.from(JSON.stringify(defaultProjectJSON, null, 2)))
    fs.writeFileSync(templateProjectJSONPath, Buffer.from(JSON.stringify(templateProjectJSON, null, 2)))
    console.log('Updated default-project and template-project XREngine version to', serverPackageJSON.version)
    process.exit(0)
  } catch (err) {
    console.log('Error bumping default-project and template project versions:')
    console.log(err)
    cli.fatal(err)
  }
})
