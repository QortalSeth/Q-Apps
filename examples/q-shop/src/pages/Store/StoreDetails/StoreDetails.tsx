import { FC } from "react";
import moment from "moment";
import EmailIcon from "@mui/icons-material/Email";
import {
  CardRow,
  CloseButton,
  CloseButtonRow,
  Divider,
  EmailUser,
  StoreLogo,
  IconsRow,
  HeaderRow,
  CardDetailsContainer,
  StoreTitle
} from "./StoreDetails-styles";
import { OwnerSVG } from "../../../assets/svgs/OwnerSVG";
import { useTheme } from "@mui/material";
import { CalendarSVG } from "../../../assets/svgs/CalendarSVG";

interface StoreDetailsProps {
  storeTitle: string;
  storeImage: string;
  storeOwner: string;
  dateCreated: number;
  setOpenStoreDetails: (open: boolean) => void;
}

export const StoreDetails: FC<StoreDetailsProps> = ({
  storeTitle,
  storeImage,
  storeOwner,
  dateCreated,
  setOpenStoreDetails
}) => {
  const theme = useTheme();
  return (
    <>
      <HeaderRow>
        <StoreLogo src={storeImage} alt={`${storeTitle}-logo`} />
        <StoreTitle>{storeTitle}</StoreTitle>
      </HeaderRow>
      <Divider />
      <CardDetailsContainer>
        <CardDetailsContainer style={{ gap: "10px" }}>
          <CardRow>
            <IconsRow>
              <OwnerSVG
                width={"22"}
                height={"22"}
                color={theme.palette.text.primary}
              />
              Store Owner
            </IconsRow>
            {storeOwner}
          </CardRow>
          <CardRow>
            <IconsRow>
              <CalendarSVG
                width={"22"}
                height={"22"}
                color={theme.palette.text.primary}
              />
              Date Created
            </IconsRow>
            {moment(dateCreated).format("llll")}
          </CardRow>
          <CardRow>
            <IconsRow>
              <EmailIcon
                sx={{
                  color: theme.palette.text.primary,
                  width: "22px",
                  height: "22px"
                }}
              />
              Email
            </IconsRow>
            <EmailUser
              href={`qortal://APP/Q-Mail/to/${storeOwner}`}
              className="qortal-link"
            >
              Message {storeOwner} on Q-Mail
            </EmailUser>
          </CardRow>
        </CardDetailsContainer>
        <CloseButtonRow>
          <CloseButton
            variant="outlined"
            color="error"
            onClick={() => {
              setOpenStoreDetails(false);
            }}
          >
            Close
          </CloseButton>
        </CloseButtonRow>
      </CardDetailsContainer>
    </>
  );
};
