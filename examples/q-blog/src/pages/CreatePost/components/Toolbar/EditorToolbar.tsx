import React from 'react'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import Slider from '@mui/material/Slider'
import { AudioPanel } from '../../../../components/common/AudioPanel'
import { Button, Box, Typography, Toolbar, AppBar } from '@mui/material'
import { styled } from '@mui/system'
import ImageUploader from '../../../../components/common/ImageUploader'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import { VideoPanel } from '../../../../components/common/VideoPanel'

const CustomToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
})

const CustomAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  color: '#000000'
}))

interface IEditorToolbar {
  setIsOpenAddTextModal: (val: boolean) => void
  addImage: (base64: string) => void
  onSelectVideo: (video: any) => void
  onSelectAudio: (audio: any) => void
  paddingValue: number
  onChangePadding: (padding: number) => void
  isMinimal?: boolean
}

export const EditorToolbar = ({
  setIsOpenAddTextModal,
  addImage,
  onSelectVideo,
  onSelectAudio,
  paddingValue,
  onChangePadding,
  isMinimal = false
}: IEditorToolbar) => {
  return (
    <CustomAppBar position="sticky">
      <CustomToolbar variant="dense">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: '10px'
            }}
          >
            <TextFieldsIcon
              onClick={() => setIsOpenAddTextModal(true)}
              sx={{
                cursor: 'pointer',
                width: '40px',
                height: '40px'
              }}
            />
            <ImageUploader onPick={addImage}>
              <AddPhotoAlternateIcon
                sx={{
                  cursor: 'pointer',
                  width: '40px',
                  height: '40px'
                }}
              />
            </ImageUploader>
            <VideoPanel onSelect={onSelectVideo} />
            <AudioPanel onSelect={onSelectAudio} />
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: '10px'
            }}
          >
            {!isMinimal && (
              <Box>
                <Typography gutterBottom>Spacing</Typography>
                <Slider
                  value={paddingValue}
                  onChange={(event: any) => onChangePadding(event.target.value)}
                  defaultValue={5}
                  aria-label="Default"
                  valueLabelDisplay="auto"
                  min={0}
                  max={40}
                  sx={{
                    width: '100px'
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </CustomToolbar>
    </CustomAppBar>
  )
}
