import {
  CancelableUploadPromiseArrayReturnType,
  CancelableUploadPromiseReturnType,
  uploadToFeathersService
} from '@xrengine/client-core/src/util/upload'
import { API } from '@xrengine/common'
import { assetLibraryPath, fileBrowserPath, fileBrowserUploadPath } from '@xrengine/common/src/schema.type.module'
import { processFileName } from '@xrengine/common/src/utils/processFileName'
import { pathJoin } from '@xrengine/engine/src/assets/functions/miscUtils'
import { modelResourcesPath } from '@xrengine/engine/src/assets/functions/pathResolver'

export const handleUploadFiles = (projectName: string, directoryPath: string, files: FileList | File[]) => {
  return Promise.all(
    Array.from(files).map((file) => {
      const fileDirectory = file.webkitRelativePath || file.name
      return uploadToFeathersService(fileBrowserUploadPath, [file], {
        args: [
          {
            project: projectName,
            path: directoryPath.replace('projects/' + projectName + '/', '') + fileDirectory,
            type: 'asset',
            contentType: file.type
          }
        ]
      }).promise
    })
  )
}

/**
 * @param config
 * @param config.projectName input and upload the file to the assets directory of the project
 * @param config.directoryPath input and upload the file to the `directoryPath`
 */
export const inputFileWithAddToScene = ({
  projectName,
  directoryPath,
  preserveDirectory
}: {
  projectName: string
  directoryPath: string
  preserveDirectory?: boolean
}): Promise<null> =>
  new Promise((resolve, reject) => {
    const el = document.createElement('input')
    el.type = 'file'
    if (preserveDirectory) {
      el.setAttribute('webkitdirectory', 'webkitdirectory')
    }
    el.multiple = true
    el.style.display = 'none'

    el.onchange = async () => {
      try {
        if (el.files?.length) {
          const newFiles: File[] = []
          for (let i = 0; i < el.files.length; i++) {
            let fileName = el.files[i].name
            if (fileName.length > 64) {
              fileName = fileName.slice(0, 64)
            } else if (fileName.length < 4) {
              fileName = fileName + '0000'
            }
            newFiles.push(new File([el.files[i]], fileName, { type: el.files[i].type }))
          }
          await handleUploadFiles(projectName, directoryPath, el.files)
        }
        resolve(null)
      } catch (err) {
        reject(err)
      } finally {
        el.remove()
      }
    }

    el.click()
  })

export const uploadProjectFiles = (projectName: string, files: File[], paths: string[], args?: object[]) => {
  const promises: CancelableUploadPromiseReturnType<string>[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const fileDirectory = paths[i].replace('projects/' + projectName + '/', '')
    const filePath = fileDirectory ? pathJoin(fileDirectory, file.name) : file.name
    const fileArgs = args?.[i] ?? {}
    promises.push(
      uploadToFeathersService(fileBrowserUploadPath, [file], {
        args: [{ contentType: '', ...fileArgs, project: projectName, path: filePath }]
      })
    )
  }

  return {
    cancel: () => promises.forEach((promise) => promise.cancel()),
    promises: promises.map((promise) => promise.promise)
  } as CancelableUploadPromiseArrayReturnType<string>
}

export async function clearModelResources(projectName: string, modelName: string) {
  const resourcePath = `projects/${projectName}/assets/${modelResourcesPath(modelName)}`
  const exists = await API.instance.service(fileBrowserPath).get(resourcePath)
  if (exists) {
    await API.instance.service(fileBrowserPath).remove(resourcePath)
  }
}

export const uploadProjectAssetsFromUpload = async (
  projectName: string,
  entries: FileSystemEntry[],
  onProgress = (...args: any[]) => {}
) => {
  const promises: CancelableUploadPromiseReturnType<string>[] = []

  for (let i = 0; i < entries.length; i++) {
    await processEntry(entries[i], projectName, '', promises, (progress) => onProgress(i + 1, entries.length, progress))
  }

  return {
    cancel: () => promises.forEach((promise) => promise.cancel()),
    promises: promises.map((promise) => promise.promise)
  } as CancelableUploadPromiseArrayReturnType<string>
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/webkitGetAsEntry
 * @param item
 */
export const processEntry = async (
  item,
  projectName: string,
  directory: string,
  promises: CancelableUploadPromiseReturnType<string>[],
  onProgress
) => {
  if (item.isDirectory) {
    const directoryReader = item.createReader()
    const entries = await getEntries(directoryReader)
    for (let index = 0; index < entries.length; index++) {
      await processEntry(entries[index], projectName, item.fullPath, promises, onProgress)
    }
  }

  if (item.isFile) {
    const file = await getFile(item)
    const name = processFileName(file.name)
    const path = `assets${directory}/` + name

    promises.push(
      uploadToFeathersService(
        fileBrowserUploadPath,
        [file],
        { args: [{ project: projectName, path, contentType: file.type }] },
        onProgress
      )
    )
  }
}

/**
 * https://stackoverflow.com/a/53113059
 * @param fileEntry
 * @returns
 */
export const getFile = async (fileEntry: FileSystemFileEntry): Promise<File> => {
  try {
    return await new Promise((resolve, reject) => fileEntry.file(resolve, reject))
  } catch (err) {
    console.log(err)
    return null!
  }
}

export const getEntries = async (directoryReader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> => {
  try {
    return await new Promise((resolve, reject) => directoryReader.readEntries(resolve, reject))
  } catch (err) {
    console.log(err)
    return null!
  }
}

export const extractZip = async (path: string): Promise<any> => {
  try {
    const params = { path: path }
    await API.instance.service(assetLibraryPath).create(params)
  } catch (err) {
    console.error('error extracting zip: ', err)
  }
}

export const downloadBlobAsZip = (blob: Blob, fileName: string) => {
  const anchorElement = document.createElement('a')
  anchorElement.href = URL.createObjectURL(blob)
  anchorElement.download = fileName + '.zip'
  document.body.appendChild(anchorElement)
  anchorElement.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    })
  )
  document.body.removeChild(anchorElement)
}
