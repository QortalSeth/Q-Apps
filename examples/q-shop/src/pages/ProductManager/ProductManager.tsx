import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import Joyride, { ACTIONS, EVENTS, STATUS, Step } from 'react-joyride'
import SendIcon from '@mui/icons-material/Send'
import MailIcon from '@mui/icons-material/Mail'
import {
  Box,
  Button,
  Input,
  Typography,
  useTheme,
  IconButton
} from '@mui/material'
import LazyLoad from '../../components/common/LazyLoad'
import { removePrefix } from '../../utils/blogIdformats'
import { NewMessage } from './NewProduct'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { ShowMessage } from './ShowProduct'
import SimpleTable from './ProductTable'


export const ProductManager = () => {
  const theme = useTheme()
  const { user } = useSelector((state: RootState) => state.auth)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [message, setMessage] = useState<any>(null)
  const [replyTo, setReplyTo] = useState<any>(null)
  const [valueTab, setValueTab] = React.useState(0)
  const [aliasValue, setAliasValue] = useState('')
  const [alias, setAlias] = useState<string[]>([])
  const [run, setRun] = useState(false)

  const userName = useMemo(() => {
    if (!user?.name) return ''
    return user.name
  }, [user])


  const dispatch = useDispatch()
  const navigate = useNavigate()






 



  function a11yProps(index: number) {
    return {
      id: `mail-tabs-${index}`,
      'aria-controls': `mail-tabs-${index}`
    }
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValueTab(newValue)
  }

  function CustomTabLabelDefault({ label }: any) {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span
          style={{
            textTransform: 'none'
          }}
        >
          {label}
        </span>
        <IconButton id="close-button" edge="end" color="inherit" size="small">
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </div>
    )
  }

  function CustomTabLabel({ index, label }: any) {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span
          style={{
            textTransform: 'none'
          }}
        >
          {label}
        </span>
        <IconButton
          id="close-button"
          edge="end"
          color="inherit"
          size="small"
          onClick={(event) => {
            event.stopPropagation() // Add this l
            setValueTab(0)
            const newList = [...alias]

            newList.splice(index, 1)

            setAlias(newList)
            if (userName) {
              try {
                localStorage.setItem(
                  `alias-qmail-${userName}`,
                  JSON.stringify(newList)
                )
              } catch (error) {}
            }
          }}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </div>
    )
  }





  return (
    <Box
      className="step-1"
      sx={{
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        backgroundColor: 'background.paper'
      }}
    >
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'flex-start'
        }}
      >
        <Tabs
          value={valueTab}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab
            sx={{
              '&.Mui-selected': {
                color: theme.palette.text.primary,
                fontWeight: theme.typography.fontWeightMedium
              }
            }}
            label={<CustomTabLabelDefault label={user?.name} />}
            {...a11yProps(0)}
          />
          {alias.map((alia, index) => {
            return (
              <Tab
                sx={{
                  '&.Mui-selected': {
                    color: theme.palette.text.primary,
                    fontWeight: theme.typography.fontWeightMedium
                  }
                }}
                key={alia}
                label={<CustomTabLabel index={index} label={alia} />}
                {...a11yProps(1 + index)}
              />
            )
          })}
        </Tabs>
        <Box
          className="step-3"
          sx={{
            display: 'flex'
          }}
        >
          <Input
            id="standard-adornment-alias"
            onChange={(e) => {
              setAliasValue(e.target.value)
            }}
            value={aliasValue}
            placeholder="Type in alias"
            sx={{
              marginLeft: '20px',
              '&&:before': {
                borderBottom: 'none'
              },
              '&&:after': {
                borderBottom: 'none'
              },
              '&&:hover:before': {
                borderBottom: 'none'
              },
              '&&.Mui-focused:before': {
                borderBottom: 'none'
              },
              '&&.Mui-focused': {
                outline: 'none'
              },
              fontSize: '18px'
            }}
          />
          <Button
            onClick={() => {
              const newList = [...alias, aliasValue]
              if (userName) {
                try {
                  localStorage.setItem(
                    `alias-qmail-${userName}`,
                    JSON.stringify(newList)
                  )
                } catch (error) {}
              }

              setAlias((prev) => [...prev, aliasValue])
              setAliasValue('')
            }}
            variant="contained"
          >
            + alias
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}
      >
        {valueTab === 0 || valueTab === 500 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              background: theme.palette.background.default,
              height: 'auto',
              padding: '5px',
              cursor: 'pointer',
              margin: '7px 10px 7px 7px;'
            }}
            onClick={() => {
              if (valueTab === 0) {
                setValueTab(500)
                return
              }
              setValueTab(0)
            }}
          >
            {valueTab === 0 && (
              <>
                <SendIcon
                  sx={{
                    cursor: 'pointer',
                    marginRight: '5px'
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '14px'
                  }}
                >
                  Sent
                </Typography>
              </>
            )}
            {valueTab === 500 && (
              <>
                <MailIcon
                  sx={{
                    cursor: 'pointer',
                    marginRight: '5px'
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '14px'
                  }}
                >
                  Inbox
                </Typography>
              </>
            )}
          </Box>
        ) : (
          <div />
        )}

        <NewMessage
          replyTo={replyTo}
          setReplyTo={setReplyTo}
          alias={valueTab === 0 ? '' : alias[valueTab - 1]}
        />
      </Box>
      <ShowMessage
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        message={message}
        setReplyTo={setReplyTo}
      />

      <TabPanel value={valueTab} index={0}>
        <SimpleTable
          openMessage={()=> {}}
          data={[]}
        ></SimpleTable>
        {/* <LazyLoad onLoadMore={getMessages}></LazyLoad> */}
      </TabPanel>

 
    </Box>
  )
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

export function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mail-tabs-${index}`}
      aria-labelledby={`mail-tabs-${index}`}
      {...other}
      style={{
        width: '100%'
      }}
    >
      {value === index && children}
    </div>
  )
}
