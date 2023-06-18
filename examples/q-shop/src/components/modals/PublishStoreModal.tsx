import React, { ChangeEvent, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  FormControl,
  useTheme
} from "@mui/material";
import { useDispatch } from "react-redux";
import { toggleCreateStoreModal } from "../../state/features/globalSlice";
import ImageUploader from "../common/ImageUploader";
import {
  ModalTitle,
  StoreLogoPreview,
  AddLogoButton,
  AddLogoIcon,
  TimesIcon,
  LogoPreviewRow,
  CustomInputField,
  ModalBody,
  ButtonRow,
  CancelButton,
  CreateButton
} from "./PublishStoreModal-styles";
import { ThemeContext } from "@emotion/react";
export interface onPublishParam {
  title: string;
  description: string;
  shipsTo: string;
  location: string;
  storeIdentifier: string;
  logo: string;
}
interface CreateStoreModalProps {
  open: boolean;
  onClose: () => void;
  onPublish: (param: onPublishParam) => Promise<void>;
  username: string;
}

const CreateStoreModal: React.FC<CreateStoreModalProps> = ({
  open,
  onClose,
  onPublish,
  username
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [shipsTo, setShipsTo] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [storeIdentifier, setStoreIdentifier] = useState(username || "");
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
        storeIdentifier,
        logo
      });
      handleClose();
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

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
    if (newValue.toLowerCase().includes("q-shop")) {
      // Replace the 'q-shop' string with an empty string
      newValue = newValue.replace(/q-shop/gi, "");
    }
    setStoreIdentifier(newValue);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <ModalBody>
        <ModalTitle id="modal-title">Create Shop</ModalTitle>
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
        <CustomInputField
          id="modal-title-input"
          label="Url Preview"
          value={`/${username}/${storeIdentifier}`}
          // onChange={(e) => setTitle(e.target.value)}
          fullWidth
          disabled={true}
          variant="filled"
        />

        <CustomInputField
          id="modal-shopId-input"
          label="Shop Id"
          value={storeIdentifier}
          onChange={handleInputChangeId}
          fullWidth
          inputProps={{ maxLength: 25 }}
          required
          variant="filled"
        />

        <CustomInputField
          id="modal-title-input"
          label="Title"
          value={title}
          onChange={(e: any) => setTitle(e.target.value)}
          fullWidth
          required
          variant="filled"
        />

        <CustomInputField
          id="modal-description-input"
          label="Description"
          value={description}
          onChange={(e: any) => setDescription(e.target.value)}
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
          onChange={(e: any) => setLocation(e.target.value)}
          fullWidth
          required
          variant="filled"
        />

        <CustomInputField
          id="modal-shipsTo-input"
          label="Ships To"
          value={shipsTo}
          onChange={(e: any) => setShipsTo(e.target.value)}
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
        <ButtonRow>
          <CancelButton variant="outlined" color="error" onClick={handleClose}>
            Cancel
          </CancelButton>
          <CreateButton variant="contained" onClick={handlePublish}>
            Create Shop
          </CreateButton>
        </ButtonRow>
      </ModalBody>
    </Modal>
  );
};

export default CreateStoreModal;
