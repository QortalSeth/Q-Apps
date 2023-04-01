import React from 'react'
import { Box, Modal } from '@mui/material'

interface MyModalProps {
  open: boolean
  onClose?: () => void
  onSubmit?: (obj: any) => Promise<void>
  children: any
}

export const ReusableModal: React.FC<MyModalProps> = ({
  open,
  onClose,
  onSubmit,
  children
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '75%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {children}
      </Box>
    </Modal>
  )
}
