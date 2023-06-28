import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  useTheme
} from "@mui/material";
import { Product } from "../../state/features/storeSlice";
import { useDispatch } from "react-redux";
import { setProductToCart } from "../../state/features/cartSlice";
import { QortalSVG } from "../../assets/svgs/QortalSVG";

// export interface IProduct {
//   id: string
//   title: string
//   price: number
//   image?: string
//   images?: any[]
//   description: string
// }

function addEllipsis(str: string, limit: number) {
  if (str.length > limit) {
    return str.substring(0, limit - 3) + "...";
  } else {
    return str;
  }
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const profileImg = product?.images?.[0];
  const price = product?.price?.find(
    (item) => item?.currency === "qort"
  )?.value;
  return (
    <Card
      sx={{
        width: "225px"
      }}
      onClick={() => {
        dispatch(
          setProductToCart({
            id: product.id,
            catalogueId: product.catalogueId
          })
        );
      }}
    >
      <CardMedia
        sx={{
          "&.MuiCardMedia-root": {
            padding: "10px",
            borderRadius: "12px"
          }
        }}
        component="img"
        height="140"
        image={profileImg}
        alt={product?.title}
      />
      <CardContent
        sx={{
          height: "130px",
          overflow: "hidden",
          padding: "8px 16px"
        }}
      >
        <Typography
          gutterBottom
          component="div"
          sx={{
            wordBreak: "break-word",
            maxHeight: "43px",
            fontSize: "16px"
          }}
        >
          {addEllipsis(product?.title || "", 39)}
        </Typography>
        <Typography
          sx={{
            fontSize: "16px",
            wordBreak: "break-word",
            maxHeight: "65px"
          }}
          color="text.secondary"
        >
          {addEllipsis(product?.description || "", 58)}
        </Typography>
        <Typography variant="body1" color="text.primary">
          <QortalSVG
            color={theme.palette.text.primary}
            height={"22"}
            width={"22"}
          />{" "}
          {price}
        </Typography>
      </CardContent>
      <Button color="primary">Add to Cart</Button>
    </Card>
  );
};
