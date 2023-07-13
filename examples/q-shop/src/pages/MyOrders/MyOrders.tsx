import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";

import {
  Box,
  Button,
  Input,
  Typography,
  useTheme,
  IconButton
} from "@mui/material";
import LazyLoad from "../../components/common/LazyLoad";
import { NewProduct } from "../ProductManager/NewProduct";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { ShowOrder } from "../ProductManager/ShowOrder";
import { SimpleTable } from "../ProductManager/ProductTable";
import { setNotification } from "../../state/features/notificationsSlice";
import { objectToBase64 } from "../../utils/toBase64";
import ShortUniqueId from "short-unique-id";
import {
  Catalogue,
  CatalogueDataContainer,
  DataContainer
} from "../../state/features/globalSlice";
import { Price, Product } from "../../state/features/storeSlice";
import { useFetchOrders } from "../../hooks/useFetchOrders";
import { AVAILABLE } from "../../constants/product-status";
import OrderTable from "../ProductManager/OrderTable";

const uid = new ShortUniqueId({ length: 10 });

export const MyOrders = () => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);

  const myOrders = useSelector((state: RootState) => state.global.myOrders);

  const products = useSelector((state: RootState) => state.global.products);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [order, setOrder] = useState<any>(null);
  const [replyTo, setReplyTo] = useState<any>(null);

  const [valueTab, setValueTab] = React.useState(0);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const userName = useMemo(() => {
    if (!user?.name) return "";
    return user.name;
  }, [user]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { getMyOrders } = useFetchOrders();
  const handleGetOrders = React.useCallback(async () => {
    if (!userName) return;
    await getMyOrders(userName);
  }, [getMyOrders, userName]);

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
        <ShowOrder isOpen={isOpen} setIsOpen={setIsOpen} order={order} />
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
