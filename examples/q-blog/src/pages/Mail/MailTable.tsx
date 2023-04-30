import * as React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { TableVirtuoso, TableComponents } from 'react-virtuoso'
import { formatTimestamp } from '../../utils/time'
import { Avatar, Box } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../state/store'

interface Data {
  name: string
  description: string
  createdAt: number
  user: string
  id: string
  tags: string[]
}
interface ColumnData {
  dataKey: keyof Data
  label: string
  numeric?: boolean
  width?: number
}

const columns: ColumnData[] = [
  {
    label: 'Sender',
    dataKey: 'user',
    width: 200
  },
  {
    label: 'Subject',
    dataKey: 'description'
  },
  {
    label: 'Date',
    dataKey: 'createdAt',
    numeric: true,
    width: 200
  }
]

// Replace this with your own data
const rows: Data[] = [
  {
    name: 'Sample 1',
    description: 'Sample description 1',
    createdAt: 1682857406070,
    user: 'tester1',
    id: 'qblog_qmail_Phil_ViVrF2_mail_NnHcWj',
    tags: ['attach: 0']
  },
  {
    name: 'Sample 2',
    description: 'Sample description 2',
    createdAt: 1682857406071,
    user: 'tester2',
    id: 'qblog_qmail_Phil_ViVrF2_mail_NnHcWk',
    tags: ['attach: 1']
  }
  // Add more rows as needed
]

const VirtuosoTableComponents: TableComponents<Data> = {
  Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table
      {...props}
      sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }}
    />
  ),
  TableHead,
  TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
  TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  ))
}

function fixedHeaderContent() {
  return (
    <TableRow>
      {columns.map((column) => {
        console.log({ column })
        return (
          <TableCell
            key={column.dataKey}
            variant="head"
            align={column.numeric || false ? 'right' : 'left'}
            style={{ width: column.width }}
            sx={{
              backgroundColor: 'background.paper'
            }}
          >
            {column.label}
          </TableCell>
        )
      })}
    </TableRow>
  )
}

function rowContent(_index: number, row: Data, openMessage: any) {
  return (
    <React.Fragment>
      {columns.map((column) => (
        <TableCell
          onClick={() => openMessage(row?.user, row?.id, row)}
          key={column.dataKey}
          align={column.numeric || false ? 'right' : 'left'}
          style={{ width: column.width, cursor: 'pointer' }}
        >
          {column.dataKey === 'user' && (
            <Box
              sx={{
                display: 'flex',
                gap: '5px',
                width: '100%',
                alignItems: 'center',
                flexWrap: 'wrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
            >
              <AvatarWrapper user={row?.user}></AvatarWrapper>
              {row[column.dataKey]}
            </Box>
          )}
          {column.dataKey !== 'user' && (
            <>
              {column.dataKey === 'createdAt'
                ? formatTimestamp(row[column.dataKey])
                : row[column.dataKey]}
            </>
          )}
        </TableCell>
      ))}
    </React.Fragment>
  )
}

interface ReactVirtualizedTableProps {
  openMessage: (user: string, messageIdentifier: string, content: any) => void
  data: any[]
  children?: React.ReactNode
  loadMoreData: () => void
}

export default function ReactVirtualizedTable({
  openMessage,
  data,
  children,
  loadMoreData
}: ReactVirtualizedTableProps) {
  return (
    <Paper style={{ height: 'calc(100vh - 150px)', width: '100%' }}>
      <TableVirtuoso
        data={data}
        components={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={(index, row) => rowContent(index, row, openMessage)}
        endReached={() => {
          loadMoreData()
        }}
      />
      {children}
    </Paper>
  )
}

export const AvatarWrapper = ({ user }: any) => {
  const userAvatarHash = useSelector(
    (state: RootState) => state.global.userAvatarHash
  )
  const avatarLink = React.useMemo(() => {
    if (!user || !userAvatarHash) return ''
    const findUserAvatr = userAvatarHash[user]
    if (!findUserAvatr) return ''
    return findUserAvatr
  }, [userAvatarHash, user])

  return <Avatar src={avatarLink} alt={`${user}'s avatar`} />
}
