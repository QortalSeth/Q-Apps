import { FC, useEffect, useState } from "react";
import {
  ExpandDescriptionIcon,
  OpenStoreCard,
  StoreCardDescription,
  StoreCardImage,
  StoreCardImageContainer,
  StoreCardInfo,
  StoreCardOwner,
  StoreCardTitle,
  StoresRow,
  StyledStoreCard,
  StyledTooltip,
  YouOwnIcon
} from "../../StoreList/StoreList-styles";
import ContextMenuResource from "../../../components/common/ContextMenu/ContextMenuResource";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";
import { BriefcaseSVG } from "../../../assets/svgs/BriefcaseSVG";

interface StoreCardProps {
  storeTitle: string;
  storeLogo: string;
  storeDescription: string;
  storeId: string;
  storeOwner: string;
  userName: string;
}

export const StoreCard: FC<StoreCardProps> = ({
  storeTitle,
  storeLogo,
  storeDescription,
  storeId,
  storeOwner,
  userName
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [isEllipsisActive, setIsEllipsisActive] = useState<boolean>(false);
  const [showCompleteStoreDescription, setShowCompleteStoreDescription] =
    useState<boolean>(false);

  const handleStoreCardClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if ((e.target as HTMLElement)?.id === `expand-icon-${storeId}`) {
      return;
    }
    // Setting storeOwner and storeId into the url params which can then be used in the Store component
    navigate(`/${storeOwner}/${storeId}`);
  };

  const limitCharFunc = (str: string, limit = 50) => {
    return str.length > limit ? `${str.slice(0, limit)}...` : str;
  };

  useEffect(() => {
    if (storeDescription.length >= 50) {
      setIsEllipsisActive(true);
    }
  }, [storeDescription]);

  return (
    <StoresRow item xs={12} sm={6} md={6} lg={3} key={storeId}>
      <ContextMenuResource
        name={storeOwner}
        service="STORE"
        identifier={storeId}
        link={`qortal://APP/Q-Store/${storeOwner}/${storeId}`}
      >
        <StyledStoreCard
          container
          onClick={handleStoreCardClick}
          showCompleteStoreDescription={
            showCompleteStoreDescription ? true : false
          }
        >
          <StoreCardImageContainer>
            <StoreCardImage src={storeLogo} alt={storeTitle} />
            <OpenStoreCard>Open</OpenStoreCard>
          </StoreCardImageContainer>
          <StoreCardInfo item>
            <StoreCardTitle>{storeTitle}</StoreCardTitle>
            <StoreCardDescription>
              {showCompleteStoreDescription
                ? storeDescription
                : limitCharFunc(storeDescription)}
            </StoreCardDescription>
            {isEllipsisActive && (
              <ExpandDescriptionIcon
                id={`expand-icon-${storeId}`}
                width={"20"}
                height={"20"}
                color={theme.palette.text.primary}
                onClickFunc={(e: React.MouseEvent<any>) => {
                  e.stopPropagation();
                  setShowCompleteStoreDescription((prevState) => !prevState);
                }}
                showCompleteStoreDescription={
                  showCompleteStoreDescription ? true : false
                }
              />
            )}
          </StoreCardInfo>
          <StoreCardOwner>{storeOwner}</StoreCardOwner>
          {storeOwner === userName && (
            <StyledTooltip placement="top" title="You own this store">
              <YouOwnIcon>
                <BriefcaseSVG
                  color={theme.palette.secondary.main}
                  width={"23"}
                  height={"23"}
                />
              </YouOwnIcon>
            </StyledTooltip>
          )}
        </StyledStoreCard>
      </ContextMenuResource>
    </StoresRow>
  );
};
