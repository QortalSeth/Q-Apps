import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Modal } from '@mui/material';

interface MyModalProps {
  open: boolean;
  onClose: () => void;
  onPublish: (title: string, description: string) => Promise<void>;
}

const MyModal: React.FC<MyModalProps> = ({ open, onClose, onPublish }) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handlePublish = async (): Promise<void> => {
    try {
     await onPublish(title, description);
    //  handleClose();
    } catch (error: any) {
      setErrorMessage(error.message);
    }
   
  };

  const handleClose = (): void => {
    setTitle('');
    setDescription('');
    setErrorMessage('');
    onClose();
  };

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
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2">
            My Modal
          </Typography>
          <TextField
            id="modal-title-input"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          <TextField
            id="modal-description-input"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            fullWidth
          />
          {errorMessage && (
            <Typography color="error" variant="body1">
              {errorMessage}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" color="error" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained" color="success" onClick={handlePublish}>
              Publish
            </Button>
          </Box>
        </Box>
      </Modal>
  );
};

export default MyModal;