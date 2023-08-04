import { FC, useState, useEffect } from "react";
import { Grid, Rating, useTheme } from "@mui/material";
import {
  CardDetailsContainer,
  CloseButton,
  CloseButtonRow,
  Divider,
  HeaderRow,
  StoreLogo,
  StoreTitle
} from "../StoreDetails/StoreDetails-styles";
import { StoreTitleCol } from "../Store/Store-styles";
import { StarSVG } from "../../../assets/svgs/StarSVG";
import {
  AddReviewButton,
  AverageReviewContainer,
  AverageReviewNumber,
  ReviewsFont,
  StoreReviewsContainer,
  TotalReviewsFont
} from "./StoreReviews-styles";
import { StoreReviewCard } from "./StoreReviewCard";
import { ReusableModal } from "../../../components/modals/ReusableModal";
import { AddReview } from "./AddReview/AddReview";
import { useDispatch } from "react-redux";
import { setIsLoadingGlobal } from "../../../state/features/globalSlice";

interface StoreReviewsProps {
  storeId: string;
  storeTitle: string;
  storeImage: string;
  setOpenStoreReviews: (open: boolean) => void;
}

interface StoreReview {
  title: string;
  description: string;
  created: number;
  rating: number;
}

export const StoreReviews: FC<StoreReviewsProps> = ({
  storeId,
  storeTitle,
  storeImage,
  setOpenStoreReviews
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [openLeaveReview, setOpenLeaveReview] = useState<boolean>(false);
  const [storeReviews, setStoreReviews] = useState<StoreReview[]>([]);

  // Fetch all the store reviews from QDN

  const getStoreReviews = async () => {
    if (!storeId) return;
    try {
      dispatch(setIsLoadingGlobal(true));
      const offset = storeReviews.length;
      const parts = storeId.split("q-store-general-");
      const shortStoreId = parts[1];
      const query = `q-store-review-${shortStoreId}`;
      const url = `/arbitrary/resources/search?service=DOCUMENT&query=${query}&limit=10&includemetadata=true&offset=${offset}&reverse=true`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const responseData = await response.json();
      console.log(responseData);
      setStoreReviews(responseData);
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setIsLoadingGlobal(false));
    }
  };

  useEffect(() => {
    if (storeId) {
      getStoreReviews();
    }
  }, [storeId]);
  return (
    <>
      <HeaderRow>
        <StoreLogo src={storeImage} alt={`${storeTitle}-logo`} />
        <StoreTitleCol>
          <StoreTitle>{storeTitle}</StoreTitle>
          <AddReviewButton onClick={() => setOpenLeaveReview(true)}>
            <StarSVG
              color={theme.palette.mode === "dark" ? "#000000" : "#ffffff"}
              height={"22"}
              width={"22"}
            />{" "}
            Add Review
          </AddReviewButton>
        </StoreTitleCol>
      </HeaderRow>
      <Divider />
      <CardDetailsContainer>
        <Grid container direction={"row"} flexWrap={"nowrap"}>
          <Grid item xs={12} sm={2} justifyContent={"center"}>
            <AverageReviewContainer>
              <ReviewsFont>Reviews</ReviewsFont>
              <AverageReviewNumber>3.5</AverageReviewNumber>
              <Rating
                style={{ marginBottom: "8px" }}
                precision={0.5}
                value={3.5}
                readOnly
              />
              <TotalReviewsFont>27 reviews</TotalReviewsFont>
            </AverageReviewContainer>
          </Grid>
          <Grid item xs={12} sm={10}>
            <StoreReviewsContainer>
              <StoreReviewCard />
              <StoreReviewCard />
              <StoreReviewCard />
            </StoreReviewsContainer>
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
      <ReusableModal
        customStyles={{
          width: "96%",
          maxWidth: 700,
          height: "70%",
          backgroundColor:
            theme.palette.mode === "light" ? "#e8e8e8" : "#32333c",
          position: "relative",
          padding: "25px 40px",
          borderRadius: "5px",
          outline: "none"
        }}
        open={openLeaveReview}
      >
        <AddReview
          storeId={storeId}
          storeTitle={storeTitle}
          setOpenLeaveReview={setOpenLeaveReview}
        />
      </ReusableModal>
    </>
  );
};
