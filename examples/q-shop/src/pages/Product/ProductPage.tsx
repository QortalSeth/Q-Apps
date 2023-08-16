import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Cart as CartInterface,
  setIsOpen,
  setProductToCart
} from "../../state/features/cartSlice";
import { RootState } from "../../state/store";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  IconButton,
  InputAdornment,
  TextField,
  useTheme
} from "@mui/material";

import TabImageList from "../../components/common/TabImageList/TabImageList";
import { Product } from "../../state/features/storeSlice";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DangerousIcon from "@mui/icons-material/Dangerous";
import { CartIcon } from "../../components/layout/Navbar/Navbar-styles";
import {
  CartIconContainer,
  NotificationBadge
} from "../Store/Store/Store-styles";
import { useFetchOrders } from "../../hooks/useFetchOrders";
import {
  AddToCartButton,
  BackToStoreButton,
  CartBox,
  ProductDescription,
  ProductDetailsContainer,
  ProductLayout,
  ProductNotFound,
  ProductPrice,
  ProductTitle,
  UnavailableButton
} from "./ProductPage-styles";
import { QortalSVG } from "../../assets/svgs/QortalSVG";
import { setNotification } from "../../state/features/notificationsSlice";
import { BackArrowSVG } from "../../assets/svgs/BackArrowSVG";

