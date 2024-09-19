
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import { Grid } from '@mui/material'
import React, { useEffect } from 'react'

import { State, useHookstate } from '@xrengine/hyperflux'

import { Button } from '../inputs/Button'
import Well from './Well'

const buttonStyle = {
  width: '90%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  padding: '5%'
}

export default function PaginatedList<T>({
  list,
  element,
  options
}: {
  ['list']: T[] | State<T[]>
  ['element']: (val: T | State<T>, _index: number) => JSX.Element
  ['options']?: {
    ['countPerPage']?: number
  }
}) {
  const countPerPage = options?.countPerPage ?? 7
  const currentPage = useHookstate(0)

  function getPageIndices() {
    const start = countPerPage * currentPage.value
    return [start, Math.min(start + countPerPage, list.length /*- 1*/)]
  }

  const pageView = useHookstate(getPageIndices())
  useEffect(() => {
    pageView.set(getPageIndices())
  }, [currentPage])
  return (
    <>
      <Well>
        <Grid container>
          <Grid item xs={1}>
            <Button
              onClick={() => currentPage.set(Math.min(list.length / countPerPage, Math.max(0, currentPage.value - 1)))}
              style={buttonStyle}
            >
              <ArrowLeftIcon />
            </Button>
          </Grid>
          {[-2, -1, 0, 1, 2].map((idx) => {
            const btnKey = `paginatedButton-${idx}`
            if (!(currentPage.value + idx < 0 || currentPage.value + idx >= list.length / countPerPage))
              return (
                <Grid item xs={2} key={btnKey}>
                  <Button
                    disabled={idx === 0}
                    onClick={() => currentPage.set(currentPage.value + idx)}
                    style={buttonStyle}
                  >
                    {currentPage.value + idx}
                  </Button>
                </Grid>
              )
            else
              return (
                <Grid item xs={2} key={btnKey}>
                  <div style={buttonStyle}></div>
                </Grid>
              )
          })}
          <Grid item xs={1}>
            <Button
              onClick={() =>
                currentPage.set(
                  Math.min(Math.floor((list.length - 1) / countPerPage), Math.max(0, currentPage.value + 1))
                )
              }
              style={buttonStyle}
            >
              <ArrowRightIcon />
            </Button>
          </Grid>
        </Grid>
      </Well>
      {(pageView.value[0] === pageView.value[1] ? list : list.slice(...pageView.value)).map((val, index) => {
        return <div key={`${index}`}>{element(val, index)}</div>
      })}
    </>
  )
}
