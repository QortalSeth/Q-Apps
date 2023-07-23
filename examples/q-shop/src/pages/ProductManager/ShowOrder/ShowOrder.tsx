import { FC, useEffect, useState } from "react";
import { ReusableModal } from "../../../components/modals/ReusableModal";
import {
  Box,
  Button,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import { useSelector } from "react-redux";
import { RootState } from "../../../state/store";
import { objectToBase64 } from "../../../utils/toBase64";
import {
  Divider,
  OrderDetailsCard,
  OrderDetailsContainer,
  OrderId,
  OrderQuantityRow,
  OrderStatusCard,
  OrderStatusNote,
  OrderStatusRow,
  OrderTitle,
  OrderTitleCol,
  PriceRow,
  ShowOrderCol,
  ShowOrderContent,
  ShowOrderDateCreated,
  ShowOrderHeader,
  ShowOrderImages,
  ShowOrderProductImage,
  ShowOrderTitle,
  TotalCostContainer,
  TotalCostCol,
  TotalCostFont,
  OrderDetails,
  DetailsFont,
  DetailsRow,
  DetailsCard,
  CloseDetailsCardIcon
} from "./ShowOrder-styles";
import moment from "moment";
import { DialogsSVG } from "../../../assets/svgs/DialogsSVG";
import { Order } from "../../../state/features/orderSlice";
import { QortalSVG } from "../../../assets/svgs/QortalSVG";
import { ExpandMoreSVG } from "../../../assets/svgs/ExpandMoreSVG";

interface ShowOrderProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  order: Order;
  from: string;
}

