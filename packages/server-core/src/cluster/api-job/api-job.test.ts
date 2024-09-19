
import assert from 'assert'

import { apiJobPath } from '@xrengine/common/src/schemas/cluster/api-job.schema'
import { getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import { destroyEngine } from '@xrengine/ecs/src/Engine'

import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

describe('api job service', () => {
  let app: Application
  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })
  after(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('should register the service', () => {
    const service = app.service(apiJobPath)
    assert.ok(service, 'Registered the service')
  })

  let jobId
  it('creates a job', async () => {
    const date = await getDateTimeSql()
    const createdJob = await app.service(apiJobPath).create({
      name: 'test-job',
      startTime: date,
      endTime: date,
      returnData: '',
      status: 'pending'
    })
    jobId = createdJob.id
    assert.ok(createdJob)
  })

  it('gets the job', async () => {
    assert.doesNotThrow(async () => await app.service(apiJobPath).get(jobId))
  })

  it('finds multiple jobs', async () => {
    const foundJobs = await app.service(apiJobPath).find({ query: { name: 'test-job' } })
    assert.equal(foundJobs.total, 1)
  })

  it('patches the job', async () => {
    await app.service(apiJobPath).patch(jobId, { name: 'updated-job', status: 'succeeded', returnData: 'success' })
    const patchedJob = await app.service(apiJobPath).get(jobId)
    assert.equal(patchedJob.name, 'updated-job')
    assert.equal(patchedJob.status, 'succeeded')
    assert.equal(patchedJob.returnData, 'success')
  })

  it('removes a job', async () => {
    await app.service(apiJobPath).remove(jobId)
    const foundJobs = await app.service(apiJobPath).find({ query: { name: 'updated-job' } })
    assert.equal(foundJobs.total, 0)
  })
})
