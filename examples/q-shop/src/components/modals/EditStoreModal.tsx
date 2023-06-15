import React, { ChangeEvent, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Modal,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  OutlinedInput,
  Chip,
  IconButton
} from "@mui/material";
import { useDispatch } from "react-redux";
import { toggleCreateStoreModal } from "../../state/features/globalSlice";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/system";
import ImageUploader from "../common/ImageUploader";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

interface SelectOption {
  id: string;
  name: string;
}

export interface onPublishParamEdit {
  title: string;
  description: string;
  shipsTo: string;
  location: string;
  logo: string;
}
interface MyModalProps {
  open: boolean;
  onClose: () => void;
  onPublish: (param: onPublishParamEdit) => Promise<void>;
  username: string;
  currentStore: any;
}

const ChipContainer = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  "& > *": {
    margin: "4px"
  }
});

const MyModal: React.FC<MyModalProps> = ({
  open,
  onClose,
  onPublish,
  username,
  currentStore
}) => {
  const dispatch = useDispatch();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [shipsTo, setShipsTo] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [blogIdentifier, setBlogIdentifier] = useState(username || "");
  const [logo, setLogo] = useState<string | null>(null);
  const handlePublish = async (): Promise<void> => {
    try {
      setErrorMessage("");
      if (!logo) {
        setErrorMessage("A logo is required");
        return;
      }
      await onPublish({
        title,
        description,
        shipsTo,
        location,
        logo
      });
      handleClose();
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  React.useEffect(() => {
    if (currentStore) {
      setTitle(currentStore?.title || "");
      setDescription(currentStore?.description || "");
      setLogo(currentStore?.description || null);
      setLocation(currentStore?.location || "");
      setShipsTo(currentStore?.shipsTo || "");
    }
  }, [currentStore]);

  const handleClose = (): void => {
    setTitle("");
    setDescription("");
    setErrorMessage("");
    dispatch(toggleCreateStoreModal(false));
    onClose();
  };

  const handleInputChangeId = (event: ChangeEvent<HTMLInputElement>) => {
    // Replace any non-alphanumeric and non-space characters with an empty string
    // Replace multiple spaces with a single dash and remove any dashes that come one after another
    let newValue = event.target.value
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    if (newValue.toLowerCase().includes("post")) {
      // Replace the 'post' string with an empty string
      newValue = newValue.replace(/post/gi, "");
    }
    if (newValue.toLowerCase().includes("q-blog")) {
      // Replace the 'q-blog' string with an empty string
      newValue = newValue.replace(/q-blog/gi, "");
    }
    setBlogIdentifier(newValue);
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
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
          maxHeight: "95vh"
        }}
      >
        <Typography id="modal-title" variant="h6" component="h2">
          Create blog
        </Typography>
        <ImageUploader onPick={(img: string) => setLogo(img)}>
          <AddPhotoAlternateIcon
            sx={{
              height: "20px",
              width: "auto",
              cursor: "pointer"
            }}
          ></AddPhotoAlternateIcon>
        </ImageUploader>
        <TextField
          id="modal-title-input"
          label="Url Preview"
          value={`/${username}/${blogIdentifier}`}
          // onChange={(e) => setTitle(e.target.value)}
          fullWidth
          disabled={true}
        />

        <TextField
          id="modal-blogId-input"
          label="Blog Id"
          value={blogIdentifier}
          onChange={handleInputChangeId}
          fullWidth
          inputProps={{ maxLength: 25 }}
          required
          disabled={true}
        />

        <TextField
          id="modal-title-input"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
        />
        <TextField
          id="modal-description-input"
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={4}
          fullWidth
          required
        />
        <TextField
          id="modal-location-input"
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          fullWidth
          required
        />
        <TextField
          id="modal-shipsTo-input"
          label="Ships To"
          value={shipsTo}
          onChange={(e) => setShipsTo(e.target.value)}
          fullWidth
          required
        />
        <FormControl fullWidth sx={{ marginBottom: 2 }}></FormControl>
        {errorMessage && (
          <Typography color="error" variant="body1">
            {errorMessage}
          </Typography>
        )}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
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
