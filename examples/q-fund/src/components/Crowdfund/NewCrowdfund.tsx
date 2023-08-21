import React, { useEffect, useState } from "react";
import CreateIcon from "@mui/icons-material/Create";
import {
  AddCrowdFundButton,
  AddLogoIcon,
  CATCard,
  CATContainer,
  CoverImagePreview,
  CreateContainer,
  CrowdfundCardTitle,
  CustomInputField,
  LogoPreviewRow,
  ModalBody,
  NewCrowdfundTitle,
  TimesIcon,
} from "./Crowdfund-styles";
import { Box, Button, Modal, useTheme } from "@mui/material";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";
import ShortUniqueId from "short-unique-id";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AddIcon from "@mui/icons-material/Add";
import "react-quill/dist/quill.snow.css";
import { FileAttachment } from "./FileAttachment";
import { useDispatch, useSelector } from "react-redux";
import { setNotification } from "../../state/features/notificationsSlice";
import { objectToBase64 } from "../../utils/toBase64";
import { RootState } from "../../state/store";
import { attachmentBase, crowdfundBase } from "../../constants";
import {
  addCrowdfundToBeginning,
  addToHashMap,
  upsertCrowdfunds,
} from "../../state/features/crowdfundSlice";
import ImageUploader from "../ImageUploader";
import { ChannelCard, CrowdfundContainer } from "../../pages/Home/Home-styles";

Quill.register("modules/imageResize", ImageResize);

const uid = new ShortUniqueId();

const modules = {
  imageResize: {
    parchment: Quill.import("parchment"),
    modules: ["Resize", "DisplaySize"],
  },
  toolbar: [
    ["bold", "italic", "underline", "strike"], // styled text
    ["blockquote", "code-block"], // blocks
    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }], // lists
    [{ script: "sub" }, { script: "super" }], // superscript/subscript
    [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
    [{ direction: "rtl" }], // text direction
    [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }], // custom button values
    [{ color: [] }, { background: [] }], // dropdown with defaults
    [{ font: [] }], // font family
    [{ align: [] }], // text align
    ["clean"], // remove formatting
    ["image"], // image
  ],
};

