import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { Avatar, Box, Typography, useTheme } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import CircularProgress from '@mui/material/CircularProgress';

import { formatDate } from '../../utils/time';
import { DisplayHtml } from '../../components/common/DisplayHtml';
import FileElement from '../../components/common/FileElement';
import { setIsLoadingGlobal } from '../../state/features/globalSlice';
import { crowdfundBase } from '../../constants';
import { addToHashMap } from '../../state/features/crowdfundSlice';
import {
  AuthorTextComment,
  CrowdfundTitle,
  Spacer,
  StyledCardColComment,
  StyledCardHeaderComment,
} from '../../components/Crowdfund/Crowdfund-styles';
import AudioPlayer, { PlayerBox } from '../../components/common/AudioPlayer';
import { NewUpdate } from '../../components/Crowdfund/NewUpdate';

export const Update = ({ updateObj }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { name } = useParams();

  const userAvatarHash = useSelector(
    (state: RootState) => state.global.userAvatarHash
  );

  const avatarUrl = useMemo(() => {
    let url = '';
    if (name && userAvatarHash[name]) {
      url = userAvatarHash[name];
    }

    return url;
  }, [userAvatarHash, name]);
  const [crowdfundData, setCrowdfundData] = useState<any>(null);
  const username = useSelector((state: RootState) => state.auth?.user?.name);
  const hashMapCrowdfunds = useSelector(
    (state: RootState) => state.crowdfund.hashMapCrowdfunds
  );

  const editContent = useMemo(() => {
    if (!crowdfundData) return null;
    const content = {
      title: crowdfundData?.title,
      inlineContent: crowdfundData?.inlineContent,
      attachments: crowdfundData?.attachments,
      user: crowdfundData?.user,
    };
    return content;
  }, [crowdfundData]);

  const getCrowdfundData = React.useCallback(async updateObj => {
    try {
      let resourceData = updateObj;
      resourceData = {
        title: resourceData?.metadata?.title,
        category: resourceData?.metadata?.category,
        categoryName: resourceData?.metadata?.categoryName,
        tags: resourceData?.metadata?.tags || [],
        description: resourceData?.metadata?.description,
        created: resourceData?.created,
        updated: resourceData?.updated,
        user: resourceData.name,
        id: resourceData.identifier,
      };

      const responseData = await qortalRequest({
        action: 'FETCH_QDN_RESOURCE',
        name: updateObj.name,
        service: 'DOCUMENT',
        identifier: updateObj.identifier,
      });

      if (responseData && !responseData.error) {
        const combinedData = {
          ...resourceData,
          ...responseData,
        };

        setCrowdfundData(combinedData);
        dispatch(addToHashMap(combinedData));
      }
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setIsLoadingGlobal(false));
    }
  }, []);

  React.useEffect(() => {
    if (updateObj) {
      const existingCrowdfund = hashMapCrowdfunds[updateObj.identifier];

      if (existingCrowdfund) {
        setCrowdfundData(existingCrowdfund);
      } else {
        getCrowdfundData(updateObj);
      }
    }
  }, [updateObj]);

  if (!crowdfundData)
    return (
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  return (
    <>
      <NewUpdate
        editContent={editContent}
        editId={updateObj.identifier}
        onSubmit={content => {
          setCrowdfundData(content);
        }}
        crowdfundName={name || ''}
      />
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '30px',
            maxWidth: '1400px',
          }}
        >
          <CrowdfundTitle
            variant="h1"
            color="textPrimary"
            sx={{
              textAlign: 'center',
            }}
          >
            {crowdfundData?.title}
          </CrowdfundTitle>
          {crowdfundData?.created && (
            <Typography
              variant="h6"
              sx={{
                fontSize: '12px',
              }}
              color={theme.palette.text.primary}
            >
              {formatDate(crowdfundData.created)}
            </Typography>
          )}
          <Spacer height="15px" />
          <Box
            sx={{
              width: '95%',
            }}
          >
            <StyledCardHeaderComment
              sx={{
                '& .MuiCardHeader-content': {
                  overflow: 'hidden',
                },
              }}
            >
              <Box>
                <Avatar src={avatarUrl} alt={`${name}'s avatar`} />
              </Box>
              <StyledCardColComment>
                <AuthorTextComment
                  color={
                    theme.palette.mode === 'light'
                      ? theme.palette.text.secondary
                      : '#d6e8ff'
                  }
                >
                  {name}
                </AuthorTextComment>
              </StyledCardColComment>
            </StyledCardHeaderComment>
            <Spacer height="25px" />
            <DisplayHtml html={crowdfundData?.inlineContent} />
            <Spacer height="25px" />
            {crowdfundData?.attachments?.length > 0 && (
              <CrowdfundTitle
                variant="h1"
                color="textPrimary"
                sx={{
                  textAlign: 'center',
                  textDecoration: 'underline',
                }}
              >
                Attachments
              </CrowdfundTitle>
            )}

            <Spacer height="15px" />
          </Box>
          {crowdfundData?.attachments?.map(attachment => {
            if (attachment?.service === 'AUDIO')
              return (
                <>
                  <AudioPlayer
                    fullFile={attachment}
                    filename={attachment.filename}
                    name={attachment.name}
                    identifier={attachment.identifier}
                    service="AUDIO"
                    jsonId={crowdfundData?.id}
                    user={crowdfundData?.user}
                  />
                  <Spacer height="15px" />
                </>
              );

            return (
              <>
                <PlayerBox
                  sx={{
                    minHeight: '55px',
                  }}
                >
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', pl: 1, pr: 1 }}
                  >
                    <AttachFileIcon
                      sx={{
                        height: '16px',
                        width: 'auto',
                      }}
                    ></AttachFileIcon>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        wordBreak: 'break-word',
                        marginBottom: '5px',
                      }}
                    >
                      {attachment?.filename}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', pl: 1, pr: 1 }}
                  >
                    <FileElement
                      fileInfo={attachment}
                      title={attachment?.filename}
                      customStyles={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <DownloadIcon />
                    </FileElement>
                  </Box>
                </PlayerBox>

                <Spacer height="15px" />
              </>
            );
          })}
        </Box>
      </Box>
    </>
  );
};
