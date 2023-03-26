import React, { useState } from 'react'
import { Box, Button, Modal, TextField, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { useDropzone } from 'react-dropzone'
import { usePublishVideo } from './PublishVideo'
import { toBase64 } from '../../utils/toBase64'

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

interface VideoModalProps {
  open: boolean
  onClose: () => void
  onPublish: (value: any) => void
}

const VideoModal: React.FC<VideoModalProps> = ({
  open,
  onClose,
  onPublish
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const { publishVideo } = usePublishVideo()
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'video/*': []
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0])
    }
  })

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
  }

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDescription(event.target.value)
  }

  const handleSubmit = async () => {
    const missingFields = []

    if (!title) missingFields.push('title')
    if (!file) missingFields.push('file')
    if (missingFields.length > 0) {
      const missingFieldsString = missingFields.join(', ')
      const errMsg = `Missing: ${missingFieldsString}`

      return
    }
    if (!file) return
    try {
      const base64 = await toBase64(file)
      if (typeof base64 !== 'string') return
      const base64String = base64.split(',')[1]

      const res = await publishVideo({
        title,
        description,
        base64: base64String
      })
      onPublish(res)
      setFile(null)
      setTitle('')
      setDescription('')
      onClose()
    } catch (error) {}
  }

  return (
    <StyledModal open={open} onClose={onClose}>
      <ModalContent>
        <form>
          <Typography variant="h6" component="h2" gutterBottom>
            Upload Video
          </Typography>
          <Box
            {...getRootProps()}
            sx={{
              border: '1px dashed gray',
              padding: 2,
              textAlign: 'center',
              marginBottom: 2
            }}
          >
            <input {...getInputProps()} />
            <Typography>
              {file
                ? file.name
                : 'Drag and drop a video file here or click to select a file'}
            </Typography>
          </Box>
          <TextField
            label="Video Title"
            variant="outlined"
            fullWidth
            value={title}
            onChange={handleTitleChange}
            inputProps={{ maxLength: 40 }}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Video Description"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={handleDescriptionChange}
            inputProps={{ maxLength: 180 }}
            sx={{ marginBottom: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </form>
      </ModalContent>
    </StyledModal>
  )
}

export default VideoModal
