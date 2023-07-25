import { useMemo } from "react";
import { Card, CardContent, CardMedia, useTheme } from "@mui/material";
import { RootState } from "../../state/store";
import { Product } from "../../state/features/storeSlice";
import { useDispatch, useSelector } from "react-redux";
import { setProductToCart } from "../../state/features/cartSlice";
import { QortalSVG } from "../../assets/svgs/QortalSVG";
import {
  AddToCartButton,
  ProductDescription,
  ProductTitle
} from "./ProductCard-styles";
import { CartSVG } from "../../assets/svgs/CartSVG";
import {useNavigate} from "react-router-dom";

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
    const navigate = useNavigate();
  const theme = useTheme();

  const { storeId, storeOwner } = useSelector(
    (state: RootState) => state.store
  );

  const { user } = useSelector((state: RootState) => state.auth);

  const userName = useMemo(() => {
    if (!user?.name) return "";
    return user.name;
  }, [user]);

  const profileImg = product?.images?.[0];
const goToProductPage = () => {navigate(`/${userName}/${storeId}/${product?.id}/${product.catalogueId}`)}

  const price = product?.price?.find(
    (item) => item?.currency === "qort"
  )?.value;
  return (
    <Card>
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
        onClick={goToProductPage}
      />
      <CardContent
        sx={{
          height: "130px",
          overflow: "hidden",
          padding: "8px 16px"
        }}
        onClick={goToProductPage}
      >
        <ProductTitle>{addEllipsis(product?.title || "", 39)}</ProductTitle>
        <ProductDescription>
          {addEllipsis(product?.description || "", 58)}
        </ProductDescription>
        <ProductDescription style={{ fontWeight: "bold" }}>
          <QortalSVG
            color={theme.palette.text.primary}
            height={"22"}
            width={"22"}
          />{" "}
          {price}
        </ProductDescription>
      </CardContent>
      {storeOwner !== userName && (
        <AddToCartButton
          color="primary"
          onClick={() => {
            dispatch(
                setProductToCart({
                  productId: product.id,
                  catalogueId: product.catalogueId,
                  storeId,
                  storeOwner
                })
            );
          }}
        >
          <CartSVG
            color={theme.palette.text.primary}
            height={"15"}
            width={"15"}
          />{" "}
          Add to Cart
        </AddToCartButton>
      )}
    </Card>
  );
};
