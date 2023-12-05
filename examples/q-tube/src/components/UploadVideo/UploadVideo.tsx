import React, { useEffect, useState } from "react";
import {
  AddCoverImageButton,
  AddLogoIcon,
  CoverImagePreview,
  CrowdfundActionButton,
  CrowdfundActionButtonRow,
  CustomInputField,
  CustomSelect,
  LogoPreviewRow,
  ModalBody,
  NewCrowdfundTitle,
  StyledButton,
  TimesIcon,
} from "./Upload-styles";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Typography,
  useTheme,
} from "@mui/material";
import ShortUniqueId from "short-unique-id";
import { useDispatch, useSelector } from "react-redux";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { useDropzone } from "react-dropzone";

import { setNotification } from "../../state/features/notificationsSlice";
import { objectToBase64, uint8ArrayToBase64 } from "../../utils/toBase64";
import { RootState } from "../../state/store";
import {
  upsertVideosBeginning,
  addToHashMap,
  upsertVideos,
} from "../../state/features/videoSlice";
import ImageUploader from "../common/ImageUploader";
import { QTUBE_PLAYLIST_BASE, QTUBE_VIDEO_BASE, categories, subCategories } from "../../constants";
import { MultiplePublish } from "../common/MultiplePublish/MultiplePublish";

const uid = new ShortUniqueId();
const shortuid = new ShortUniqueId({ length: 5 });

interface NewCrowdfundProps {
  editId?: string;
  editContent?: null | {
    title: string;
    user: string;
    coverImage: string | null;
  };
}

