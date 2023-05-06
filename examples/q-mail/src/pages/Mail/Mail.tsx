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
import {
  Box,
  Button,
  Input,
  Typography,
  useTheme,
  IconButton
} from '@mui/material'
import { useFetchPosts } from '../../hooks/useFetchPosts'
import LazyLoad from '../../components/common/LazyLoad'
import { removePrefix } from '../../utils/blogIdformats'
import { NewMessage } from './NewMessage'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { useFetchMail } from '../../hooks/useFetchMail'
import { ShowMessage } from './ShowMessage'
import { fetchAndEvaluateMail } from '../../utils/fetchMail'
import { addToHashMapMail } from '../../state/features/mailSlice'
import { setIsLoadingGlobal } from '../../state/features/globalSlice'
import SimpleTable from './MailTable'
import { AliasMail } from './AliasMail'

const steps: Step[] = [
  {
    content: (
      <div>
        <h2>Welcome To Q-Mail</h2>
        <p
          style={{
            fontSize: '18px'
          }}
        >
          Let's take a tour
        </p>
        <p
          style={{
            fontSize: '12px'
          }}
        >
          The Qortal community, along with its development team and the creators
          of this application, cannot be held accountable for any content
          published or displayed. Furthermore, they bear no responsibility for
          any data loss that may occur as a result of using this application.
        </p>
      </div>
    ),
    placement: 'center',
    target: '.step-1'
  },

  {
    target: '.step-2',
    content: (
      <div>
        <h2>Composing a mail message</h2>
        <p
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            fontFamily: 'Arial'
          }}
        >
          Compose a secure message featuring encrypted attachments (up to 25MB
          per attachment).
        </p>
        <p
          style={{
            fontSize: '18px',
            fontFamily: 'Arial'
          }}
        >
          To protect the identity of the recipient, assign them an alias for
          added anonymity.
        </p>
      </div>
    ),
    placement: 'bottom'
  },
  {
    target: '.step-3',
    content: (
      <div>
        <h2>What is an alias?</h2>
        <p
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            fontFamily: 'Arial'
          }}
        >
          To conceal the identity of the message recipient, utilize the alias
          option when sending.
        </p>
        <p
          style={{
            fontSize: '14px',
            fontFamily: 'Arial'
          }}
        >
          For instance, instruct your friend to address the message to you using
          the alias 'FrederickGreat'.
        </p>
        <p
          style={{
            fontSize: '14px',
            fontFamily: 'Arial'
          }}
        >
          To access messages sent to that alias, simply enter 'FrederickGreat'
          in the provided input field and click the '+ Alias' button.
        </p>
      </div>
    ),
    placement: 'bottom'
  }
]

export const Mail = () => {
  const theme = useTheme()
  const { user } = useSelector((state: RootState) => state.auth)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [message, setMessage] = useState<any>(null)
  const [replyTo, setReplyTo] = useState<any>(null)
  const [valueTab, setValueTab] = React.useState(0)
  const [aliasValue, setAliasValue] = useState('')
  const [alias, setAlias] = useState<string[]>([])
  const [run, setRun] = useState(false)
  const hashMapPosts = useSelector(
    (state: RootState) => state.blog.hashMapPosts
  )
  const hashMapMailMessages = useSelector(
    (state: RootState) => state.mail.hashMapMailMessages
  )
  const mailMessages = useSelector(
    (state: RootState) => state.mail.mailMessages
  )

  const fullMailMessages = useMemo(() => {
    return mailMessages.map((msg) => {
      let message = msg
      const existingMessage = hashMapMailMessages[msg.id]
      if (existingMessage) {
        message = existingMessage
      }
      return message
    })
  }, [mailMessages, hashMapMailMessages])
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { getMailMessages, checkNewMessages } = useFetchMail()
  const getMessages = React.useCallback(async () => {
    if (!user?.name || !user?.address) return
    await getMailMessages(user.name, user.address)
  }, [getMailMessages, user])

  const interval = useRef<any>(null)

  const checkNewMessagesFunc = useCallback(() => {
    if (!user?.name || !user?.address) return
    let isCalling = false
    interval.current = setInterval(async () => {
      if (isCalling || !user?.name || !user?.address) return
      isCalling = true
      const res = await checkNewMessages(user?.name, user.address)
      isCalling = false
    }, 30000)
  }, [checkNewMessages, user])

  useEffect(() => {
    checkNewMessagesFunc()
    return () => {
      if (interval?.current) {
        clearInterval(interval.current)
      }
    }
  }, [checkNewMessagesFunc])

  const openMessage = async (
    user: string,
    messageIdentifier: string,
    content: any
  ) => {
    try {
      const existingMessage = hashMapMailMessages[messageIdentifier]
      if (existingMessage) {
        setMessage(existingMessage)
      }
      dispatch(setIsLoadingGlobal(true))
      const res = await fetchAndEvaluateMail({
        user,
        messageIdentifier,
        content,
        otherUser: user
      })
      setMessage(res)
      dispatch(addToHashMapMail(res))
      setIsOpen(true)
    } catch (error) {
    } finally {
      dispatch(setIsLoadingGlobal(false))
    }
  }

  const firstMount = useRef(false)
  useEffect(() => {
    if (user?.name && !firstMount.current) {
      getMessages()
      firstMount.current = true
    }
  }, [user])

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
          }}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </div>
    )
  }

  useEffect(() => {
    const savedTourStatus = localStorage.getItem('tourStatus-qmail')
    if (!savedTourStatus || savedTourStatus === STATUS.SKIPPED) {
      setRun(true)
    }
  }, [])

  const handleJoyrideCallback = (data: any) => {
    const { action, status } = data

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false)
      localStorage.setItem('tourStatus-qmail', status)
    }
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
              setAlias((prev) => [...prev, aliasValue])
              setAliasValue('')
            }}
            variant="contained"
          >
            + alias
          </Button>
        </Box>
      </Box>
      <NewMessage
        replyTo={replyTo}
        setReplyTo={setReplyTo}
        alias={valueTab === 0 ? '' : alias[valueTab - 1]}
      />
      <ShowMessage
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        message={message}
        setReplyTo={setReplyTo}
      />

      <TabPanel value={valueTab} index={0}>
        <SimpleTable
          openMessage={openMessage}
          data={fullMailMessages}
        ></SimpleTable>
        <LazyLoad onLoadMore={getMessages}></LazyLoad>
      </TabPanel>
      {alias.map((alia, index) => {
        return (
          <TabPanel key={alia} value={valueTab} index={1 + index}>
            <AliasMail value={alia} />
          </TabPanel>
        )
      })}

      <Joyride
        steps={steps}
        run={run}
        callback={handleJoyrideCallback}
        continuous={true}
        scrollToFirstStep={true}
        showProgress={true}
        showSkipButton={true}
      />
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
