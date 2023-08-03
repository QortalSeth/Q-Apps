import { FC } from "react";
import { Grid, Rating, useTheme } from "@mui/material";
import {
  CardDetailsContainer,
  CloseButton,
  CloseButtonRow,
  Divider,
  HeaderRow
} from "../StoreDetails/StoreDetails-styles";
import { StoreLogo, StoreTitle, StoreTitleCol } from "../Store/Store-styles";
import { StarSVG } from "../../../assets/svgs/StarSVG";
import {
  AddReviewButton,
  AverageReviewContainer,
  ReviewsFont,
  TotalReviewsFont
} from "./StoreReviews-styles";

interface StoreReviewsProps {
  storeTitle: string;
  storeImage: string;
  setOpenStoreReviews: (open: boolean) => void;
}

export const StoreReviews: FC<StoreReviewsProps> = ({
  storeTitle,
  storeImage,
  setOpenStoreReviews
}) => {
  const theme = useTheme();
  return (
    <>
      <HeaderRow>
        <StoreLogo src={storeImage} alt={`${storeTitle}-logo`} />
        <StoreTitleCol>
          <StoreTitle>{storeTitle}</StoreTitle>
          <AddReviewButton>
            <StarSVG
              color={theme.palette.text.primary}
              height={"22"}
              width={"22"}
            />{" "}
            Add Review
          </AddReviewButton>
        </StoreTitleCol>
      </HeaderRow>
      <Divider />
      <CardDetailsContainer>
        <Grid container direction={"column"} columnGap={3}>
          <Grid item xs={12} sm={3}>
            <AverageReviewContainer>
              <ReviewsFont>Reviews</ReviewsFont>
              <Rating precision={0.5} value={3.5} readOnly />
              <TotalReviewsFont>27 reviews</TotalReviewsFont>
            </AverageReviewContainer>
          </Grid>
          <Grid item xs={12} sm={9}>
            <CardDetailsContainer
              style={{ gap: "10px" }}
            ></CardDetailsContainer>
          </Grid>
        </Grid>
        <CloseButtonRow>
          <CloseButton
            variant="outlined"
            color="error"
            onClick={() => {
              setOpenStoreReviews(false);
            }}
          >
            Close
          </CloseButton>
        </CloseButtonRow>
      </CardDetailsContainer>
    </>
  );
};