export const ProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const theme = useTheme();

  // Get params for when user refreshes page or receives url link
  const storeOwner: string = params.user || "";
  const productID: string = params.product || "";
  const catalogueID: string = params.catalogue || "";
  const storeId: string = params.store || "";

  const [product, setProduct] = useState<Product | null>(null);
  const [cartAddCount, setCartAddCount] = useState<string>("1");
  const [totalCartQuantity, setTotalCartQuantity] = useState<number>(0);

  const catalogueHashMap = useSelector(
    (state: RootState) => state.global.catalogueHashMap
  );
  const carts = useSelector((state: RootState) => state.cart.carts);
  const user = useSelector((state: RootState) => state.auth.user);

  const { checkAndUpdateResourceCatalogue, getCatalogue } = useFetchOrders();

  // Set cart notifications when cart changes
  useEffect(() => {
    if (user?.name && storeId) {
      const shopCart: CartInterface = carts[storeId];
      // Get the orders of this cart
      const orders = shopCart?.orders || {};
      let totalQuantity = 0;
      Object.keys(orders).forEach((key) => {
        const order = orders[key];
        const { quantity } = order;
        totalQuantity += quantity;
      });
      setTotalCartQuantity(totalQuantity);
    }
  }, [carts, user, storeId]);

  const getProductData = async () => {
    const productInRedux = catalogueHashMap[catalogueID]?.products[productID];
    const paramsLoaded = productID && catalogueID && storeOwner && storeId;
    if (productInRedux) {
      setProduct(productInRedux);
      return;
    } else if (!productInRedux && paramsLoaded) {
      checkAndUpdateResourceCatalogue({ id: catalogueID });
      await getCatalogue(storeOwner, catalogueID);
    } else {
      return null;
    }
  };

  useEffect(() => {
    const awaitProductData = async () => {
      await getProductData();
    };
    awaitProductData();
  }, [catalogueHashMap]);

  const price = product?.price?.find(
    (item) => item?.currency === "qort"
  )?.value;

  const addToCart = () => {
    if (user?.name === storeOwner) {
      dispatch(
        setNotification({
          alertType: "error",
          msg: "You own this store! You cannot add your own products to your cart!"
        })
      );
      return;
    }
    if (product) {
      for (let i = 0; i < Number(cartAddCount); i++) {
        dispatch(
          setProductToCart({
            productId: product.id,
            catalogueId: product.catalogueId,
            storeId,
            storeOwner
          })
        );
      }
    }
  };

  const setMinMaxValueDec = (
    value: string,
    minValue: number,
    maxValue: number
  ): string => {
    let valueNum = Number(`${value}`);

    // Bounds checking on valueNum
    valueNum = Math.min(valueNum, maxValue);
    valueNum = Math.max(valueNum, minValue);

    return valueNum.toString();
  };

  const numFilter = (
    value: string,
    minValue: number,
    maxValue: number,
    emptyReturn = ""
  ) => {
    if (value === "-1") {
      return emptyReturn;
    }
    const isPositiveNum = /^[0-9]+$/.test(value);
    const isNotNum = /[^0-9]/;

    if (isPositiveNum) {
      const minMaxCheck = setMinMaxValueDec(value, minValue, maxValue);
      return minMaxCheck;
    }

    return value.replace(isNotNum, "");
  };

  const minCart = 1;
  const maxCart = 10;
  const changeValue = (value: string, change: number) => {
    if (!value) value = "1";
    const valueNum = Number(value);
    setCartAddCount(
      numFilter((valueNum + change).toString(), minCart, maxCart)
    );
  };

  const status = product?.status;
  const available = status === "AVAILABLE";
  const availableJSX = (
    <>
      <TextField
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={(e) => changeValue(cartAddCount, 1)}>
                <AddIcon />{" "}
              </IconButton>
              <IconButton onClick={(e) => changeValue(cartAddCount, -1)}>
                <RemoveIcon />{" "}
              </IconButton>
            </InputAdornment>
          )
        }}
        value={cartAddCount}
        onChange={(e) => {
          setCartAddCount(
            numFilter(e.currentTarget.value || "-1", minCart, maxCart)
          );
        }}
        autoComplete="off"
        label="Quantity"
        style={{ width: "34vw" }}
      ></TextField>
      <AddToCartButton variant={"contained"} onClick={addToCart}>
        <CartIcon color={"#ffffff"} height={"25"} width={"25"} />
        <span style={{ marginLeft: "5px" }}>Add to Cart</span>
      </AddToCartButton>
    </>
  );

  const unavailableJSX = (
    <UnavailableButton
      variant={"contained"}
      onClick={() => {
        if (user?.name === storeOwner) {
          dispatch(
            setNotification({
              alertType: "error",
              msg: "You own this store! You cannot add your own products to your cart!"
            })
          );
          return;
        }
        dispatch(
          setNotification({
            alertType: "error",
            msg: "This product is out of stock!"
          })
        );
      }}
    >
      <DangerousIcon height={"25"} width={"25"} />
      Out of Stock
    </UnavailableButton>
  );

  return product ? (
    <ProductLayout>
      <BackToStoreButton
        onClick={() => {
          navigate(`/${storeOwner}/${storeId}`);
        }}
      >
        <BackArrowSVG height={"20"} width={"20"} color={"#ffffff"} />
        Store
      </BackToStoreButton>
      <TabImageList images={product.images} />
      <ProductDetailsContainer>
        <ProductTitle variant="h2">{product.title}</ProductTitle>
        <ProductDescription variant="h3">
          {product.description}
        </ProductDescription>
        <ProductPrice variant="h4">
          <QortalSVG
            height={"22"}
            width={"22"}
            color={theme.palette.text.primary}
          />{" "}
          {price}
        </ProductPrice>
        {available ? availableJSX : unavailableJSX}
      </ProductDetailsContainer>
      {user?.name && user?.name !== storeOwner ? (
        <CartBox>
          <CartIconContainer fixedCartPosition={false}>
            <CartIcon
              color={theme.palette.text.primary}
              height={"32"}
              width={"32"}
              onClickFunc={() => {
                dispatch(setIsOpen(true));
              }}
            />
            {totalCartQuantity > 0 && (
              <NotificationBadge fixedCartPosition={false}>
                {totalCartQuantity}
              </NotificationBadge>
            )}
          </CartIconContainer>
        </CartBox>
      ) : null}
    </ProductLayout>
  ) : (
    <ProductNotFound>Product ID ${productID} Not Found</ProductNotFound>
  );
};
