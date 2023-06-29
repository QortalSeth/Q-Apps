import { useState, useEffect, useMemo } from "react";
import { ReusableModal } from "../../components/modals/ReusableModal";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
  useTheme
} from "@mui/material";
import {
  addQuantityToCart,
  subtractQuantityFromCart,
  removeCartFromCarts,
  Order
} from "../../state/features/cartSlice";
import ShortUniqueId from "short-unique-id";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { setIsOpen } from "../../state/features/cartSlice";
import { objectToBase64 } from "../../utils/toBase64";
import { MAIL_SERVICE_TYPE } from "../../constants/mail";
import { Cart as CartInterface } from "../../state/features/cartSlice";
import {
  AddQuantityButton,
  CartContainer,
  IconsRow,
  OrderTotalRow,
  ProductContainer,
  ProductDetailsCol,
  ProductDetailsRow,
  ProductImage,
  ProductInfoCol,
  ProductPriceFont,
  ProductTitle,
  QuantityRow,
  RemoveQuantityButton,
  TotalSumContainer,
  TotalSumHeader,
  TotalSumItem,
  TotalSumItemTitle,
  TotalSumItems
} from "./Cart-styles";
import { GarbageSVG } from "../../assets/svgs/GarbageSVG";
import { TimesIcon } from "../ProductManager/ProductManager-styles";
import { BackToStorefrontButton as CheckoutButton } from "../Store/Store-styles";
import { Catalogue } from "../../state/features/globalSlice";
import { QortalSVG } from "../../assets/svgs/QortalSVG";

