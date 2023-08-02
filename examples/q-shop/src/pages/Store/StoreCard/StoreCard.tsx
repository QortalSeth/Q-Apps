import { FC, useEffect, useRef, useState } from "react";
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
import { StarSVG } from "../../../assets/svgs/StarSVG";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";

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

  const limitCharFunc = (str: string, limit = 27) => {
    return str.length > limit ? `${str.slice(0, limit)}...` : str;
  };

  useEffect(() => {
    if (storeDescription.length >= 27) {
      setIsEllipsisActive(true);
    }
  }, [storeDescription]);

  return (
    <StoresRow item xs={12} sm={3} key={storeId}>
      <ContextMenuResource
        name={storeOwner}
        service="STORE"
        identifier={storeId}
        link={`qortal://APP/Q-Store/${storeOwner}/${storeId}`}
      >
        <StyledStoreCard
          container
          onClick={() => navigate(`/${storeOwner}/${storeId}`)}
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
                <StarSVG color={"#fbff2a"} width={"23"} height={"23"} />
              </YouOwnIcon>
            </StyledTooltip>
          )}
        </StyledStoreCard>
      </ContextMenuResource>
    </StoresRow>
  );
};
