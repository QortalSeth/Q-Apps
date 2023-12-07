import { useState, useEffect, useMemo } from "react";
import { ReusableModal } from "../../components/modals/ReusableModal";
import {
  CircularProgress,
  Grid,
  useTheme,
  useMediaQuery,
  FormControl,
  SelectChangeEvent
} from "@mui/material";
import {
  addQuantityToCart,
  subtractQuantityFromCart,
  removeCartFromCarts,
  Order,
  removeProductFromCart
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
  ColumnTitle,
  ConfirmPurchaseContainer,
  ConfirmPurchaseRow,
  GarbageIcon,
  IconsRow,
  OrderTotalRow,
  ProductContainer,
  ProductDescription,
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
import {
  BackToStorefrontButton as BackToCheckoutButton,
  BackToStorefrontButton as CheckoutButton
} from "../Store/Store/Store-styles";
import {
  Catalogue,
  setIsLoadingGlobal
} from "../../state/features/globalSlice";
import { QortalSVG } from "../../assets/svgs/QortalSVG";
import { setNotification } from "../../state/features/notificationsSlice";
import {
  CreateButton as ConfirmPurchaseButton,
  CancelButton,
  CustomInputField
} from "../../components/modals/CreateStoreModal-styles";
import {
  CustomMenuItem,
  CustomSelect,
  InputFieldCustomLabel
} from "../ProductManager/NewProduct/NewProduct-styles";
import countries from "../../constants/countries.json";
import states from "../../constants/states.json";
import moment from "moment";
import { BackArrowSVG } from "../../assets/svgs/BackArrowSVG";
import { CloseIconModal } from "../Store/StoreReviews/StoreReviews-styles";
import { ORDER_BASE, STORE_BASE } from "../../constants/identifiers";
interface CountryProps {
  text: string;
  value: string;
}

export const Cart = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const uid = new ShortUniqueId({
    length: 10
  });
  const mailUid = new ShortUniqueId();

  const dispatch = useDispatch();
  const username = useSelector((state: RootState) => state.auth.user?.name);
  const usernamePublicKey = useSelector(
    (state: RootState) => state.auth.user?.publicKey
  );
  // Redux state to open the cart
  const isOpen = useSelector((state: RootState) => state.cart.isOpen);
  // Redux state to get the current cart
  const carts = useSelector((state: RootState) => state.cart.carts);
  // Redux state to get the storeId
  const storeOwner = useSelector((state: RootState) => state.store.storeOwner);
  const storeId = useSelector((state: RootState) => state.store.storeId);
  const hashMapStores = useSelector(
    (state: RootState) => state.store.hashMapStores
  );
  // Redux state to get the catalogue hashmap
  const catalogueHashMap = useSelector(
    (state: RootState) => state.global.catalogueHashMap
  );

  const [cartOrders, setCartOrders] = useState<string[]>([]);
  const [localCart, setLocalCart] = useState<CartInterface>();
  const [checkoutPage, setCheckoutPage] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>("");
  const [streetAddress, setStreetAddress] = useState<string>("");
  const [country, setCountry] = useState<string | null>("");
  const [state, setState] = useState<string | null>("");
  const [city, setCity] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [zipCode, setZipCode] = useState<string>("");
  const [deliveryNote, setDeliveryNote] = useState<string>("");
  const [confirmPurchaseModalOpen, setConfirmPurchaseModalOpen] =
    useState<boolean>(false);

  // Set cart & orders to local state
  useEffect(() => {
    if (storeId && Object.keys(carts).length > 0) {
      const shopCart: CartInterface = carts[storeId];
      // Get the orders of this cart
      const orders = shopCart?.orders || {};
      setLocalCart(shopCart);
      setCartOrders(Object.keys(orders));
    }
  }, [storeId, carts]);

  // Set username to customer name on cart open

  useEffect(() => {
    if (username) setCustomerName(username);
  }, [isOpen, username]);

  const closeModal = () => {
    dispatch(setIsOpen(false));
    setCheckoutPage(false);
  };

  const handleSelectCountry = (event: SelectChangeEvent<string | null>) => {
    const optionId = event.target.value;
    const selectedOption = countries.find(
      (country) => country.text === optionId
    );
    setCountry(selectedOption?.text || null);
  };

  const handleSelectState = (event: SelectChangeEvent<string | null>) => {
    const optionId = event.target.value;
    const selectedOption = states.find((state) => state.text === optionId);
    setState(selectedOption?.text || null);
  };

  //  Check to see if any of the products in the cart are digital and that there are none which are physical
  const isDigitalOrder = useMemo(() => {
    if (!localCart) return false;
    return Object.keys(localCart.orders).every((key) => {
      const order = localCart.orders[key];
      const productId = order?.productId;
      const catalogueId = order?.catalogueId;
      let product = null;
      if (productId && catalogueId && catalogueHashMap[catalogueId]) {
        product = catalogueHashMap[catalogueId]?.products[productId];
      }
      if (!product) return false;
      return product.type === "digital";
    });
  }, [localCart]);

  const handlePurchase = async () => {
    if (!localCart) {
      dispatch(
        setNotification({
          alertType: "error",
          msg: "Cannot find a cart! Please try refreshing the page and trying again!"
        })
      );
      return;
    }
    if (!storeId) {
      dispatch(
        setNotification({
          alertType: "error",
          msg: "Cannot find a store! Please try refreshing the page and trying again!"
        })
      );
      return;
    }
    if (!storeOwner) {
      dispatch(
        setNotification({
          alertType: "error",
          msg: "Cannot find a store owner! Please try refreshing the page and trying again!"
        })
      );
      return;
    }
    if (cartOrders.length === 0) {
      dispatch(
        setNotification({
          alertType: "error",
          msg: "You have no items in your cart"
        })
      );
      return;
    }
    if (
      !isDigitalOrder &&
      (!customerName ||
        !streetAddress ||
        !country ||
        !city ||
        (country === "United States" && !state) ||
        (country !== "United States" && !region) ||
        !zipCode)
    ) {
      dispatch(
        setNotification({
          alertType: "error",
          msg: "Please fill in all the required delivery fields"
        })
      );
      return;
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
        if (!priceInQort) {
          dispatch(
            setNotification({
              alertType: "error",
              msg: "Could not find the price"
            })
          );
          return;
        }
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
    if (!storeOwner) {
      dispatch(
        setNotification({
          alertType: "error",
          msg: "Cannot find the store owner"
        })
      );
      return;
    }
    let res = await qortalRequest({
      action: "GET_NAME_DATA",
      name: storeOwner
    });
    const address = res.owner;
    const resAddress = await qortalRequest({
      action: "GET_ACCOUNT_DATA",
      address: address
    });
    if (!resAddress?.publicKey) {
      dispatch(
        setNotification({
          alertType: "error",
          msg: "Cannot find the store owner"
        })
      );
      return;
    }
    const responseSendCoin = await qortalRequest({
      action: "SEND_COIN",
      coin: "QORT",
      destinationAddress: address,
      amount: priceToPay
    });
    const signature = responseSendCoin.signature;

    try {
      dispatch(setIsLoadingGlobal(true));
      // Validate whether order is coming from the USA to put state instead of region
      const orderObjectNotUSA: any = {
        created: Date.now(),
        version: 1,
        details,
        storeName: hashMapStores[storeId]?.title,
        sellerName: storeOwner,
        delivery: {
          customerName,
          shippingAddress: {
            streetAddress,
            city,
            region,
            country,
            zipCode,
            deliveryNote
          }
        },
        payment: {
          total: priceToPay,
          currency: "QORT",
          transactionSignature: signature
        },
        communicationMethod: ["Q-Mail"]
      };
      const orderObjectUSA: any = {
        created: Date.now(),
        version: 1,
        details,
        storeName: hashMapStores[storeId]?.title,
        sellerName: storeOwner,
        delivery: {
          customerName,
          shippingAddress: {
            streetAddress,
            city,
            state,
            country,
            zipCode,
            deliveryNote
          }
        },
        payment: {
          total: priceToPay,
          currency: "QORT",
          transactionSignature: signature
        },
        communicationMethod: ["Q-Mail"]
      };
      const orderToBase64 = await objectToBase64(
        country === "United States" ? orderObjectUSA : orderObjectNotUSA
      );
      const orderId = uid();
      if (!storeId) throw new Error("Cannot find store identifier");
      const parts = storeId.split(`${STORE_BASE}-`);
      const shortStoreId = parts[1];
      const productRequestBody = {
        action: "PUBLISH_QDN_RESOURCE",
        identifier: `${ORDER_BASE}-${shortStoreId}-${orderId}`,
        name: username,
        service: "DOCUMENT_PRIVATE",
        data64: orderToBase64
      };

      const mailId = mailUid();
      let identifier = `qortal_qmail_${storeOwner?.slice(0, 20)}_${address.slice(
        -6
      )}_mail_${mailId}`;

      // HTML with the order details being sent to seller by Q-Mail
      const htmlContent = `
      <div style="display: flex; flex-direction: column; align-items: center; padding: 10px; gap: 10px;">
        <div style="font-family: Merriweather Sans, sans-serif; font-size: 20px; letter-spacing: 0; text-align: center;">
          You have sold a product for your store!
        </div>
        <div>
          ${Object.keys(details)
            .filter((key) => key !== "totalPrice")
            .map((key) => {
              const { product, quantity, pricePerUnit, totalProductPrice } =
                details[key];
              return `
                <div style="display: flex; flex-direction: column; align-items: center; padding: 20px 40px; gap: 10px; background-color: white; border-radius: 5px; color: black;">
                <div style="font-family: Karla; font-size: 21px; font-weight: 300; letter-spacing: 0; text-align: center;">Shop: ${
                  hashMapStores[storeId]?.title
                }</div>
                  <div style="display: flex; flex-direction: row; align-items: center; gap: 10px;">
                    <div style="font-family: Karla; font-size: 21px; font-weight: 300; letter-spacing: 0; text-align: center;">Product: ${
                      product.title
                    }</div>
                    <div style="font-family: Karla; font-size: 21px; font-weight: 300; letter-spacing: 0; text-align: center;">x ${quantity}</div>
                  </div>
                  <div style="display: flex; flex-direction: row; align-items: center;">
                    <div style="font-family: Karla; font-size: 21px; font-weight: 300; letter-spacing: 0; text-align: center;">Price: ${pricePerUnit} ${
                country === "United States"
                  ? orderObjectUSA?.payment?.currency
                  : orderObjectNotUSA?.payment?.currency
              }</div>
                  </div>
                  <div style="display: flex; flex-direction: row; align-items: center;">
                    <div style="font-family: Karla; font-size: 21px; font-weight: 300; letter-spacing: 0; text-align: center;">Total Price: ${totalProductPrice} ${
                country === "United States"
                  ? orderObjectUSA?.payment?.currency
                  : orderObjectNotUSA?.payment?.currency
              }
              </div>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
        ${
          !isDigitalOrder
            ? `
        <div>
          <div style="font-family: Merriweather Sans, sans-serif; font-size: 20px; letter-spacing: 0; text-align: center;">
            Delivery Information
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; padding: 20px 40px; gap: 10px; background-color: white; border-radius: 5px; color: black;">
            <div style="font-family: Karla; font-size: 21px; font-weight: 300; letter-spacing: 0; text-align: center;">
              Qortal Username: ${username}
            </div>
            <div style="font-family: Karla; font-size: 21px; font-weight: 300; letter-spacing: 0; text-align: center;">
              Customer Name: ${customerName}
            </div>
            <div style="font-family: Karla; font-size: 21px; font-weight: 300; letter-spacing: 0; text-align: center;">
              Street Address: ${streetAddress}
            </div>
            <div style="font-family: Karla; font-size: 21px; font-weight: 300; letter-spacing: 0; text-align: center;">
              City: ${city}
            </div>
            ${
              country === "United States"
                ? `<div style="font-family: Karla; font-size: 21px; font-weight: 300; letter-spacing: 0; text-align: center;">
                State: ${state}
              </div>`
                : `<div style="font-family: Karla; font-size: 21px; font-weight: 300; letter-spacing: 0; text-align: center;">
                Region: ${region}
              </div>`
            }
            <div style="font-family: Karla; font-size: 21px; font-weight: 300; letter-spacing: 0; text-align: center;">
              Country: ${country}
            </div>
            <div style="font-family: Karla; font-size: 21px; font-weight: 300; letter-spacing: 0; text-align: center;">
              Zip Code: ${zipCode}
            </div>
            <div style="font-family: Karla; font-size: 21px; font-weight: 300; letter-spacing: 0; text-align: center;">
              Delivery Note: ${deliveryNote}
            </div>
          </div>
        </div>
        `
            : `<div></div>`
        }
        <div>
          <div style="font-family: Merriweather Sans, sans-serif; font-size: 20px; letter-spacing: 0; text-align: center;">
            Date of purchase
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; padding: 20px 40px; gap: 10px; background-color: white; border-radius: 5px; color: black;">
            <div style="font-family: Karla; font-size: 18px; font-weight: 300; letter-spacing: 0; text-align: center;">
              Date: ${moment(
                country === "United States"
                  ? orderObjectUSA?.created
                  : orderObjectNotUSA?.created
              ).format("llll")}
            </div>
          </div>
        </div>
      </div>
      `;

      const mailObject: any = {
        title: `Order for store ${shortStoreId} from ${username}`,
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

      const multiplePublish = {
        action: "PUBLISH_MULTIPLE_QDN_RESOURCES",
        resources: [productRequestBody, mailRequestBody],
        encrypt: true,
        publicKeys: [resAddress.publicKey, usernamePublicKey]
      };
      await qortalRequest(multiplePublish);
      // Clear this cart state from global carts redux
      dispatch(removeCartFromCarts({ storeId }));
      // Clear cart local state
      setCheckoutPage(false);
      setCustomerName("");
      setStreetAddress("");
      setCountry("");
      setState("");
      setCity("");
      setRegion("");
      setZipCode("");
      setDeliveryNote("");
      setConfirmPurchaseModalOpen(false);
      // Close the modal and set notification message
      closeModal();
      dispatch(
        setNotification({
          alertType: "success",
          msg: "Order placed successfully!"
        })
      );
    } catch (error) {
      console.log({ error });
      const errMsg = "Order failed to be placed! Please try again!";
      dispatch(
        setNotification({
          msg: errMsg,
          alertType: "error"
        })
      );
    } finally {
      dispatch(setIsLoadingGlobal(false));
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

  return (
    <>
      <ReusableModal
        open={isOpen}
        customStyles={{
          width: "96%",
          maxWidth: 1500,
          height: "96%",
          backgroundColor:
            theme.palette.mode === "light" ? "#e8e8e8" : "#32333c",
          position: "relative",
          padding: "15px 20px 35px 10px",
          borderRadius: "3px",
          overflowY: "auto",
          overflowX: "hidden",
          maxHeight: "90vh"
        }}
      >
        <CartContainer
          container
          direction={isMobile ? "column" : "row"}
          spacing={1}
        >
          <Grid item xs={12} sm={9} sx={{ width: "100%" }}>
            {!localCart || cartOrders.length === 0 ? (
              <ProductTitle style={{ textAlign: "center" }}>
                No items in cart
              </ProductTitle>
            ) : (
              <>
                {checkoutPage && !isDigitalOrder ? (
                  <>
                    <BackToCheckoutButton
                      onClick={() => {
                        setCheckoutPage(false);
                      }}
                      style={{ marginBottom: "5px" }}
                    >
                      <BackArrowSVG
                        color={"white"}
                        height={"22"}
                        width={"22"}
                      />{" "}
                      Checkout
                    </BackToCheckoutButton>
                    <ColumnTitle>Delivery Information</ColumnTitle>
                    <Grid container spacing={2}>
                      <ProductInfoCol item xs={12} sm={6}>
                        {/* Customer Name */}
                        <FormControl fullWidth>
                          <CustomInputField
                            style={{ flexGrow: 1 }}
                            name="customer-name"
                            label="Customer Name"
                            variant="filled"
                            value={customerName}
                            required
                            onChange={(e) =>
                              setCustomerName(e.target.value as string)
                            }
                          />
                        </FormControl>
                        {/* Street Address */}
                        <FormControl fullWidth>
                          <CustomInputField
                            style={{ flexGrow: 1 }}
                            name="street-address"
                            label="Street Address"
                            variant="filled"
                            value={streetAddress}
                            required
                            onChange={(e) =>
                              setStreetAddress(e.target.value as string)
                            }
                          />
                        </FormControl>
                        {/* City */}
                        <FormControl fullWidth>
                          <CustomInputField
                            style={{ flexGrow: 1 }}
                            name="city"
                            label="City"
                            variant="filled"
                            value={city}
                            required
                            onChange={(e) => setCity(e.target.value as string)}
                          />
                        </FormControl>
                        {/* Country */}
                        <FormControl fullWidth>
                          <InputFieldCustomLabel id="country-label">
                            Country
                          </InputFieldCustomLabel>
                          <CustomSelect
                            labelId="country-label"
                            label="Country"
                            variant="filled"
                            value={country}
                            onChange={(event) => {
                              handleSelectCountry(
                                event as SelectChangeEvent<string | null>
                              );
                            }}
                            required
                            fullWidth
                          >
                            {countries.map((country: CountryProps) => {
                              return (
                                <CustomMenuItem value={country.text}>
                                  {country.text}
                                </CustomMenuItem>
                              );
                            })}
                          </CustomSelect>
                        </FormControl>
                      </ProductInfoCol>
                      <ProductInfoCol item xs={12} sm={6}>
                        {/* State or region */}
                        {country === "United States" ? (
                          <FormControl fullWidth>
                            <InputFieldCustomLabel id="state-label">
                              State
                            </InputFieldCustomLabel>
                            <CustomSelect
                              labelId="state-label"
                              label="State"
                              variant="filled"
                              value={state}
                              onChange={(event) => {
                                handleSelectState(
                                  event as SelectChangeEvent<string | null>
                                );
                              }}
                              required
                              fullWidth
                            >
                              {states.map((state: CountryProps) => {
                                return (
                                  <CustomMenuItem value={state.text}>
                                    {state.text}
                                  </CustomMenuItem>
                                );
                              })}
                            </CustomSelect>
                          </FormControl>
                        ) : (
                          <FormControl fullWidth>
                            <CustomInputField
                              style={{ flexGrow: 1 }}
                              name="region"
                              label="Region"
                              variant="filled"
                              value={region}
                              required
                              onChange={(e) =>
                                setRegion(e.target.value as string)
                              }
                            />
                          </FormControl>
                        )}
                        {/* Zip Code */}
                        <FormControl fullWidth>
                          <CustomInputField
                            style={{ flexGrow: 1 }}
                            name="zip-code"
                            label="Zip Code"
                            variant="filled"
                            value={zipCode}
                            required
                            onChange={(e) =>
                              setZipCode(e.target.value as string)
                            }
                          />
                        </FormControl>
                        {/* Delivery Note */}
                        <FormControl fullWidth>
                          <CustomInputField
                            style={{ flexGrow: 1 }}
                            name="delivery-note"
                            label="Delivery Note"
                            variant="filled"
                            value={deliveryNote}
                            required
                            onChange={(e) =>
                              setDeliveryNote(e.target.value as string)
                            }
                          />
                        </FormControl>
                      </ProductInfoCol>
                    </Grid>
                  </>
                ) : (
                  <>
                    <ColumnTitle>My Cart</ColumnTitle>
                    {(cartOrders || []).map((key) => {
                      const order = localCart?.orders[key];
                      const quantity = order?.quantity;
                      const productId = order?.productId;
                      const catalogueId = order?.catalogueId;
                      let product = null;
                      if (
                        productId &&
                        catalogueId &&
                        catalogueHashMap[catalogueId]
                      ) {
                        product =
                          catalogueHashMap[catalogueId]?.products[productId];
                      }
                      if (!product) return null;
                      const priceInQort: number | null =
                        product.price?.find(
                          (priceItem: any) => priceItem?.currency === "qort"
                        )?.value || null;
                      return (
                        <ProductContainer container key={productId}>
                          <ProductInfoCol
                            item
                            xs={12}
                            sm={4}
                            style={{ textAlign: "center" }}
                          >
                            <ProductTitle>{product.title}</ProductTitle>
                            <ProductImage
                              src={product?.images?.[0] || ""}
                              alt={`product-img-${productId}}`}
                            />
                          </ProductInfoCol>
                          <ProductDetailsCol item xs={12} sm={8}>
                            <ProductDescription>
                              {product.description}
                            </ProductDescription>
                            <ProductDetailsRow>
                              <ProductPriceFont>
                                Price per unit:
                                <span>
                                  <QortalSVG
                                    color={theme.palette.text.primary}
                                    height={"20"}
                                    width={"20"}
                                  />
                                  {priceInQort}
                                </span>
                              </ProductPriceFont>
                              {priceInQort && (
                                <ProductPriceFont>
                                  Total Price:
                                  <span>
                                    <QortalSVG
                                      color={theme.palette.text.primary}
                                      height={"20"}
                                      width={"20"}
                                    />
                                    {priceInQort * quantity}
                                  </span>
                                </ProductPriceFont>
                              )}
                              <IconsRow>
                                <GarbageIcon
                                  onClickFunc={() => {
                                    dispatch(
                                      removeProductFromCart({
                                        storeId,
                                        productId
                                      })
                                    );
                                  }}
                                  color={theme.palette.text.primary}
                                  height={"30"}
                                  width={"30"}
                                />
                                <QuantityRow>
                                  <RemoveQuantityButton
                                    onClickFunc={() => {
                                      dispatch(
                                        subtractQuantityFromCart({
                                          storeId,
                                          productId
                                        })
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
                                        addQuantityToCart({
                                          storeId,
                                          productId
                                        })
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
                    })}
                  </>
                )}
              </>
            )}
          </Grid>
          {localCart && cartOrders.length > 0 && (
            <Grid item xs={12} sm={3} sx={{ width: "100%" }}>
              <TotalSumContainer>
                <TotalSumHeader>Order Summary</TotalSumHeader>
                <TotalSumItems>
                  {(cartOrders || []).map((key) => {
                    const order = localCart?.orders[key];
                    const quantity = order?.quantity;
                    const productId = order?.productId;
                    const catalogueId = order?.catalogueId;
                    let product = null;
                    if (
                      productId &&
                      catalogueId &&
                      catalogueHashMap[catalogueId]
                    ) {
                      product =
                        catalogueHashMap[catalogueId]?.products[productId];
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
                            height={"18"}
                            width={"18"}
                          />
                          {priceInQort}
                        </TotalSumItemTitle>
                      </TotalSumItem>
                    );
                  })}
                </TotalSumItems>
                <OrderTotalRow>
                  <span>Total:</span>
                  <QortalSVG
                    color={theme.palette.text.primary}
                    height={"22"}
                    width={"22"}
                  />
                  {totalSum}
                </OrderTotalRow>
                <CheckoutButton
                  style={{ marginTop: "15px" }}
                  onClick={() => {
                    if (checkoutPage) {
                      handlePurchase();
                    } else if (!checkoutPage && !isDigitalOrder) {
                      setCheckoutPage(true);
                    } else if (!checkoutPage && isDigitalOrder) {
                      setConfirmPurchaseModalOpen(true);
                    } else {
                      setCheckoutPage(true);
                    }
                  }}
                >
                  {checkoutPage || (!checkoutPage && isDigitalOrder)
                    ? "Purchase"
                    : "Checkout"}
                </CheckoutButton>
              </TotalSumContainer>
            </Grid>
          )}
        </CartContainer>
        <CloseIconModal
          onClickFunc={closeModal}
          color={theme.palette.text.primary}
          height={"22"}
          width={"22"}
        />
      </ReusableModal>
      <ReusableModal
        open={confirmPurchaseModalOpen}
        customStyles={{
          width: "96%",
          maxWidth: 700,
          height: "auto",
          backgroundColor:
            theme.palette.mode === "light" ? "#e8e8e8" : "#32333c",
          position: "relative",
          padding: "15px 20px 35px 10px",
          borderRadius: "3px",
          overflowY: "auto",
          overflowX: "hidden",
          maxHeight: "90vh"
        }}
      >
        <ConfirmPurchaseContainer>
          <ConfirmPurchaseRow>
            Are you sure you wish to complete this purchase?
          </ConfirmPurchaseRow>
          <ConfirmPurchaseRow style={{ gap: "15px" }}>
            <CancelButton
              variant="outlined"
              color="error"
              onClick={() => {
                setConfirmPurchaseModalOpen(false);
              }}
            >
              Cancel
            </CancelButton>
            <ConfirmPurchaseButton variant="contained" onClick={handlePurchase}>
              Confirm
            </ConfirmPurchaseButton>
          </ConfirmPurchaseRow>
        </ConfirmPurchaseContainer>
      </ReusableModal>
    </>
  );
};
