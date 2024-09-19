import appRootPath from 'app-root-path'
import fs from 'fs'
import type { Knex } from 'knex'
import path from 'path'

import appConfig from '@xrengine/server-core/src/appconfig'

const migrationsDirectories: string[] = []

const parseDirectory = (directoryPath: string) => {
  const directoryContent = fs.readdirSync(directoryPath, { withFileTypes: true }).filter((dir) => dir.isDirectory())
  for (const directory of directoryContent) {
    const subFolder = path.join(directoryPath, directory.name)
    if (directory.name === 'migrations') {
      migrationsDirectories.push(subFolder)
    } else {
      parseDirectory(subFolder)
    }
  }
}

const currentDirectory = process.cwd()
const currentFolderName = path.basename(path.resolve(process.cwd())) // https://stackoverflow.com/a/53295230/2077741

let serverCoreSrc = '../server-core/src'

if (currentFolderName === 'server-core') {
  serverCoreSrc = './src'
} else if (currentDirectory.includes('projects/projects')) {
  serverCoreSrc = '../../../../server-core/src'
} else {
  serverCoreSrc = path.join(appRootPath.path, '/packages/server-core/src')
}

parseDirectory(serverCoreSrc)

const projectsDirectory = path.join(appRootPath.path, '/packages/projects/projects')
const projectsExists = fs.existsSync(projectsDirectory)

if (projectsExists) {
  parseDirectory(projectsDirectory)
}

const config: Knex.Config = {
  client: 'mysql',
  connection: {
    user: appConfig.db.username,
    password: appConfig.db.password,
    host: appConfig.db.host,
    port: parseInt(appConfig.db.port),
    database: appConfig.db.database,
    charset: 'utf8mb4',
    multipleStatements: true
  },
  migrations: {
    directory: migrationsDirectories,
    tableName: 'knex_migrations',
    stub: 'migration.stub',
    extension: 'ts',
    disableMigrationsListValidation: true
  },
  pool: {
    min: 5,
    max: 30
  }
}

// const config: Knex.Config = {
//     client: "sqlite3",
//     connection: {
//       filename: "./dev.sqlite3"
//     }
// }

module.exports = config
