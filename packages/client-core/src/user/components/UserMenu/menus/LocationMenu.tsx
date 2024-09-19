import { Paginated } from '@feathersjs/feathers'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { locationPath, LocationType } from '@xrengine/common/src/schema.type.module'
import Button from '@xrengine/ui/src/primitives/mui/Button'
import Icon from '@xrengine/ui/src/primitives/mui/Icon'
import InputAdornment from '@xrengine/ui/src/primitives/mui/InputAdornment'
import Table from '@xrengine/ui/src/primitives/mui/Table'
import TableBody from '@xrengine/ui/src/primitives/mui/TableBody'
import TableCell from '@xrengine/ui/src/primitives/mui/TableCell'
import TableHead from '@xrengine/ui/src/primitives/mui/TableHead'
import TablePagination from '@xrengine/ui/src/primitives/mui/TablePagination'
import TableRow from '@xrengine/ui/src/primitives/mui/TableRow'
import TextField from '@xrengine/ui/src/primitives/mui/TextField'
import Typography from '@xrengine/ui/src/primitives/mui/Typography'

import { API } from '../../../../API'
import { LocationSeed } from '../../../../social/services/LocationService'
import styles from '../index.module.scss'

interface Props {
  changeActiveLocation: (location: LocationType) => void
}
const LocationMenu = (props: Props) => {
  const [page, setPage] = useState(0)
  const [locationDetails, setLocationsDetails] = useState<Paginated<LocationType>>(null!)
  const ROWS_PER_PAGE = 10
  const { t } = useTranslation()
  const tableHeaders = [
    { id: 'name', numeric: false, disablePadding: false, label: t('user:usermenu.locationTable.col-name') },
    { id: 'sceneId', numeric: false, disablePadding: false, label: t('user:usermenu.locationTable.col-scene') },
    {
      id: 'maxUsersPerInstance',
      numeric: true,
      disablePadding: false,
      label: t('user:usermenu.locationTable.col-maxuser')
    }
  ]

  useEffect(() => {
    fetchLocations(0, ROWS_PER_PAGE)
  }, [])

  const fetchLocations = (page: number, rows: number, search?: string) => {
    API.instance.client
      .service(locationPath)
      .find({
        query: {
          $limit: rows,
          $skip: page * rows,
          $or: [
            {
              name: {
                $like: `%${search}%`
              }
            },
            {
              sceneId: {
                $like: `%${search}%`
              }
            }
          ]
        }
      })
      .then((res: Paginated<LocationType>) => {
        setLocationsDetails(res)
      })
  }

  const handlePageChange = (_, page) => {
    fetchLocations(page, ROWS_PER_PAGE)
    setPage(page)
  }

  let isTimerStarted = false
  const handleSearch = () => {
    if (isTimerStarted) return

    isTimerStarted = true

    setTimeout(() => {
      isTimerStarted = false
      const value = (document.getElementById('searchbox') as any).value
      fetchLocations(page, ROWS_PER_PAGE, value)
    }, 500)
  }

  return (
    <div className={styles.menuPanel}>
      <section className={styles.locationPanel}>
        <Typography variant="h2">{t('user:usermenu.locationTable.title')}</Typography>
        {!locationDetails ? (
          <section>{t('user:usermenu.locationTable.loading')}</section>
        ) : (
          <>
            <section className={styles.control}>
              <TextField
                margin="none"
                size="small"
                placeholder={t('user:usermenu.locationTable.lbl-search')}
                variant="outlined"
                id="searchbox"
                onChange={handleSearch}
                className={styles.searchbox}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Icon type="Search" />
                    </InputAdornment>
                  )
                }}
              />
              <Button className={styles.newLocation} onClick={() => props.changeActiveLocation(LocationSeed)}>
                <Icon type="Add" />
                {t('user:usermenu.locationTable.lbl-new')}
              </Button>
            </section>
            <section className={styles.tableContainer}>
              <Table size="small" className={styles.locationTable}>
                <TableHead className={styles.tableHead}>
                  <TableRow className={styles.trow}>
                    {tableHeaders.map((headCell) => (
                      <TableCell className={styles.tcell} key={headCell.id}>
                        {headCell.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody className={styles.tablebody}>
                  {locationDetails.data?.map((row, i) => {
                    return (
                      <TableRow
                        className={styles.tableRow}
                        key={i}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') props.changeActiveLocation(row)
                        }}
                        onClick={() => props.changeActiveLocation(row)}
                      >
                        {tableHeaders.map((headCell) => (
                          <TableCell className={styles.tableCell} key={headCell.id}>
                            {row[headCell.id]}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </section>
            <TablePagination
              component="div"
              count={locationDetails.total}
              rowsPerPage={ROWS_PER_PAGE}
              rowsPerPageOptions={[ROWS_PER_PAGE]}
              page={page}
              onPageChange={handlePageChange}
              size="small"
              className={styles.tablePagination}
            />
          </>
        )}
      </section>
    </div>
  )
}

export default LocationMenu
