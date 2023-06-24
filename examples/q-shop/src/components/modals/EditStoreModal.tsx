import { ChangeEvent, useState, useEffect } from "react";
import {
  TextField,
  Typography,
  Modal,
  FormControl,
  useTheme
} from "@mui/material";
import { useDispatch } from "react-redux";
import { toggleCreateStoreModal } from "../../state/features/globalSlice";
import ImageUploader from "../common/ImageUploader";

import {
  AddLogoButton,
  AddLogoIcon,
  ButtonRow,
  CancelButton,
  CreateButton,
  CustomInputField,
  LogoPreviewRow,
  ModalBody,
  ModalTitle,
  StoreLogoPreview,
  TimesIcon
} from "./CreateStoreModal-styles";
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

  const theme = useTheme();

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

  useEffect(() => {
    if (currentStore) {
      setTitle(currentStore?.title || "");
      setDescription(currentStore?.description || "");
      setLogo(currentStore?.logo || null);
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
      <ModalBody>
        <ModalTitle id="modal-title" variant="h6">
          Edit Shop{" "}
        </ModalTitle>
        {!logo ? (
          <ImageUploader onPick={(img: string) => setLogo(img)}>
            <AddLogoButton>
              Add Shop Logo
              <AddLogoIcon
                sx={{
                  height: "25px",
                  width: "auto"
                }}
              ></AddLogoIcon>
            </AddLogoButton>
          </ImageUploader>
        ) : (
          <LogoPreviewRow>
            <StoreLogoPreview src={logo} alt="logo" />
            <TimesIcon
              color={theme.palette.text.primary}
              onClickFunc={() => setLogo(null)}
              height={"32"}
              width={"32"}
            ></TimesIcon>
          </LogoPreviewRow>
        )}
        <TextField
          id="modal-title-input"
          label="Url Preview"
          value={`/${username}/${blogIdentifier}`}
          // onChange={(e) => setTitle(e.target.value)}
          fullWidth
          disabled={true}
        />

        <CustomInputField
          id="modal-blogId-input"
          label="Blog Id"
          value={blogIdentifier}
          onChange={handleInputChangeId}
          fullWidth
          inputProps={{ maxLength: 25 }}
          required
          disabled={true}
          variant="filled"
        />

        <CustomInputField
          id="modal-title-input"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          inputProps={{ maxLength: 50 }}
          fullWidth
          required
          variant="filled"
        />
        <CustomInputField
          id="modal-description-input"
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={4}
          fullWidth
          required
          variant="filled"
        />
        <CustomInputField
          id="modal-location-input"
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          fullWidth
          required
          variant="filled"
        />
        <CustomInputField
          id="modal-shipsTo-input"
          label="Ships To"
          value={shipsTo}
          onChange={(e) => setShipsTo(e.target.value)}
          fullWidth
          required
          variant="filled"
        />
        <FormControl fullWidth sx={{ marginBottom: 2 }}></FormControl>
        {errorMessage && (
          <Typography color="error" variant="body1">
            {errorMessage}
          </Typography>
        )}
        <ButtonRow sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <CancelButton variant="outlined" color="error" onClick={handleClose}>
            Cancel
          </CancelButton>
          <CreateButton variant="contained" onClick={handlePublish}>
            Edit Shop
          </CreateButton>
        </ButtonRow>
      </ModalBody>
    </Modal>
  );
};

export default MyModal;
