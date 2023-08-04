import { useState } from "react";
import { Rating } from "@mui/material";
import {
  ReviewContainer,
  ReviewDescriptionFont,
  ReviewHeader,
  ReviewTitleFont,
  ReviewTitleRow,
  ReviewUsernameFont
} from "./StoreReviews-styles";

export const StoreReviewCard = () => {
  const [showCompleteReview, setShowCompleteReview] = useState<boolean>(false);

  const limitCharFunc = (str: string, limit = 150) => {
    return str.length > limit ? `${str.slice(0, limit)}...` : str;
  };

  const exampleDescription =
    "Sed ut perspiciatis unde omnis iste natus error sitvoluptatem accusantium doloremque laudantium, totam remaperiam, eaque ipsa quae ab illo inventore veritatis et quasiarchitecto beatae vitae dicta sunt explicabo. Nemo enim ipsamvoluptatem quia voluptas sit aspernatur aut odit aut fugit,sed quia consequuntur magni dolores eos qui ratione voluptatemsequi nesciunt. Neque porro quisquam est, qui dolorem ipsumquia dolor sit amet, consectetur, adipisci velit, sed quia nonnumquam eius modi tempora incidunt ut labore et dolore magnamaliquam quaerat voluptatem. Ut enim ad minima veniam, quisnostrum exercitationem ullam corporis suscipit laboriosam,nisi ut aliquid ex ea commodi consequatur? Quis autem vel eumiure reprehenderit qui in ea voluptate velit esse quam nihilmolestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?";

  return (
    <ReviewContainer
      style={{ cursor: showCompleteReview ? "auto" : "pointer" }}
      onClick={() => {
        setShowCompleteReview(true);
      }}
    >
      <ReviewHeader>
        <ReviewUsernameFont>Username goes here</ReviewUsernameFont>
        <ReviewTitleRow>
          <ReviewTitleFont>
            This is an example title for a review!
          </ReviewTitleFont>
          <Rating precision={0.5} value={2} readOnly />
        </ReviewTitleRow>
      </ReviewHeader>
      <ReviewDescriptionFont>
        {showCompleteReview
          ? exampleDescription
          : limitCharFunc(exampleDescription)}
      </ReviewDescriptionFont>
    </ReviewContainer>
  );
};
