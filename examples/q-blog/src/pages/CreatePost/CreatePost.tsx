import { Box, Button, Typography } from '@mui/material'
import React, { useState } from 'react'
import { ReusableModal } from '../../components/modals/ReusableModal'
import { CreatePostBuilder } from './CreatePostBuilder'
import { CreatePostMinimal } from './CreatePostMinimal'
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded'
import HourglassFullRoundedIcon from '@mui/icons-material/HourglassFullRounded'
import { display } from '@mui/system'
type EditorType = 'minimal' | 'builder'
export const CreatePost = () => {
  const [toggleEditorType, setToggleEditorType] = useState<EditorType | null>(
    null
  )
  const [isOpen, setIsOpen] = useState<boolean>(false)

  React.useEffect(() => {
    if (!toggleEditorType) {
      setIsOpen(true)
    }
  }, [setIsOpen, toggleEditorType])

  const switchType = (type: EditorType) => {
    setIsOpen(true)
  }

  console.log(isOpen)
  return (
    <>
      {toggleEditorType === 'minimal' && (
        <Button onClick={() => switchType('builder')}>Switch to Builder</Button>
      )}
      {toggleEditorType === 'builder' && (
        <Button onClick={() => switchType('minimal')}>Switch to Minimal</Button>
      )}
      {isOpen && (
        <ReusableModal
          open={isOpen}
          customStyles={{
            maxWidth: '500px'
          }}
        >
          {toggleEditorType && (
            <Typography>
              Switching editor type will delete your current progress
            </Typography>
          )}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box
              onClick={() => {
                setToggleEditorType('minimal')
                setIsOpen(false)
              }}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
                borderRadius: '6px',
                border: '1px solid',
                cursor: 'pointer'
              }}
            >
              <Typography>Minimal Editor</Typography>
              <HourglassFullRoundedIcon />
            </Box>
            <Box
              onClick={() => {
                setToggleEditorType('builder')
                setIsOpen(false)
              }}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
                borderRadius: '6px',
                border: '1px solid',
                cursor: 'pointer'
              }}
            >
              <Typography>Builder Editor</Typography>
              <HandymanRoundedIcon />
            </Box>
          </Box>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </ReusableModal>
      )}
      {toggleEditorType === 'minimal' && <CreatePostMinimal />}
      {toggleEditorType === 'builder' && <CreatePostBuilder />}
    </>
  )
}
