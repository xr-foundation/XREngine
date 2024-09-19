
import fs from 'fs'
import path from 'path'

import { StorageProviderInterface } from './storageprovider/storageprovider.interface'

export const copyRecursiveSync = function (src: string, dest: string): void {
  if (!fs.existsSync(src)) return

  if (fs.lstatSync(src).isDirectory()) {
    fs.mkdirSync(dest)
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName))
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}

export const getIncrementalName = async function (
  name: string,
  directoryPath: string,
  store: StorageProviderInterface,
  isDirectory?: boolean
): Promise<string> {
  let filename = name

  if (!(await store.doesExist(filename, directoryPath))) return filename
  if (isDirectory && !(await store.isDirectory(filename, directoryPath))) return filename

  let count = 1

  if (isDirectory) {
    while (await store.isDirectory(filename, directoryPath)) {
      filename = `${name}(${count})`
      count++
    }
  } else {
    const extension = path.extname(name)
    const baseName = path.basename(name, extension)

    while (await store.doesExist(filename, directoryPath)) {
      filename = `${baseName}(${count})${extension}`
      count++
    }
  }

  return filename
}