export const ShowOrder: FC<ShowOrderProps> = ({
  isOpen,
  setIsOpen,
  order,
  from
}) => {
  const theme = useTheme();
  const username = useSelector((state: RootState) => state.auth.user?.name);
  const usernamePublicKey = useSelector(
    (state: RootState) => state.auth.user?.publicKey
  );

  const [note, setNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [paymentInfo, setPaymentInfo] = useState(null);

  const closeModal = () => {
    setIsOpen(false);
  };

  const getPaymentInfo = async (signature: string) => {
    try {
      const url = `/transactions/signature/${signature}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const responseData = await response.json();
      if (responseData && !responseData.error) {
        setPaymentInfo(responseData);
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (from === "ProductManager" && order) {
      setNote(order?.note || "");
      setSelectedStatus(order?.status || "");
    }
  }, [order, from]);

  const updateStatus = async () => {
    try {
      const orderStateObject: any = {
        status: selectedStatus,
        note
      };
      const orderStatusToBase64 = await objectToBase64(orderStateObject);

      let res = await qortalRequest({
        action: "GET_NAME_DATA",
        name: order?.user
      });
      const address = res.owner;
      const resAddress = await qortalRequest({
        action: "GET_ACCOUNT_DATA",
        address: address
      });
      if (!resAddress?.publicKey) throw new Error("Cannot find store owner");
      const string = order?.id;

      const identifier = string.replace(/(q-store)(-order)/, "$1-status$2");
      const productRequestBody = {
        action: "PUBLISH_QDN_RESOURCE",
        identifier: identifier,
        name: username,
        service: "DOCUMENT_PRIVATE",
        filename: `${order?.id}_status.json`,
        data64: orderStatusToBase64,
        encrypt: true,
        publicKeys: [resAddress.publicKey, usernamePublicKey]
      };
      await qortalRequest(productRequestBody);
    } catch (error) {
      console.log({ error });
    }
  };

  console.log(order, "order here1");

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        width: "100%"
      }}
    >
      <ReusableModal
        open={isOpen}
        customStyles={{
          width: "100%",
          maxWidth: 700,
          height: "90%",
          wordBreak: "break-word",
          borderRadius: 8,
          padding: "32px 20px"
        }}
      >
        <ShowOrderHeader>
          <ShowOrderImages>
            {Object.keys(order?.details || {})
              .filter((key) => key !== "totalPrice")
              .map((key, index) => {
                return (
                  <ShowOrderProductImage
                    key={key}
                    src={order?.details?.[key]?.product?.images?.[0]}
                    alt={`image-${index}`}
                  />
                );
              })}
          </ShowOrderImages>
          <ShowOrderCol>
            <ShowOrderTitle
              href={`qortal://APP/Q-Mail?to=${order?.delivery?.customerName}`}
              className="qortal-link"
            >
              <EmailIcon
                sx={{
                  color: "#50e3c2"
                }}
              />
              Message {order?.delivery?.customerName} on Q-Mail
            </ShowOrderTitle>
            <ShowOrderDateCreated>
              {moment(order?.created).format("llll")}
            </ShowOrderDateCreated>
          </ShowOrderCol>
        </ShowOrderHeader>
        <ShowOrderContent>
          {from === "ProductManager" ? (
            <Box>
              <InputLabel id="status">Order Status</InputLabel>
              <Select
                name="status"
                value={selectedStatus}
                onChange={(event) => {
                  setSelectedStatus(event.target.value);
                }}
                variant="outlined"
                required
              >
                <MenuItem value="Received">Received</MenuItem>
                <MenuItem value="Shipped">Shipped</MenuItem>
                <MenuItem value="Refunded">Refunded</MenuItem>
              </Select>
              <TextField
                name="note"
                label="Note"
                value={note}
                variant="outlined"
                onChange={(e) => setNote(e.target.value)}
              />
              <Button onClick={updateStatus} variant="contained">
                Update Status
              </Button>
            </Box>
          ) : (
            <OrderStatusRow>
              <OrderStatusCard
                style={{
                  backgroundColor:
                    order?.status === "Received"
                      ? "#e5e916"
                      : order?.status === "Shipped"
                      ? "#29b100"
                      : order?.status === " Refunded"
                      ? "#f33c3c"
                      : "#e5e916"
                }}
              >
                Order Status: {order?.status}
              </OrderStatusCard>
              {order?.note && <OrderStatusNote>{order?.note}</OrderStatusNote>}
            </OrderStatusRow>
          )}
          <>
            {order?.details && (
              <>
                <OrderDetails>
                  {Object.keys(order?.details || {})
                    .filter((key) => key !== "totalPrice")
                    .map((key) => {
                      const product = order?.details?.[key];
                      return (
                        <OrderDetailsContainer key={key}>
                          <DialogsSVG
                            color={theme.palette.text.primary}
                            height={"22"}
                            width={"22"}
                          />
                          <OrderDetailsCard>
                            <OrderTitleCol>
                              <OrderTitle>{product?.product?.title}</OrderTitle>
                              <OrderId>
                                Product Id: {product?.product?.id}
                              </OrderId>
                            </OrderTitleCol>
                            <OrderTitleCol>
                              <OrderQuantityRow style={{ gap: "10px" }}>
                                <OrderTitle>
                                  x {product?.quantity} {product?.pricePerUnit}
                                </OrderTitle>
                                <QortalSVG
                                  width={"22"}
                                  height={"22"}
                                  color={theme.palette.text.primary}
                                />{" "}
                              </OrderQuantityRow>
                              <OrderQuantityRow>
                                Total: {product?.totalProductPrice}
                                <QortalSVG
                                  width={"22"}
                                  height={"22"}
                                  color={theme.palette.text.primary}
                                />
                              </OrderQuantityRow>
                            </OrderTitleCol>
                          </OrderDetailsCard>
                        </OrderDetailsContainer>
                      );
                    })}
                </OrderDetails>
                <TotalCostContainer>
                  <TotalCostCol>
                    <Divider />
                    <PriceRow>
                      <QortalSVG
                        width={"22"}
                        height={"22"}
                        color={theme.palette.text.primary}
                      />{" "}
                      <TotalCostFont>
                        {order?.details?.totalPrice}
                      </TotalCostFont>
                    </PriceRow>
                  </TotalCostCol>
                  <TotalCostCol>
                    <DetailsRow
                      onClick={() =>
                        getPaymentInfo(
                          order?.payment?.transactionSignature as string
                        )
                      }
                    >
                      <DetailsFont>Payment Details</DetailsFont>
                      <ExpandMoreSVG
                        color={theme.palette.text.primary}
                        height={"22"}
                        width={"22"}
                      />
                    </DetailsRow>
                  </TotalCostCol>
                  {paymentInfo && (
                    <DetailsCard>
                      {Object.keys(paymentInfo || {}).map((key) => {
                        return (
                          <Box>
                            {key}: <span>{paymentInfo[key]}</span>
                          </Box>
                        );
                      })}
                      <CloseDetailsCardIcon
                        width={"18"}
                        height={"18"}
                        color={theme.palette.text.primary}
                        onClickFunc={() => setPaymentInfo(null)}
                      />
                    </DetailsCard>
                  )}
                </TotalCostContainer>
              </>
            )}
          </>
          <Box>
            <Typography variant="body1" color="text.primary">
              Delivery Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customer name:{order?.delivery?.customerName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Shipping Address
            </Typography>
            {order?.delivery?.shippingAddress && (
              <Box>
                {Object.entries(order?.delivery?.shippingAddress).map(
                  ([key, value]) => (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      key={key}
                    >
                      {key}: <span>{value}</span>
                    </Typography>
                  )
                )}
              </Box>
            )}
          </Box>
        </ShowOrderContent>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "flex-end"
          }}
        >
          <Button variant="contained" onClick={closeModal}>
            Close
          </Button>
        </Box>
      </ReusableModal>
    </Box>
  );
};
