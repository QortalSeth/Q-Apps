import React, { useState } from 'react'
import {
  Box,
  Button,
  Modal,
  Typography,
  SelectChangeEvent,
  ListItem,
  List
} from '@mui/material'
import { styled } from '@mui/system'

const StyledModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}))

const ModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(4),
  borderRadius: theme.spacing(1),
  width: '40%',
  '&:focus': {
    outline: 'none'
  }
}))

interface PostModalProps {
  open: boolean
  onClose: () => void
}

export const BlockedNamesModal: React.FC<PostModalProps> = ({
  open,
  onClose
}) => {
  const [blockedNames, setBlockedNames] = useState<string[]>([])

  const getBlockedNames = React.useCallback(async () => {
    try {
      const listName = `blockedNames_q-blog`
      const response = await qortalRequest({
        action: 'GET_LIST_ITEMS',
        list_name: listName
      })
      setBlockedNames(response)
    } catch (error) {
      onClose()
    }
  }, [])

  React.useEffect(() => {
    getBlockedNames()
  }, [getBlockedNames])

  const removeFromBlockList = async (name: string) => {
    try {
      const response = await qortalRequest({
        action: 'DELETE_LIST_ITEM',
        list_name: 'blockedNames_q-blog',
        item: name
      })

      if (response === true) {
        setBlockedNames((prev) => prev.filter((n) => n !== name))
      }
    } catch (error) {}
  }

  return (
    <StyledModal open={open} onClose={onClose}>
      <ModalContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Manage blocked names
        </Typography>
        <List
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            flex: '1',
            overflow: 'auto'
          }}
        >
          {blockedNames.map((name, index) => (
            <ListItem
              key={name + index}
              sx={{
                display: 'flex'
              }}
            >
              <Typography>{name}</Typography>
              <Button onClick={() => removeFromBlockList(name)}>Remove</Button>
            </ListItem>
          ))}
        </List>
        <Button variant="contained" color="primary" onClick={onClose}>
          Close
        </Button>
      </ModalContent>
    </StyledModal>
  )
}
