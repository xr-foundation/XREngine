
import assert from 'assert'

import { fileBrowserPath } from '@xrengine/common/src/schemas/media/file-browser.schema'
import { destroyEngine } from '@xrengine/ecs/src/Engine'

import { ProjectType, projectPath, staticResourcePath } from '@xrengine/common/src/schema.type.module'
import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'
import { getStorageProvider } from '../storageprovider/storageprovider'

const PREFIX = 'test'

const getRandomizedName = (name: string, suffix = '', prefix = PREFIX) =>
  `${prefix}-${name}-${(Math.random() + 1).toString(36).substring(7)}${suffix}`

describe('file-browser.test', () => {
  let app: Application
  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  after(async () => {
    const directories = (await getStorageProvider().listFolderContent('projects/'))
      .map((directory) => directory.key)
      .filter((directory) => directory.startsWith('projects/test'))

    try {
      await Promise.all(directories.map((directory) => app.service(fileBrowserPath).remove(directory)))
    } catch (error) {
      console.error('Error while cleaning up test directories:', error)
    }
    await tearDownAPI()
    destroyEngine()
  })

  describe('create', () => {
    const testProjectName = `@org/${getRandomizedName('directory')}`
    let project: ProjectType
    after(async () => {
      await app.service(projectPath).remove(project.id)
    })

    it('creates a directory', async () => {
      project = await app.service(projectPath).create({ name: testProjectName })
      const createdDirectory = await app.service(fileBrowserPath).create('projects/' + testProjectName + '/public/')
      assert.equal(createdDirectory, true)
      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProjectName), true)
    })
  })

  describe('find', () => {
    const testProjectName = `@org/${getRandomizedName('directory')}`
    let project: ProjectType
    before(async () => {
      project = await app.service(projectPath).create({ name: testProjectName })
    })

    after(async () => {
      await app.service(projectPath).remove(project.id)
    })

    it('gets the directory', async () => {
      const foundDirectories = await app
        .service(fileBrowserPath)
        .find({ query: { directory: 'projects/' + testProjectName + '/public/' } })
      assert.equal(foundDirectories.total, 0)
    })

    it('filters entries using $like', async () => {
      const totalEntries = await app.service(fileBrowserPath).find({
        query: {
          directory: 'projects/' + testProjectName + '/public/'
        }
      })

      const filteredEntries = await app.service(fileBrowserPath).find({
        query: {
          key: {
            $like: `%${PREFIX}%`
          },
          directory: 'projects/' + testProjectName + '/public/'
        }
      })
      assert.ok(filteredEntries.data.length === totalEntries.data.length)

      const invalidSubstring = PREFIX + '$' // this substring is not present in any of the entries
      const emptyEntries = await app.service(fileBrowserPath).find({
        query: {
          key: {
            $like: `%${invalidSubstring}%`
          },
          directory: 'projects/' + testProjectName + '/public/'
        }
      })
      assert.ok(emptyEntries.data.length === 0)
    })
  })

  describe('patch', () => {
    const testProjectName = `@org/${getRandomizedName('directory')}`
    const testFileFullName = getRandomizedName('file', '.txt')
    const testFileFullPath = 'projects/' + testProjectName + '/public/' + testFileFullName
    const testFileName = testFileFullName.split('.')[0]

    const newData = getRandomizedName('new data')
    const body = Buffer.from(newData, 'utf-8')
    const testFileSize = Buffer.byteLength(body)
    let project: ProjectType

    before(async () => {
      project = await app.service(projectPath).create({ name: testProjectName })
    })

    after(async () => {
      await app.service(projectPath).remove(project.id)
    })

    it('creates a file', async () => {
      const resource = await app.service(fileBrowserPath).patch(null, {
        project: testProjectName,
        path: 'public/' + testFileFullName,
        body,
        contentType: 'any'
      })

      assert.equal(resource.key, testFileFullPath)
    })

    it('gets the file', async () => {
      const directoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: 'projects/' + testProjectName + '/public/' } })
      const foundFile = directoryContents.data.find((file) => file.key.match(testFileFullName))

      assert.ok(foundFile)
      assert.equal(foundFile.name, testFileName)
      assert.equal(foundFile.size, testFileSize)
      assert.equal(foundFile.key, testFileFullPath)
    })

    it('updates file with new content', async () => {
      const newData = getRandomizedName('new data 2 updated')
      const updateResult = await app.service(fileBrowserPath).patch(null, {
        project: testProjectName,
        path: 'public/' + testFileFullName,
        body: Buffer.from(newData, 'utf-8'),
        contentType: 'any'
      })
      assert.ok(updateResult)

      const testDirectoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: 'projects/' + testProjectName + '/public/' } })
      const updatedFile = testDirectoryContents.data.find((file) => file.key.match(testFileName))
      assert.ok(updatedFile)

      const storageProvider = getStorageProvider()
      const fileContent = await storageProvider.getObject(testFileFullPath)
      assert.equal(fileContent.Body.toString(), newData)
    })
  })

  describe('update', () => {
    let testProjectName: string
    let testProjectName2: string
    const testFileName2 = getRandomizedName('file2', '.md')
    const newData2 = getRandomizedName('new data 2')
    const testFileName3 = getRandomizedName('file3', '.mdx')
    const newData3 = getRandomizedName('new data 3')
    let project: ProjectType
    let project2: ProjectType

    beforeEach(async () => {
      testProjectName = `@org/${getRandomizedName('directory')}`
      testProjectName2 = `@org/${getRandomizedName('directory2')}`

      project = await app.service(projectPath).create({ name: testProjectName })
      project2 = await app.service(projectPath).create({ name: testProjectName2 })

      await app.service(fileBrowserPath).create('projects/' + testProjectName + '/public/')
      await app.service(fileBrowserPath).create('projects/' + testProjectName2 + '/public/')

      await app.service(fileBrowserPath).patch(null, {
        project: testProjectName2,
        path: 'public/' + testFileName2,
        body: Buffer.from(newData2, 'utf-8'),
        contentType: 'any'
      })

      await app.service(fileBrowserPath).patch(null, {
        project: testProjectName2,
        path: 'public/' + testFileName3,
        body: Buffer.from(newData3, 'utf-8'),
        contentType: 'any'
      })
    })

    afterEach(async () => {
      await app.service(projectPath).remove(project.id)
      await app.service(projectPath).remove(project2.id)
    })

    it('copies file', async () => {
      const oldPath = 'projects/' + testProjectName2 + '/public/'
      const newPath = 'projects/' + testProjectName + '/public/'

      const copyFileResult = await app.service(fileBrowserPath).update(null, {
        oldProject: testProjectName2,
        newProject: testProjectName,
        oldName: testFileName2,
        newName: testFileName2,
        oldPath,
        newPath,
        isCopy: true
      })

      assert.equal(copyFileResult.length, 1)
      assert(copyFileResult[0].key === newPath + testFileName2)

      const originalResource = await app.service(staticResourcePath).find({
        query: {
          key: oldPath + testFileName2
        }
      })
      assert.ok(originalResource.data.length === 1, 'Original resource not found')

      const copiedResource = await app.service(staticResourcePath).find({
        query: {
          key: newPath + testFileName2
        }
      })
      assert.ok(copiedResource.data.length === 1, 'Copied resource not found')
    })

    it('copies directory', async () => {
      const copyDirectoryResult = await app.service(fileBrowserPath).update(null, {
        oldProject: testProjectName2,
        newProject: testProjectName2,
        oldName: 'public/',
        newName: 'public2/',
        oldPath: `projects/${testProjectName2}/`,
        newPath: `projects/${testProjectName2}/`,
        isCopy: true
      })

      assert.equal(copyDirectoryResult.length, 2)
      assert(
        copyDirectoryResult.find((file) => file.key === 'projects/' + testProjectName2 + '/public2/' + testFileName2)
      )
      assert(
        copyDirectoryResult.find((file) => file.key === 'projects/' + testProjectName2 + '/public2/' + testFileName3)
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public2', 'projects/' + testProjectName2), true)
      assert(await storageProvider.getObject('projects/' + testProjectName2 + '/public2/' + testFileName3))

      // copy back
      await app.service(fileBrowserPath).update(null, {
        oldProject: testProjectName2,
        newProject: testProjectName2,
        oldName: 'public2/',
        newName: 'public/',
        oldPath: `projects/${testProjectName2}/`,
        newPath: `projects/${testProjectName2}/`,
        isCopy: true
      })
    })

    it('moves file', async () => {
      const moveFileResult = await app.service(fileBrowserPath).update(null, {
        oldProject: testProjectName2,
        newProject: testProjectName,
        oldName: testFileName3,
        newName: testFileName3,
        oldPath: 'projects/' + testProjectName2 + '/public/',
        newPath: 'projects/' + testProjectName + '/public/'
      })

      assert.equal(moveFileResult.length, 1)
      assert(moveFileResult[0].key === 'projects/' + testProjectName + '/public/' + testFileName3)

      const storageProvider = getStorageProvider()
      assert.ok(await storageProvider.getObject('projects/' + testProjectName + '/public/' + testFileName3))
      assert.rejects(storageProvider.getObject('projects/' + testProjectName2 + '/public/' + testFileName3))
    })

    it('moves directory', async () => {
      const copyDirectoryResult = await app.service(fileBrowserPath).update(null, {
        oldProject: testProjectName2,
        newProject: testProjectName,
        oldName: 'public/',
        newName: 'public/',
        oldPath: 'projects/' + testProjectName2 + '/',
        newPath: 'projects/' + testProjectName + '/'
      })

      assert.equal(copyDirectoryResult.length, 2)
      assert(
        copyDirectoryResult.find((file) => file.key === 'projects/' + testProjectName + '/public(1)/' + testFileName2)
      )
      assert(
        copyDirectoryResult.find((file) => file.key === 'projects/' + testProjectName + '/public(1)/' + testFileName3)
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProjectName), true)
      assert(await storageProvider.getObject('projects/' + testProjectName + '/public(1)/' + testFileName2))
      assert(await storageProvider.getObject('projects/' + testProjectName + '/public(1)/' + testFileName3))
    })

    it('increment file name if file already exists', async () => {
      const copyDirectoryResult = await app.service(fileBrowserPath).update(null, {
        oldProject: testProjectName2,
        newProject: testProjectName2,
        oldName: testFileName2,
        newName: testFileName2,
        oldPath: 'projects/' + testProjectName2 + '/public/',
        newPath: 'projects/' + testProjectName2 + '/public/',
        isCopy: true
      })

      assert.equal(copyDirectoryResult.length, 1)

      const fileName = testFileName2.split('.').slice(0, -1).join('.')
      const extension = testFileName2.split('.').pop()!
      const newFileName = `${fileName}(1).${extension}`
      assert(copyDirectoryResult.find((file) => file.key === 'projects/' + testProjectName2 + '/public/' + newFileName))

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProjectName2), true)
      assert(await storageProvider.getObject('projects/' + testProjectName2 + '/public/' + testFileName2))
      assert(await storageProvider.getObject('projects/' + testProjectName2 + '/public/' + newFileName))
    })
  })

  describe('remove', () => {
    const testProjectName = `@org/${getRandomizedName('directory')}`
    const testFileFullName = getRandomizedName('file', '.txt')
    let project: ProjectType

    before(async () => {
      project = await app.service(projectPath).create({ name: testProjectName })
      await app.service(fileBrowserPath).create('projects/' + testProjectName + '/public/')
      await app.service(fileBrowserPath).patch(null, {
        project: testProjectName,
        path: 'public/' + testFileFullName,
        body: Buffer.from(''),
        contentType: 'any'
      })
    })

    after(async () => {
      await app.service(projectPath).remove(project.id)
    })

    it('removes file', async () => {
      const removeResult = await app
        .service(fileBrowserPath)
        .remove('projects/' + testProjectName + '/public/' + testFileFullName)
      assert.ok(removeResult)

      const storageProvider = getStorageProvider()
      assert.rejects(storageProvider.getObject('projects/' + testProjectName + '/public/' + testFileFullName))
    })

    it('removes directory', async () => {
      const removeResult = await app.service(fileBrowserPath).remove('projects/' + testProjectName + '/public/')
      assert.ok(removeResult)

      const storageProvider = getStorageProvider()
      assert.rejects(storageProvider.getObject('projects/' + testProjectName + '/public/'))
    })
  })
})
