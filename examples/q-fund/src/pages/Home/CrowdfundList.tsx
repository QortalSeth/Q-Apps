import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { Avatar, Box, useTheme } from '@mui/material';
import { useFetchCrowdfunds } from '../../hooks/useFetchCrowdfunds';
import LazyLoad from '../../components/common/LazyLoad';

import ResponsiveImage from '../../components/ResponsiveImage';
import { formatDate } from '../../utils/time';
import {
  BottomWrapper,
  CrowdfundContainer,
  ChannelCard,
  Subtitle,
  SubtitleContainer,
} from './Home-styles';

import {
  CrowdfundCardTitle,
  NameContainer,
  CrowdfundCardName,
  CrowdfundUploadDate,
} from '../../components/Crowdfund/Crowdfund-styles';

export const CrowdfundList = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const firstFetch = useRef(false);
  const afterFetch = useRef(false);
  const isFetching = useRef(false);
  const hashMapCrowdfunds = useSelector(
    (state: RootState) => state.crowdfund.hashMapCrowdfunds
  );

  const userAvatarHash = useSelector(
    (state: RootState) => state.global.userAvatarHash
  );

  const globalCrowdfunds = useSelector(
    (state: RootState) => state.crowdfund.crowdfunds
  );
  const navigate = useNavigate();
  const { getCrowdfunds } = useFetchCrowdfunds();

  const getCrowdfundsHandler = React.useCallback(async () => {
    if (!firstFetch.current || !afterFetch.current) return;
    if (isFetching.current) return;
    isFetching.current = true;
    await getCrowdfunds();
    isFetching.current = false;
  }, [getCrowdfunds]);

  const getCrowdfundHandlerMount = React.useCallback(async () => {
    if (firstFetch.current) return;
    firstFetch.current = true;
    setIsLoading(true);

    await getCrowdfunds();
    afterFetch.current = true;
    setIsLoading(false);
  }, [getCrowdfunds]);

  let crowdfunds = globalCrowdfunds;

  useEffect(() => {
    if (!firstFetch.current && globalCrowdfunds.length === 0) {
      isFetching.current = true;
      getCrowdfundHandlerMount();
    } else {
      firstFetch.current = true;
      afterFetch.current = true;
    }
  }, [getCrowdfundHandlerMount, globalCrowdfunds]);

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '0px',
      }}
    >
      <CrowdfundContainer>
        {crowdfunds.map((crowdfund: any, index: number) => {
          const existingCrowdfund = hashMapCrowdfunds[crowdfund.id];
          let hasHash = false;
          let crowdfundObj = crowdfund;
          if (existingCrowdfund) {
            crowdfundObj = existingCrowdfund;
            hasHash = true;
          }

          let avatarUrl = '';
          if (userAvatarHash[crowdfundObj?.user]) {
            avatarUrl = userAvatarHash[crowdfundObj?.user];
          }

          return (
            <ChannelCard
              onClick={() => {
                navigate(`/crowdfund/${crowdfundObj.user}/${crowdfundObj.id}`);
              }}
            >
              <CrowdfundCardTitle>{crowdfundObj?.title}</CrowdfundCardTitle>
              {crowdfundObj?.coverImage && (
                <ResponsiveImage
                  src={crowdfundObj?.coverImage}
                  width={266}
                  height={150}
                  styles={{
                    maxHeight: 'calc(40vh)',
                    objectFit: 'contain',
                  }}
                />
              )}

              <BottomWrapper>
                <NameContainer>
                  <Avatar
                    sx={{ height: 24, width: 24 }}
                    src={avatarUrl}
                    alt={`${crowdfundObj.user}'s avatar`}
                  />
                  <CrowdfundCardName>{crowdfundObj.user}</CrowdfundCardName>
                </NameContainer>
                {crowdfundObj?.created && (
                  <CrowdfundUploadDate>
                    {formatDate(crowdfundObj.created)}
                  </CrowdfundUploadDate>
                )}
              </BottomWrapper>
            </ChannelCard>
          );
        })}
      </CrowdfundContainer>

      <LazyLoad
        onLoadMore={getCrowdfundsHandler}
        isLoading={isLoading}
      ></LazyLoad>
    </Box>
  );
};
