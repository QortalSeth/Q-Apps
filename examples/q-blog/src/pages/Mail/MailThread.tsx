import * as React from 'react'
import { styled } from '@mui/material/styles'
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp'
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion'
import MuiAccordionSummary, {
  AccordionSummaryProps
} from '@mui/material/AccordionSummary'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import { Box, CircularProgress } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import { formatTimestamp } from '../../utils/time'
import ReadOnlySlate from '../../components/editor/ReadOnlySlate'
import { fetchAndEvaluateMail } from '../../utils/fetchMail'
import { addToHashMapMail } from '../../state/features/mailSlice'
import { AvatarWrapper } from './MailTable'

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0
  },
  '&:before': {
    display: 'none'
  }
}))

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, .05)'
      : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)'
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1)
  }
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)'
}))

export default function MailThread({
  thread,
  users,
  otherUser
}: {
  thread: string[]
  users: string[]
  otherUser: string
}) {
  const [expanded, setExpanded] = React.useState<string | false>('panel1')
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const dispatch = useDispatch()
  const hashMapMailMessages = useSelector(
    (state: RootState) => state.mail.hashMapMailMessages
  )
  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false)
    }
  const getThreadMessages = async () => {
    setIsLoading(true)
    try {
      for (const msgId of thread) {
        const existingMessage = hashMapMailMessages[msgId]
        if (existingMessage) {
        } else {
          try {
            const query = msgId
            const url = `/arbitrary/resources/search?service=DOCUMENT&query=${query}&limit=20&includemetadata=true&offset=0&reverse=true&excludeblocked=true&name=${users[0]}&name=${users[1]}&exactmatchnames=true&`
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            })

            const responseData = await response.json()
            if (responseData.length !== 0) {
              const data = responseData[0]
              const content = {
                title: data?.metadata?.title,
                category: data?.metadata?.category,
                categoryName: data?.metadata?.categoryName,
                tags: data?.metadata?.tags || [],
                description: data?.metadata?.description,
                createdAt: data?.created,
                updated: data?.updated,
                user: data.name,
                id: data.identifier
              }
              const res = await fetchAndEvaluateMail({
                user: data.name,
                messageIdentifier: data.identifier,
                content,
                otherUser
              })

              dispatch(addToHashMapMail(res))
            }
          } catch (error) {}
        }
      }
    } catch (error) {}
    setIsLoading(false)
  }

  React.useEffect(() => {
    getThreadMessages()
  }, [])

  if (isLoading) return <CircularProgress color="secondary" />
  return (
    <Box
      sx={{
        width: '100%'
      }}
    >
      {thread?.map((message: any) => {
        const findMessage: any = hashMapMailMessages[message]
        if (!findMessage) return null

        return (
          <Accordion
            expanded={expanded === message}
            onChange={handleChange(message)}
          >
            <AccordionSummary
              aria-controls="panel1d-content"
              id="panel1d-header"
            >
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <AvatarWrapper user={findMessage?.user} />
                  <Typography>{findMessage?.user}</Typography>
                  <Typography>{findMessage?.description}</Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Typography>
                    {formatTimestamp(findMessage?.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {findMessage?.textContent && (
                <ReadOnlySlate content={findMessage.textContent} />
              )}
            </AccordionDetails>
          </Accordion>
        )
      })}
      {/* <Accordion
        expanded={expanded === 'panel1'}
        onChange={handleChange('panel1')}
      >
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
          <Typography>Collapsible Group Item #1</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget. Lorem ipsum
            dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada
            lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expanded === 'panel2'}
        onChange={handleChange('panel2')}
      >
        <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
          <Typography>Collapsible Group Item #2</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget. Lorem ipsum
            dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada
            lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expanded === 'panel3'}
        onChange={handleChange('panel3')}
      >
        <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
          <Typography>Collapsible Group Item #3</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget. Lorem ipsum
            dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada
            lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion> */}
    </Box>
  )
}
