// This script adds our license header to any relevant files

import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const licenseHeader = `
`

const rootDir = join(__dirname, '..')
const targetExtensions = ['ts', 'js', 'tsx', 'jsx']

const files = execSync('git ls-files', { cwd: rootDir })
  .toString()
  .split('\n')
  .filter((file) => {
    return targetExtensions.some((ext) => file.endsWith('.' + ext))
  })

for (const f of files) {
  const file = readFileSync(join(rootDir, f), 'utf8')
  if (file.includes('Copyright')) continue
  writeFileSync(join(rootDir, f), licenseHeader + file)
}
