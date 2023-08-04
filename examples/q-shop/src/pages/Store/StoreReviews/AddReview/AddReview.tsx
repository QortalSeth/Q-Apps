import { FC, useState } from "react";
import {
  AddReviewContainer,
  AddReviewDescription,
  AddReviewHeader
} from "./AddReview-styles";
import { Rating } from "@mui/material";
import {
  CreateButton,
  CustomInputField
} from "../../../../components/modals/CreateStoreModal-styles";
import {
  CloseButton,
  CloseButtonRow,
  Divider,
  StoreTitle
} from "../../StoreDetails/StoreDetails-styles";
import { useDispatch, useSelector } from "react-redux";
import { RootState, store } from "../../../../state/store";
import ShortUniqueId from "short-unique-id";
import { setNotification } from "../../../../state/features/notificationsSlice";
import { objectToBase64 } from "../../../../utils/toBase64";

/* Reviews notes
  Fetch 10 reviews of the store use fetch() API call
  Add them all up and divide by # of reviews to get the average rating
  In the resource of the review, we should put the rating inside the tag of the review.
  Preview of the rating in the title metadata (which is part of the metadata of the resource) 60 chars
  Preview of the review message in the description metadata (which is part of the metadata of the resource) 150 chars
  Put the review number inside the raw data (complete resource data using resource's location) JSON as well
  Use service DOCUMENT
  And then when they click on the actual, review, it will show the full review message and the rating by fetching the raw data
  When fetching the full list of reviews, don't use mode=ALL, use mode=LATEST
  Filter reviews by query by minlevel 1 and above
  Make sure user has at least one store order before beign able to leave a review
  const url = `/arbitrary/resources/search?service=DOCUMENT&query=${query}&limit=20&name=${name}&includemetadata=true&offset=${offset}&reverse=true`;
*/

interface AddReviewProps {
  storeId: string;
  storeTitle: string;
  setOpenLeaveReview: (open: boolean) => void;
}

const uid = new ShortUniqueId({ length: 10 });

export const AddReview: FC<AddReviewProps> = ({
  storeId,
  storeTitle,
  setOpenLeaveReview
}) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [rating, setRating] = useState<number | null>(null);
  const [reviewTitle, setReviewTitle] = useState<string>("");
  const [reviewDescription, setReviewDescription] = useState<string>("");

  // Verify if review identifier already exists

  const verifyIfReviewIdExists = async (
    username: string,
    identifier: string
  ) => {
    try {
      const response = await qortalRequest({
        action: "LIST_QDN_RESOURCES",
        service: "DOCUMENT",
        name: username,
        identifier: identifier,
        includeMetadata: true,
        limit: 1
      });
      if (response?.resources?.length > 0) {
        return true;
      }
      return false;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  // Add review to QDN
  const addReviewFunc = async () => {
    let address: string = "";
    let name: string = "";
    let errorMsg = "";

    address = user?.address || "";
    name = user?.name || "";

    // Validation
    if (!address) {
      errorMsg = "Cannot send: your address isn't available";
    }

    if (!name) {
      errorMsg = "Cannot send a message without a access to your name";
    }

    if (!storeId) {
      errorMsg = "Cannot add a review without having a store ID";
    }

    if (!rating || !reviewTitle || !reviewDescription) {
      errorMsg = "Cannot add a review without a rating, title, and description";
    }

    if (errorMsg) {
      dispatch(
        setNotification({
          msg: errorMsg,
          alertType: "error"
        })
      );
      throw new Error(errorMsg);
    }
    const parts = storeId.split("q-store-general-");
    const shortStoreId = parts[1];
    const uidGenerator = uid();
    // Create identifier for the review
    const reviewId = `q-store-review-${shortStoreId}-${uidGenerator}`;
    // Check if review identifier already exists
    const doesExist = await verifyIfReviewIdExists(name, reviewId);
    if (doesExist) {
      throw new Error(
        "The review identifier already exists! Try changing your review's title"
      );
    }
    // Resource raw data
    const reviewObj = {
      title: reviewTitle,
      description: reviewDescription,
      rating: rating,
      created: Date.now()
    };
    console.log({ reviewObj });
    const reviewToBase64 = await objectToBase64(reviewObj);
    try {
      // Publish Review to QDN
      const resourceResponse = await qortalRequest({
        action: "PUBLISH_QDN_RESOURCE",
        name: name,
        service: "DOCUMENT",
        identifier: reviewId,
        data64: reviewToBase64,
        filename: "review.json",
        // Resource metadata down here
        title: reviewTitle.slice(0, 60),
        description: reviewDescription.slice(0, 150),
        tag1: rating?.toString()
      });
      console.log({ resourceResponse });
    } catch (error: any) {
      let notificationObj: any = null;
      if (typeof error === "string") {
        notificationObj = {
          msg: error || "Failed to create review",
          alertType: "error"
        };
      } else if (typeof error?.error === "string") {
        notificationObj = {
          msg: error?.error || "Failed to create review",
          alertType: "error"
        };
      } else {
        notificationObj = {
          msg: error?.message || "Failed to create review",
          alertType: "error"
        };
      }
      if (!notificationObj) return;
      dispatch(setNotification(notificationObj));
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("An unknown error occurred");
      }
    }
  };

  return (
    <AddReviewContainer>
      <AddReviewHeader>
        <StoreTitle>{storeTitle}</StoreTitle>
      </AddReviewHeader>
      <Divider />
      <Rating
        onChange={(e: React.ChangeEvent<{}>, newValue: number | null) => {
          setRating(newValue);
        }}
        precision={0.5}
        value={rating}
        style={{ fontSize: "55px" }}
      />
      <CustomInputField
        name="title"
        label="Store Review Title"
        variant="filled"
        value={reviewTitle}
        onChange={(e) => setReviewTitle(e.target.value as string)}
        inputProps={{ maxLength: 180 }}
        required
        style={{ width: "100%" }}
      />
      <AddReviewDescription
        aria-label="review-description"
        minRows={3}
        placeholder="Write a store review..."
        value={reviewDescription}
        onChange={(e) => setReviewDescription(e.target.value as string)}
        required
      />
      <CloseButtonRow style={{ gap: "10px" }}>
        <CloseButton
          variant="outlined"
          color="error"
          onClick={() => {
            setOpenLeaveReview(false);
          }}
        >
          Close
        </CloseButton>
        <CreateButton variant="contained" onClick={addReviewFunc}>
          Add Review
        </CreateButton>
      </CloseButtonRow>
    </AddReviewContainer>
  );
};