interface VideoFile {
  file: File;
  title: string;
  description: string;
  coverImage?: string;
}
export const UploadVideo = ({ editId, editContent }: NewCrowdfundProps) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [isOpenMultiplePublish, setIsOpenMultiplePublish] = useState(false);
  const username = useSelector((state: RootState) => state.auth?.user?.name);
  const userAddress = useSelector(
    (state: RootState) => state.auth?.user?.address
  );
  const [files, setFiles] = useState<VideoFile[]>([]);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [step, setStep] = useState<string>("videos");
  const [playlistCoverImage, setPlaylistCoverImage] = useState<null | string>(
    null
  );

  const [playlistTitle, setPlaylistTitle] = useState<string>("");
  const [playlistDescription, setPlaylistDescription] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);

  const [selectedCategoryVideos, setSelectedCategoryVideos] = useState<any>(null);
  const [selectedSubCategoryVideos, setSelectedSubCategoryVideos] = useState<any>(null);

  const [playlistSetting, setPlaylistSetting] = useState<null | string>(null);
  const [publishes, setPublishes] = useState<any[]>([])
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "video/*": [],
    },
    maxFiles: 10,
    maxSize: 419430400, // 400 MB in bytes
    onDrop: (acceptedFiles, rejectedFiles) => {
      const formatArray = acceptedFiles.map((item) => {
        return {
          file: item,
          title: "",
          description: "",
          coverImage: "",
        };
      });
      setFiles((prev) => [...prev, ...formatArray]);

      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error) => {
          console.log(`Error with file ${file.name}: ${error.message}`);
        });
      });
    },
  });

  useEffect(() => {
    if (editContent) {
     
    }
  }, [editContent]);

  const onClose = () => {
    setIsOpen(false);
  };

  async function publishQDNResource() {
    try {
      if(playlistSetting === 'new'){
        if(!playlistTitle) throw new Error('Please enter a title')
        if(!playlistDescription) throw new Error('Please enter a description')
        if(!playlistCoverImage) throw new Error('Please select cover image')
        if(!selectedCategory) throw new Error('Please select a category')
      }
      if (!userAddress) throw new Error("Unable to locate user address");
      let errorMsg = "";
      let name = "";
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

      let listOfPublishes = []

      for (const publish of files) {
        const title = publish.title
        const description = publish.description
        const category = selectedCategoryVideos.id
        const subcategory = selectedSubCategoryVideos?.id || ""
        const coverImage = publish.coverImage
        const file = publish.file
        const sanitizeTitle = title
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
        .toLowerCase();

        const id = uid();

        const identifier = editId
        ? editId
        : `${QTUBE_VIDEO_BASE}${sanitizeTitle.slice(0, 30)}_${id}`;

        const code = shortuid()

      const videoObject: any = {
        title,
        version: 1,
        fullDescription: description,
        videoImage: coverImage,
        videoReference: {
          name,
          identifier: identifier,
          service: "VIDEO"
        },
        commentsId: `${QTUBE_VIDEO_BASE}_cm_${id}`,
        category,
        subcategory,
        code
      };

      let metadescription = `**category:${category};subcategory:${subcategory};code:${code}**` + description.slice(0,150)


      
      const crowdfundObjectToBase64 = await objectToBase64(videoObject);
      // Description is obtained from raw data
      const requestBodyJson: any = {
        action: "PUBLISH_QDN_RESOURCE",
        name: name,
        service: "DOCUMENT",
        data64: crowdfundObjectToBase64,
        title: title.slice(0, 50),
        description: metadescription,
        identifier: identifier + '_metadata',
        tag1: QTUBE_VIDEO_BASE,
        code
      };
      const requestBodyVideo: any = {
        action: "PUBLISH_QDN_RESOURCE",
        name: name,
        service: "VIDEO",
        file,
        title: title.slice(0, 50),
        description: metadescription,
        identifier,
        tag1: QTUBE_VIDEO_BASE
      };
      listOfPublishes.push(requestBodyJson);
      listOfPublishes.push(requestBodyVideo)

    }

      const isNewPlaylist = playlistSetting === 'new'

      if(isNewPlaylist){
        const title = playlistTitle
        const description = playlistDescription
        const category = selectedCategory.id
        const subcategory = selectedSubCategory?.id || ""
        const coverImage = playlistCoverImage
        const sanitizeTitle = title
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
        .toLowerCase();

        const id = uid();

        const identifier = editId
        ? editId
        : `${QTUBE_PLAYLIST_BASE}${sanitizeTitle.slice(0, 30)}_${id}`;


      const videos = listOfPublishes.filter((item)=> item.service === 'DOCUMENT' && item.tag1 === 'qtube_vid_').map((vid)=> {
        return {
          identifier: vid.identifier,
          service: vid.service,
          name: vid.name,
          code: vid.code
        }
      })

      const playlistObject: any = {
        title,
        version: 1,
        description,
        image: coverImage,
        videos,
        commentsId: `${QTUBE_PLAYLIST_BASE}_cm_${id}`,
        category,
        subcategory
      };

      const codes = videos.map(item => `c:${item.code};`).join('');

      let metadescription = `**category:${category};subcategory:${subcategory};${codes}**` + description.slice(0,120)


      
      const crowdfundObjectToBase64 = await objectToBase64(playlistObject);
      // Description is obtained from raw data
      const requestBodyJson: any = {
        action: "PUBLISH_QDN_RESOURCE",
        name: name,
        service: "PLAYLIST",
        data64: crowdfundObjectToBase64,
        title: title.slice(0, 50),
        description: metadescription,
        identifier: identifier + '_metadata',
        tag1: QTUBE_VIDEO_BASE
      };

      
      listOfPublishes.push(requestBodyJson)
      }
      

      
     

      setPublishes(listOfPublishes)
      setIsOpenMultiplePublish(true);
    } catch (error: any) {
      let notificationObj: any = null;
      if (typeof error === "string") {
        notificationObj = {
          msg: error || "Failed to publish crowdfund",
          alertType: "error",
        };
      } else if (typeof error?.error === "string") {
        notificationObj = {
          msg: error?.error || "Failed to publish crowdfund",
          alertType: "error",
        };
      } else {
        notificationObj = {
          msg: error?.message || "Failed to publish crowdfund",
          alertType: "error",
        };
      }
      if (!notificationObj) return;
      dispatch(setNotification(notificationObj));

      throw new Error("Failed to publish crowdfund");
    }
  }

  const handleOnchange = (index: number, type: string, value: string) => {
    setFiles((prev) => {
      let formattedValue = value
      if(type === 'title'){
        formattedValue = value.replace(/[^a-zA-Z0-9\s]/g, "")
    
      }
      const copyFiles = [...prev];
      copyFiles[index] = {
        ...copyFiles[index],
        [type]: formattedValue,
      };
      return copyFiles;
    });
  };

  const handleOptionCategoryChange = (event: SelectChangeEvent<string>) => {
    const optionId = event.target.value;
    const selectedOption = categories.find((option) => option.id === +optionId);
    setSelectedCategory(selectedOption || null);
  };
  const handleOptionSubCategoryChange = (
    event: SelectChangeEvent<string>,
    subcategories: any[]
  ) => {
    const optionId = event.target.value;
    const selectedOption = subcategories.find(
      (option) => option.id === +optionId
    );
    setSelectedSubCategory(selectedOption || null);
  };

  const handleOptionCategoryChangeVideos = (event: SelectChangeEvent<string>) => {
    const optionId = event.target.value;
    const selectedOption = categories.find((option) => option.id === +optionId);
    setSelectedCategoryVideos(selectedOption || null);
  };
  const handleOptionSubCategoryChangeVideos = (
    event: SelectChangeEvent<string>,
    subcategories: any[]
  ) => {
    const optionId = event.target.value;
    const selectedOption = subcategories.find(
      (option) => option.id === +optionId
    );
    setSelectedSubCategoryVideos(selectedOption || null);
  };

  const next = ()=> {

    try {
      if(!selectedCategoryVideos) throw new Error('Please select a category')
      files.forEach((file)=> {
        if(!file.title) throw new Error('Please enter a title')
        if(!file.description) throw new Error('Please enter a description')
        if(!file.coverImage) throw new Error('Please select cover image')
      })
  
      setStep("playlist");
    } catch (error) {
     
    dispatch(setNotification({
      msg: error?.message || "Please fill out all inputs",
      alertType: "error",
    }));
    }
   
  }

  return (
    <>
      {username && (
        <>
          {editId ? null : (
            <StyledButton
              color="primary"
              startIcon={<AddBoxIcon />}
              onClick={() => {
                setIsOpen(true);
              }}
            >
              add video
            </StyledButton>
          )}
        </>
      )}

      <Modal
        open={isOpen}
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
              <NewCrowdfundTitle>Update Videos</NewCrowdfundTitle>
            ) : (
              <NewCrowdfundTitle>Publish Videos</NewCrowdfundTitle>
            )}
          </Box>

          {step === "videos" && (
            <>
              <Box
                {...getRootProps()}
                sx={{
                  border: "1px dashed gray",
                  padding: 2,
                  textAlign: "center",
                  marginBottom: 2,
                  cursor: "pointer",
                }}
              >
                <input {...getInputProps()} />
                <Typography>
                  Drag and drop a video files here or click to select files
                </Typography>
              </Box>
              <Box sx={{
                display: 'flex',
                gap: '20px',
                alignItems: 'center'
              }}>
                {files?.length > 0 && (
                  <>
                   <FormControl fullWidth sx={{ marginBottom: 2}}>
                    <InputLabel id="Category">Select a Category</InputLabel>
                    <Select
                      labelId="Category"
                      input={<OutlinedInput label="Select a Category" />}
                      value={selectedCategoryVideos?.id || ""}
                      onChange={handleOptionCategoryChangeVideos}
                    >
                      {categories.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {selectedCategoryVideos && subCategories[selectedCategoryVideos?.id] && (
                    <FormControl fullWidth sx={{ marginBottom: 2 }}>
                      <InputLabel id="Category">
                        Select a Sub-Category
                      </InputLabel>
                      <Select
                        labelId="Sub-Category"
                        input={<OutlinedInput label="Select a Sub-Category" />}
                        value={selectedSubCategoryVideos?.id || ""}
                        onChange={(e) =>
                          handleOptionSubCategoryChangeVideos(
                            e,
                            subCategories[selectedCategoryVideos?.id]
                          )
                        }
                      >
                        {subCategories[selectedCategoryVideos.id].map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  </>
                )}
             
              </Box>
              {files.map((file, index) => {
                return (
                  <React.Fragment key={index}>
                    <Typography>{file?.file?.name}</Typography>
                    {!file?.coverImage ? (
                      <ImageUploader
                        onPick={(img: string) =>
                          handleOnchange(index, "coverImage", img)
                        }
                      >
                        <AddCoverImageButton variant="contained">
                          Add Cover Image
                          <AddLogoIcon
                            sx={{
                              height: "25px",
                              width: "auto",
                            }}
                          ></AddLogoIcon>
                        </AddCoverImageButton>
                      </ImageUploader>
                    ) : (
                      <LogoPreviewRow>
                        <CoverImagePreview src={file?.coverImage} alt="logo" />
                        <TimesIcon
                          color={theme.palette.text.primary}
                          onClickFunc={() =>
                            handleOnchange(index, "coverImage", "")
                          }
                          height={"32"}
                          width={"32"}
                        ></TimesIcon>
                      </LogoPreviewRow>
                    )}
                    <CustomInputField
                      name="title"
                      label="Title of video"
                      variant="filled"
                      value={file.title}
                      onChange={(e) =>
                        handleOnchange(index, "title", e.target.value)
                      }
                      inputProps={{ maxLength: 180 }}
                      required
                    />
                    <CustomInputField
                      name="description"
                      label="Describe your video in a few words"
                      variant="filled"
                      value={file?.description}
                      onChange={(e) =>
                        handleOnchange(index, "description", e.target.value)
                      }
                      inputProps={{ maxLength: 180 }}
                      multiline
                      maxRows={3}
                      required
                    />
                  </React.Fragment>
                );
              })}
            </>
          )}
          {step === "playlist" && (
            <>
              <Box
                sx={{
                  width: "100%",
                  justifyContent: "center",
                  display: "flex",
                }}
              >
                <Typography>Playlist</Typography>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  justifyContent: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "18px",
                    marginTop: "20px",
                  }}
                >
                  Would you like to add these videos to a playlist?
                </Typography>
                <Typography
                  sx={{
                    fontSize: "16px",
                  }}
                >
                  Add to a playlist is OPTIONAL
                </Typography>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  justifyContent: "center",
                  display: "flex",
                  gap: "20px",
                }}
              >
                <CrowdfundActionButton
                  variant="contained"
                  onClick={() => {
                    setPlaylistSetting("new");
                  }}
                >
                  New playlist
                </CrowdfundActionButton>
                {/* <CrowdfundActionButton
                  variant="contained"
                  onClick={() => {
                    setPlaylistSetting("existing");
                  }}
                >
                  Existing playlist
                </CrowdfundActionButton> */}
              </Box>
              {playlistSetting === "new" && (
                <>
                  {!playlistCoverImage ? (
                    <ImageUploader
                      onPick={(img: string) => setPlaylistCoverImage(img)}
                    >
                      <AddCoverImageButton variant="contained">
                        Add Cover Image
                        <AddLogoIcon
                          sx={{
                            height: "25px",
                            width: "auto",
                          }}
                        ></AddLogoIcon>
                      </AddCoverImageButton>
                    </ImageUploader>
                  ) : (
                    <LogoPreviewRow>
                      <CoverImagePreview src={playlistCoverImage} alt="logo" />
                      <TimesIcon
                        color={theme.palette.text.primary}
                        onClickFunc={() => setPlaylistCoverImage(null)}
                        height={"32"}
                        width={"32"}
                      ></TimesIcon>
                    </LogoPreviewRow>
                  )}
                  <CustomInputField
                    name="title"
                    label="Title of playlist"
                    variant="filled"
                    value={playlistTitle}
                    onChange={(e) => {
                      const value = e.target.value
                      let formattedValue: string = value
                      
                        formattedValue = value.replace(/[^a-zA-Z0-9\s]/g, "")
                    
                      
                      setPlaylistTitle(formattedValue)
                    }}
                    inputProps={{ maxLength: 180 }}
                    required
                  />
                  <CustomInputField
                    name="description"
                    label="Describe your playlist in a few words"
                    variant="filled"
                    value={playlistDescription}
                    onChange={(e) => setPlaylistDescription(e.target.value)}
                    inputProps={{ maxLength: 180 }}
                    multiline
                    maxRows={3}
                    required
                  />
                  <FormControl fullWidth sx={{ marginBottom: 2, marginTop: 2 }}>
                    <InputLabel id="Category">Select a Category</InputLabel>
                    <Select
                      labelId="Category"
                      input={<OutlinedInput label="Select a Category" />}
                      value={selectedCategory?.id || ""}
                      onChange={handleOptionCategoryChange}
                    >
                      {categories.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {selectedCategory && subCategories[selectedCategory?.id] && (
                    <FormControl fullWidth sx={{ marginBottom: 2 }}>
                      <InputLabel id="Category">
                        Select a Sub-Category
                      </InputLabel>
                      <Select
                        labelId="Sub-Category"
                        input={<OutlinedInput label="Select a Sub-Category" />}
                        value={selectedSubCategory?.id || ""}
                        onChange={(e) =>
                          handleOptionSubCategoryChange(
                            e,
                            subCategories[selectedCategory?.id]
                          )
                        }
                      >
                        {subCategories[selectedCategory.id].map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </>
              )}
            </>
          )}

          <CrowdfundActionButtonRow>
            <CrowdfundActionButton
              onClick={() => {
                onClose();
              }}
              variant="contained"
              color="error"
            >
              Cancel
            </CrowdfundActionButton>
            <Box
              sx={{
                display: "flex",
                gap: "20px",
                alignItems: "center",
              }}
            >
              {step === "playlist" && (
                <CrowdfundActionButton
                  variant="contained"
                  onClick={() => {
                    // publishQDNResource();
                    // setIsOpenMultiplePublish(true)
                    setStep("videos");
                  }}
                >
                  Back
                </CrowdfundActionButton>
              )}
              {step === "playlist" ? (
                <CrowdfundActionButton
                  variant="contained"
                  onClick={() => {
                    publishQDNResource();
                  }}
                >
                  Publish
                </CrowdfundActionButton>
              ) : (
                <CrowdfundActionButton
                  variant="contained"
                  onClick={() => {
                    next()
                  }}
                >
                  Next
                </CrowdfundActionButton>
              )}
            </Box>
          </CrowdfundActionButtonRow>
        </ModalBody>
      </Modal>

      {isOpenMultiplePublish && (
        <MultiplePublish
          isOpen={isOpenMultiplePublish}
          onSubmit={() => {
            setIsOpenMultiplePublish(false);
            setIsOpen(false);
            setFiles([])
            setStep('videos')
            setPlaylistCoverImage(null)
            setPlaylistTitle('')
            setPlaylistDescription('')
            setSelectedCategory(null)
            setSelectedSubCategory(null)
            setSelectedCategoryVideos(null)
            setSelectedSubCategoryVideos(null)
            setPlaylistSetting(null)
            dispatch(
              setNotification({
                msg: "Videos published",
                alertType: "success",
              })
            );
          }}
          publishes={publishes}
        />
      )}
    </>
  );
};