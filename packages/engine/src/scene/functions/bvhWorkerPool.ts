
import { Box3, BufferAttribute, BufferGeometry, InstancedMesh, InterleavedBufferAttribute, Mesh } from 'three'
import { MeshBVH, SerializedBVH } from 'three-mesh-bvh'
import Worker from 'web-worker'

import { isClient } from '@xrengine/hyperflux'
import { WorkerPool } from '@xrengine/xrui/core/WorkerPool'

const createWorker = () => {
  if (isClient) {
    // module workers currently don't work in safari and firefox
    return new Worker('/workers/generateBVHAsync.worker.js')
  } else {
    const path = require('path')
    const workerPath = path.resolve(__dirname, './generateBVHAsync.register.js')
    return new Worker(workerPath, { type: 'module' })
  }
}

const workerPool = new WorkerPool(1)
workerPool.setWorkerCreator(createWorker)

export async function generateMeshBVH(mesh: Mesh, signal: AbortSignal, options = {}) {
  if (
    !mesh.isMesh ||
    (mesh as InstancedMesh).isInstancedMesh ||
    !mesh.geometry ||
    !mesh.geometry.attributes.position ||
    mesh.geometry.boundsTree
  )
    return Promise.resolve()

  const geometry = mesh.geometry as BufferGeometry

  const index = geometry.index ? Uint32Array.from(geometry.index.array) : null
  const pos = Float32Array.from((geometry.attributes.position as BufferAttribute | InterleavedBufferAttribute).array)

  const transferrables = [pos as ArrayLike<number>]
  if (index) {
    transferrables.push(index as ArrayLike<number>)
  }

  const response = await workerPool.postMessage<BVHWorkerResponse>(
    {
      index,
      position: pos,
      options
    },
    transferrables.map((arr: any) => arr.buffer)
  )

  const { serialized, error } = response.data

  if (error) {
    return console.error(error)
  } else {
    // MeshBVH uses generated index instead of default geometry index
    geometry.setIndex(new BufferAttribute(serialized.index as any, 1))

    const bvh = MeshBVH.deserialize(serialized, geometry)
    const boundsOptions = Object.assign(
      {
        setBoundingBox: true
      },
      options
    )

    if (boundsOptions.setBoundingBox) {
      geometry.boundingBox = bvh.getBoundingBox(new Box3())
    }

    geometry.boundsTree = bvh

    return bvh
  }
}

type BVHWorkerResponse = {
  serialized: SerializedBVH
  error?: string
}