interface NewCrowdfundProps {
  editId?: string;
  editContent?: null | {
    title: string;
    inlineContent: string;
    attachments: any[];
    user: string;
    coverImage: string | null;
  };
}
export const NewCrowdfund = ({ editId, editContent }: NewCrowdfundProps) => {
  const theme = useTheme();

  const dispatch = useDispatch();
  const username = useSelector((state: RootState) => state.auth?.user?.name);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [inlineContent, setInlineContent] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  useEffect(() => {
    if (editContent) {
      setTitle(editContent?.title);
      setInlineContent(editContent?.inlineContent);
      setAttachments(editContent?.attachments);
      setCoverImage(editContent?.coverImage || null);
    }
  }, [editContent]);

  const onClose = () => {
    setIsOpen(false);
  };
  console.log({ editContent });

  async function publishQDNResource() {
    let errorMsg = "";
    let name: string = "";
    if (username) {
      name = username;
    }
    if (!name) {
      errorMsg =
        "Cannot publish without access to your name. Please authenticate.";
    }
    if (editId && editContent?.user !== name) {
      errorMsg = "Cannot publish another user's resource";
    }

    if (errorMsg) {
      dispatch(
        setNotification({
          msg: errorMsg,
          alertType: "error",
        })
      );
      return;
    }

    const crowdfundObject: any = {
      title,
      createdAt: Date.now(),
      version: 1,
      attachments: [],
      inlineContent,
      coverImage,
    };

    try {
      const id = uid();

      const attachmentArray: any[] = [];
      const attachmentArrayToSave: any[] = [];
      for (const attachment of attachments) {
        let alreadyExits = !!attachment?.identifier;

        if (alreadyExits) {
          attachmentArray.push(attachment);
          continue;
        }
        const id = uid();
        const id2 = uid();
        const identifier = `${attachmentBase}${id}_${id2}`;
        const fileExtension = attachment?.name?.split(".")?.pop();
        if (!fileExtension) {
          throw new Error("One of your attachments does not have an extension");
        }
        let service = "FILE";
        const type = attachment?.type;
        if (type.startsWith("audio/")) {
          service = "AUDIO";
        }
        if (type.startsWith("video/")) {
          service = "VIDEO";
        }
        const obj: any = {
          name,
          service,
          filename: attachment.name,
          identifier,
          file: attachment,
          type: attachment?.type,
          size: attachment?.size,
        };

        attachmentArray.push(obj);
        attachmentArrayToSave.push(obj);
      }
      crowdfundObject.attachments = attachmentArray;
      if (attachmentArrayToSave.length > 0) {
        const multiplePublish = {
          action: "PUBLISH_MULTIPLE_QDN_RESOURCES",
          resources: [...attachmentArrayToSave],
        };
        await qortalRequest(multiplePublish);
      }

      const sanitizeTitle = title
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
        .toLowerCase();
      const identifier = editId
        ? editId
        : `${crowdfundBase}${sanitizeTitle.slice(0, 30)}_${id}`;
      const crowdfundObjectToBase64 = await objectToBase64(crowdfundObject);
      let requestBody: any = {
        action: "PUBLISH_QDN_RESOURCE",
        name: name,
        service: "DOCUMENT",
        data64: crowdfundObjectToBase64,
        title: title.slice(0, 50),
        // description: description,
        identifier,
      };

      await qortalRequest(requestBody);
      dispatch(
        setNotification({
          msg: "Alert published",
          alertType: "success",
        })
      );
      const objToStore: any = {
        ...crowdfundObject,
        title: title,
        // description: description,
        id: identifier,
        user: name,
        created: Date.now(),
        updated: Date.now(),
      };
      if (!editId) {
        dispatch(addCrowdfundToBeginning(objToStore));
      } else {
        dispatch(upsertCrowdfunds([objToStore]));
      }

      dispatch(addToHashMap(objToStore));

      setTitle("");
      setInlineContent("");
      setAttachments([]);
      setCoverImage(null);
      setIsOpen(false);
    } catch (error: any) {
      let notificationObj: any = null;
      if (typeof error === "string") {
        notificationObj = {
          msg: error || "Failed to publish alert",
          alertType: "error",
        };
      } else if (typeof error?.error === "string") {
        notificationObj = {
          msg: error?.error || "Failed to publish alert",
          alertType: "error",
        };
      } else {
        notificationObj = {
          msg: error?.message || "Failed to publish alert",
          alertType: "error",
        };
      }
      if (!notificationObj) return;
      dispatch(setNotification(notificationObj));

      throw new Error("Failed to publish alert");
    }
  }
  return (
    <>
      {username && (
        <>
          {editId ? (
            editContent?.user === username ? (
              <CreateContainer onClick={() => setIsOpen(true)}>
                <CreateIcon />
              </CreateContainer>
            ) : null
          ) : (
            <CATContainer>
              <AddCrowdFundButton onClick={() => setIsOpen(true)}>
                <AddIcon />{" "}
                <CrowdfundCardTitle>Start a crowdfund</CrowdfundCardTitle>
              </AddCrowdFundButton>
            </CATContainer>
          )}
        </>
      )}

      <Modal
        open={isOpen}
        onClose={onClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <ModalBody>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {editId ? (
              <NewCrowdfundTitle>Update Crowdfund</NewCrowdfundTitle>
            ) : (
              <NewCrowdfundTitle>Create Crowdfund</NewCrowdfundTitle>
            )}
            {!coverImage ? (
              <ImageUploader onPick={(img: string) => setCoverImage(img)}>
                <Button variant="contained">
                  Add Cover Image
                  <AddLogoIcon
                    sx={{
                      height: "25px",
                      width: "auto",
                    }}
                  ></AddLogoIcon>
                </Button>
              </ImageUploader>
            ) : (
              <LogoPreviewRow>
                <CoverImagePreview src={coverImage} alt="logo" />
                <TimesIcon
                  color={theme.palette.text.primary}
                  onClickFunc={() => setCoverImage(null)}
                  height={"32"}
                  width={"32"}
                ></TimesIcon>
              </LogoPreviewRow>
            )}
          </Box>

          <CustomInputField
            name="title"
            label="Title"
            variant="filled"
            value={title}
            onChange={e => setTitle(e.target.value)}
            inputProps={{ maxLength: 180 }}
            multiline
            maxRows={3}
            required
          />

          <FileAttachment
            setAttachments={setAttachments}
            attachments={attachments}
          />

          <ReactQuill
            theme="snow"
            value={inlineContent}
            onChange={setInlineContent}
            modules={modules}
          />
          <Button
            sx={{
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.text.primary,
              fontFamily: "Arial",
            }}
            onClick={() => {
              publishQDNResource();
            }}
          >
            Publish
          </Button>
        </ModalBody>
      </Modal>
    </>
  );
};