const uid = new ShortUniqueId({
  length: 10
});
const mailUid = new ShortUniqueId();
export const Cart = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const username = useSelector((state: RootState) => state.auth.user?.name);
  const usernamePublicKey = useSelector(
    (state: RootState) => state.auth.user?.publicKey
  );

  const [cartOrders, setCartOrders] = useState<string[]>([]);
  const [localCart, setLocalCart] = useState<CartInterface>();
  // Redux state to open the cart
  const isOpen = useSelector((state: RootState) => state.cart.isOpen);

  // Redux state to get the current cart
  const { carts } = useSelector((state: RootState) => state.cart);

  // Redux state to get the storeId
  const { storeId, storeOwner } = useSelector(
    (state: RootState) => state.store
  );

  // Redux state to get the catalogue hashmap
  const catalogueHashMap = useSelector(
    (state: RootState) => state.global.catalogueHashMap
  );

  // Redux loader state for spinner
  const { isLoadingGlobal } = useSelector((state: RootState) => state.global);

  // Set cart & orders to local state
  useEffect(() => {
    if (storeId && Object.keys(carts).length > 0) {
      const shopCart: CartInterface = carts[storeId];
      // Get the orders of this cart
      const { orders } = shopCart;
      setLocalCart(shopCart);
      setCartOrders(Object.keys(orders));
    }
  }, [storeId, carts]);

  const closeModal = () => {
    dispatch(setIsOpen(false));
  };

  const handlePurchase = async () => {
    if (!localCart) {
      throw new Error("Cannot find cart");
    }
    const details = (cartOrders || []).reduce(
      (acc: any, key) => {
        const order = localCart?.orders[key];
        const quantity = order?.quantity;
        const productId = order?.productId;
        const catalogueId = order?.catalogueId;
        let product = null;
        if (productId && catalogueId && catalogueHashMap[catalogueId]) {
          product = catalogueHashMap[catalogueId]?.products[productId];
        }
        if (!product) return acc;
        const priceInQort =
          product.price?.find(
            (priceItem: any) => priceItem?.currency === "qort"
          )?.value || null;
        if (!priceInQort) throw new Error("Could not retrieve price");
        const totalProductPrice = priceInQort * quantity;
        acc[productId] = {
          product,
          catalogueId,
          quantity,
          pricePerUnit: priceInQort,
          totalProductPrice: priceInQort * quantity
        };
        acc["totalPrice"] = acc["totalPrice"] + totalProductPrice;
        return acc;
      },
      {
        totalPrice: 0
      }
    );
    details["totalPrice"] = details["totalPrice"].toFixed(8);
    const priceToPay = details["totalPrice"];
    if (!storeOwner) throw new Error("Cannot find store owner");
    let res = await qortalRequest({
      action: "GET_NAME_DATA",
      name: storeOwner
    });
    const address = res.owner;
    const resAddress = await qortalRequest({
      action: "GET_ACCOUNT_DATA",
      address: address
    });
    if (!resAddress?.publicKey) throw new Error("Cannot find store owner");
    const responseSendCoin = await qortalRequest({
      action: "SEND_COIN",
      coin: "QORT",
      destinationAddress: address,
      amount: priceToPay
    });
    const signature = responseSendCoin.signature;

    try {
      const orderObject: any = {
        created: Date.now(),
        version: 1,
        details,
        delivery: {
          customerName: "Phil",
          shippingAddress: {
            streetAddress: "2323 Street name",
            city: "Milan",
            region: "Lombardy",
            country: "Italy",
            zipCode: "23233"
          }
        },
        payment: {
          total: priceToPay,
          currency: "QORT",
          transactionSignature: signature
        },
        communicationMethod: ["Q-Mail"]
      };
      const orderToBase64 = await objectToBase64(orderObject);
      const orderId = uid();
      if (!storeId) throw new Error("Cannot find store identifier");
      const parts = storeId.split("q-store-general-");
      const shortStoreId = parts[1];
      const productRequestBody = {
        action: "PUBLISH_QDN_RESOURCE",
        identifier: `q-store-order-${shortStoreId}-${orderId}`,
        name: username,
        service: "DOCUMENT_PRIVATE",
        data64: orderToBase64
      };

      const mailId = mailUid();
      let identifier = `qortal_qmail_${storeOwner.slice(0, 20)}_${address.slice(
        -6
      )}_mail_${mailId}`;

      const htmlContent = `
        <div>You have sold a product for your store!</div>
      `;

      const mailObject: any = {
        title: `Order for store ${shortStoreId} from ${username}`,
        // description,
        subject: "New order",
        createdAt: Date.now(),
        version: 1,
        attachments: [],
        textContent: "",
        htmlContent: htmlContent,
        generalData: {
          thread: []
        },
        recipient: storeOwner
      };

      const mailObjectToBase64 = await objectToBase64(mailObject);
      let mailRequestBody: any = {
        action: "PUBLISH_QDN_RESOURCE",
        name: username,
        service: MAIL_SERVICE_TYPE,
        data64: mailObjectToBase64,
        identifier
      };

      // await qortalRequest(productRequestBody)
      const multiplePublish = {
        action: "PUBLISH_MULTIPLE_QDN_RESOURCES",
        resources: [productRequestBody, mailRequestBody],
        encrypt: true,
        publicKeys: [resAddress.publicKey, usernamePublicKey]
      };
      await qortalRequest(multiplePublish);
      // Clear this cart state from global carts redux
      dispatch(removeCartFromCarts(storeId));
    } catch (error) {
      console.log({ error });
    }
  };

  // Calculate sum total for cart
  const calculateCartTotalSum = (
    cartOrders: string[],
    localCart: CartInterface | undefined,
    catalogueHashMap: Record<string, Catalogue>
  ): number => {
    let totalSum = 0;
    cartOrders.forEach((key) => {
      const order: Order | undefined = localCart?.orders[key];
      const { quantity, productId, catalogueId } = order || {};

      if (productId && catalogueId && catalogueHashMap[catalogueId]) {
        const product = catalogueHashMap[catalogueId].products[productId];
        const priceInQort: number | null =
          product.price?.find(
            (priceItem: any) => priceItem?.currency === "qort"
          )?.value || null;

        if (priceInQort !== null && quantity !== undefined) {
          totalSum += priceInQort * quantity;
        }
      }
    });

    return totalSum;
  };

  const totalSum = useMemo(
    () => calculateCartTotalSum(cartOrders, localCart, catalogueHashMap),
    [cartOrders, localCart, catalogueHashMap]
  );

  if (isLoadingGlobal) return <CircularProgress />;

  return (
    <ReusableModal
      open={isOpen}
      customStyles={{
        width: "96%",
        maxWidth: 1500,
        height: "96%"
      }}
    >
      <CartContainer container>
        <Grid item xs={12} sm={7}>
          {!localCart || cartOrders.length === 0 ? (
            <ProductTitle style={{ textAlign: "center" }}>
              No items in cart
            </ProductTitle>
          ) : (
            (cartOrders || []).map((key) => {
              const order = localCart?.orders[key];
              const quantity = order?.quantity;
              const productId = order?.productId;
              const catalogueId = order?.catalogueId;
              let product = null;
              if (productId && catalogueId && catalogueHashMap[catalogueId]) {
                product = catalogueHashMap[catalogueId]?.products[productId];
              }
              if (!product) return null;
              const priceInQort: number | null =
                product.price?.find(
                  (priceItem: any) => priceItem?.currency === "qort"
                )?.value || null;
              return (
                <ProductContainer container key={productId}>
                  <ProductInfoCol item xs={12} sm={4}>
                    <ProductTitle>{product.title}</ProductTitle>
                    <ProductImage
                      src={product?.images?.[0] || ""}
                      alt={"product-image"}
                    />
                  </ProductInfoCol>
                  <ProductDetailsCol item xs={12} sm={8}>
                    <TotalSumItemTitle>{product.description}</TotalSumItemTitle>
                    <ProductDetailsRow>
                      <ProductPriceFont>
                        Price per unit: {priceInQort}
                      </ProductPriceFont>
                      {priceInQort && (
                        <ProductPriceFont>
                          Total Price: {priceInQort * quantity}
                        </ProductPriceFont>
                      )}
                      <IconsRow>
                        <GarbageSVG
                          color={theme.palette.text.primary}
                          height={"30"}
                          width={"30"}
                        />
                        <QuantityRow>
                          <RemoveQuantityButton
                            onClickFunc={() => {
                              dispatch(
                                subtractQuantityFromCart({ storeId, productId })
                              );
                            }}
                            color={theme.palette.text.primary}
                            height={"30"}
                            width={"30"}
                          />
                          {quantity}
                          <AddQuantityButton
                            onClickFunc={() =>
                              dispatch(
                                addQuantityToCart({ storeId, productId })
                              )
                            }
                            color={theme.palette.text.primary}
                            height={"30"}
                            width={"30"}
                          />
                        </QuantityRow>
                      </IconsRow>
                    </ProductDetailsRow>
                  </ProductDetailsCol>
                </ProductContainer>
              );
            })
          )}
        </Grid>
        <Grid item xs={12} sm={5}>
          <TotalSumContainer>
            <TotalSumHeader>Order Summary</TotalSumHeader>
            <TotalSumItems>
              {(cartOrders || []).map((key) => {
                const order = localCart?.orders[key];
                const quantity = order?.quantity;
                const productId = order?.productId;
                const catalogueId = order?.catalogueId;
                let product = null;
                if (productId && catalogueId && catalogueHashMap[catalogueId]) {
                  product = catalogueHashMap[catalogueId]?.products[productId];
                }
                if (!product) return null;
                const priceInQort: number | null =
                  product.price?.find(
                    (priceItem: any) => priceItem?.currency === "qort"
                  )?.value || null;
                return (
                  <TotalSumItem>
                    <TotalSumItemTitle>
                      x{quantity} {product.title}
                    </TotalSumItemTitle>
                    <TotalSumItemTitle>
                      <QortalSVG
                        color={theme.palette.text.primary}
                        height={"20"}
                        width={"20"}
                      />
                      {priceInQort}
                    </TotalSumItemTitle>
                  </TotalSumItem>
                );
              })}
            </TotalSumItems>
            <OrderTotalRow>{totalSum}</OrderTotalRow>
            <CheckoutButton onClick={handlePurchase}>Purchase</CheckoutButton>
          </TotalSumContainer>
        </Grid>
        <TimesIcon
          onClickFunc={closeModal}
          color={theme.palette.text.primary}
          height={"30"}
          width={"30"}
        />
      </CartContainer>
    </ReusableModal>
  );
};
