import { useMemo } from "react";
import { Card, CardContent, CardMedia, useTheme } from "@mui/material";
import { RootState } from "../../../state/store";
import { Product } from "../../../state/features/storeSlice";
import { useDispatch, useSelector } from "react-redux";
import { setProductToCart } from "../../../state/features/cartSlice";
import { QortalSVG } from "../../../assets/svgs/QortalSVG";
import {
  AddToCartButton,
  ProductDescription,
  ProductTitle,
  StyledCard,
  StyledCardContent
} from "./ProductCard-styles";
import { CartSVG } from "../../../assets/svgs/CartSVG";
import { useNavigate } from "react-router-dom";
import { setNotification } from "../../../state/features/notificationsSlice";

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

  const storeId = useSelector((state: RootState) => state.store.storeId);

  const storeOwner = useSelector((state: RootState) => state.store.storeOwner);

  const user = useSelector((state: RootState) => state.auth.user);

  const userName = useMemo(() => {
    if (!user?.name) return "";
    return user.name;
  }, [user]);

  const profileImg = product?.images?.[0];

  const goToProductPage = () => {
    if (!product || !product?.id || !product?.catalogueId || !storeId) {
      dispatch(
        setNotification({
          alertType: "error",
          msg: "Unable to load product! Please try again!"
        })
      );
      return;
    }
    navigate(
      `/${product?.user}/${storeId}/${product?.id}/${product.catalogueId}`
    );
  };

  const price = product?.price?.find(
    (item) => item?.currency === "qort"
  )?.value;

  return (
    <StyledCard>
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
      <StyledCardContent onClick={goToProductPage}>
        <ProductTitle>{addEllipsis(product?.title || "", 39)}</ProductTitle>
        <ProductDescription>
          {addEllipsis(product?.description || "", 58)}
        </ProductDescription>
        <ProductDescription style={{ marginTop: "auto", fontWeight: "bold" }}>
          <QortalSVG
            color={theme.palette.text.primary}
            height={"22"}
            width={"22"}
          />{" "}
          {price}
        </ProductDescription>
      </StyledCardContent>
      <div style={{ height: "37px" }}>
        {storeOwner !== userName && (
          <AddToCartButton
            style={{
              cursor: product.status === "AVAILABLE" ? "pointer" : "not-allowed"
            }}
            color="primary"
            onClick={() => {
              if (product.status !== "AVAILABLE") {
                dispatch(
                  setNotification({
                    alertType: "error",
                    msg: "Product is not available!"
                  })
                );
                return;
              }
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
            {product.status === "AVAILABLE" ? (
              <>
                <CartSVG
                  color={theme.palette.text.primary}
                  height={"18"}
                  width={"18"}
                />{" "}
                Add to Cart
              </>
            ) : product.status === "OUT_OF_STOCK" ? (
              "Out of Stock"
            ) : (
              "Retired"
            )}
          </AddToCartButton>
        )}
      </div>
    </StyledCard>
  );
};
