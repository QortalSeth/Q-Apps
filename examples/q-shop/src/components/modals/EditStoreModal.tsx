import { useState, useEffect } from "react";
import { Typography, Modal, FormControl, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toggleCreateStoreModal } from "../../state/features/globalSlice";
import { RootState } from "../../state/store";
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
import ImageUploader from "../common/ImageUploader";
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
}

const MyModal: React.FC<MyModalProps> = ({ open, onClose, onPublish }) => {
  const dispatch = useDispatch();
  const currentStore = useSelector(
    (state: RootState) => state.global.currentStore
  );

  const storeId = useSelector((state: RootState) => state.store.storeId);

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [shipsTo, setShipsTo] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
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
    if (open && currentStore && storeId === currentStore.id) {
      setTitle(currentStore?.title || "");
      setDescription(currentStore?.description || "");
      setLogo(currentStore?.logo || null);
      setLocation(currentStore?.location || "");
      setShipsTo(currentStore?.shipsTo || "");
    }
  }, [currentStore, storeId, open]);

  const handleClose = (): void => {
    setTitle("");
    setDescription("");
    setErrorMessage("");
    setDescription("");
    setLogo(null);
    setLocation("");
    setShipsTo("");
    dispatch(toggleCreateStoreModal(false));
    onClose();
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
          Edit Shop
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
