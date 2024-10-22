
import React from 'react'
import { HiPlay, HiPlusCircle, HiStop } from 'react-icons/hi2'

import { useFind } from '@xrengine/common'
import { PlaybackState } from '@xrengine/common/src/recording/ECSRecordingSystem'
import { RecordingID, recordingPath, RecordingType } from '@xrengine/common/src/schema.type.module'
import { getMutableState, useHookstate } from '@xrengine/hyperflux'

import { MdAccessibility, MdDirectionsRun, MdVideocam } from 'react-icons/md'
import Tooltip from '../../../primitives/tailwind/Tooltip'

function formatHHMMSS(time) {
  const sec_num = parseInt(time, 10) // don't forget the second param
  const hours = Math.floor(sec_num / 3600)
  const minutes = Math.floor((sec_num - hours * 3600) / 60)
  const seconds = sec_num - hours * 3600 - minutes * 60

  const hoursString = hours < 10 ? '0' + hours : hours.toString()
  const minutesString = minutes < 10 ? '0' + minutes : minutes.toString()
  const secondsString = seconds < 10 ? '0' + seconds : seconds.toString()

  return hoursString + ':' + minutesString + ':' + secondsString
}

const sortByNewest = (a, b) => {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

const RecordingsList = (props: {
  startPlayback: (recordingID: RecordingID, twin: boolean) => void
  stopPlayback: (args: { recordingID: RecordingID }) => void
}) => {
  const { startPlayback, stopPlayback } = props

  const recordingID = useHookstate(getMutableState(PlaybackState).recordingID)
  const recording = useFind(recordingPath, {
    query: { $sort: { createdAt: -1 }, $limit: 10, $skip: 0 }
  })

  const sortedRecordings = [...recording.data].sort(sortByNewest)

  const RecordingItem = (props: { recording: RecordingType }) => {
    const { recording } = props
    const hasEntityResource = recording.resources.some((resource) => resource.key?.includes('entities'))
    const hasVideoResource = recording.resources.some((resource) => resource.mimeType?.includes('video'))
    const hasMocapResource = recording.resources.some((resource) => resource.key?.includes('mocap'))
    return (
      <tr key={recording.id}>
        <td>
          <div className="bg-grey">{recording.id}</div>
        </td>
        <td>
          {/* icon for each media type */}
          <div className="bg-grey flex flex-row">
            {hasEntityResource && (
              <div className="bg-grey">
                <Tooltip content="Entity">
                  <MdAccessibility className="text-2xl" />
                </Tooltip>
              </div>
            )}
            {hasVideoResource && (
              <div className="bg-grey">
                <Tooltip content="Video">
                  <MdVideocam className="text-2xl" />
                </Tooltip>
              </div>
            )}
            {hasMocapResource && (
              <div className="bg-grey">
                <Tooltip content="Mocap">
                  <MdDirectionsRun className="text-2xl" />
                </Tooltip>
              </div>
            )}
          </div>
        </td>
        <td>
          <div className="bg-grey">{new Date(recording.createdAt).toLocaleTimeString()}</div>
        </td>
        <td>
          <div className="bg-grey">
            {formatHHMMSS((new Date(recording.updatedAt).getTime() - new Date(recording.createdAt).getTime()) / 1000)}
          </div>
        </td>
        <td>
          <div key={recording.id} className="">
            {/* a button to play back the recording */}
            {recordingID.value === recording.id ? (
              <button
                className="btn btn-ghost"
                onClick={() => {
                  stopPlayback({
                    recordingID: recording.id
                  })
                }}
              >
                <HiStop className="block min-h-6 min-w-6" />
              </button>
            ) : (
              <>
                <button className="btn btn-ghost" onClick={() => startPlayback(recording.id, false)}>
                  <HiPlay className="block min-h-6 min-w-6" />
                </button>
                <button style={{ pointerEvents: 'all' }} onClick={() => startPlayback(recording.id, true)}>
                  <HiPlusCircle className="block min-h-6 min-w-6" />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="aspect-video w-full">
      <table className="table w-full">
        {/* head */}
        <thead>
          <tr>
            <th>Recording</th>
            <th>Media</th>
            <th>Created At</th>
            <th>Duration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedRecordings.map((recording) => (
            <RecordingItem key={recording.id} recording={recording} />
          ))}
        </tbody>
      </table>
      <div className="flex justify-between">
        <button
          className="btn btn-ghost"
          disabled={recording.skip <= 0}
          onClick={() => recording.setPage(recording.page - 1)}
        >
          Prev
        </button>
        <div className="flex items-center justify-center">
          {recording.skip / recording.limit + 1} of {Math.ceil(recording.total / recording.limit)}
        </div>
        <button
          className="btn btn-ghost"
          disabled={recording.skip + recording.limit >= recording.total}
          onClick={() => recording.setPage(recording.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}

RecordingsList.displayName = 'RecordingsList'
RecordingsList.defaultProps = {
  startPlayback: () => {},
  stopPlayback: () => {},
  recordingState: {}
}

export default RecordingsList
