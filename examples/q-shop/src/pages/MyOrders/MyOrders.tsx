import { useMemo, useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { CircularProgress, Typography } from "@mui/material";
import { Box } from "@mui/material";
import LazyLoad from "../../components/common/LazyLoad";
import { ShowOrder } from "../ProductManager/ShowOrder/ShowOrder";
import { useFetchOrders } from "../../hooks/useFetchOrders";
import { OrderTable } from "../ProductManager/OrderTable";

export const MyOrders = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const myOrders = useSelector((state: RootState) => state.global.myOrders);
  const store = useSelector(
    (state: RootState) => state.global?.currentStore?.id
  );
  // Redux loader state for spinner
  const { isLoadingGlobal } = useSelector((state: RootState) => state.global);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [order, setOrder] = useState<any>(null);

  const userName = useMemo(() => {
    if (!user?.name) return "";
    return user.name;
  }, [user]);

  const { getMyOrders } = useFetchOrders();

  const handleGetOrders = useCallback(async () => {
    if (!userName) return;
    await getMyOrders(userName);
  }, [getMyOrders, userName]);

  // Get My Orders if store changes (on hyperlink for example, or if there's a page refresh)
  useEffect(() => {
    if (store) {
      handleGetOrders();
    }
  }, [store]);

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        flexDirection: "column",
        backgroundColor: "background.paper"
      }}
    >
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "flex-start",
          flexDirection: "column"
        }}
      >
        <ShowOrder
          from="myOrders"
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          order={order}
        />
        <OrderTable
          openOrder={(order) => {
            setOrder(order);
            setIsOpen(true);
          }}
          data={myOrders}
        />
        <LazyLoad onLoadMore={handleGetOrders}></LazyLoad>
      </Box>
    </Box>
  );
};
