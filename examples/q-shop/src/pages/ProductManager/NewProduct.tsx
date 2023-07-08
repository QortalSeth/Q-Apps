import { useEffect, useState } from "react";
import { ReusableModal } from "../../components/modals/ReusableModal";
import { Box, Button, Modal, Typography, useTheme } from "@mui/material";
import ShortUniqueId from "short-unique-id";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import CreateIcon from "@mui/icons-material/Create";
import { setNotification } from "../../state/features/notificationsSlice";
import { ProductForm } from "./ProductForm";
import { setProductsToSave } from "../../state/features/globalSlice";
import { Product } from "../../state/features/storeSlice";
import { CreateProductButton } from "./NewProduct-styles";
import { AddSVG } from "../../assets/svgs/AddSVG";
import { ModalBody } from "../../components/modals/CreateStoreModal-styles";

const uid = new ShortUniqueId({ length: 10 });
interface ProductPrice {
  currency: string;
  value: number;
}
export interface PublishProductParams {
  title?: string;
  description?: string;
  type: string;
  images: string[];
  price: ProductPrice[];
  mainImageIndex: number;
  category: string;
  status?: string;
}
interface NewMessageProps {
  editProduct?: Product | null;
  onClose: () => void;
  openAddProduct: boolean;
  setOpenAddProduct: (value: boolean) => void;
}

export const NewProduct = ({
  editProduct,
  onClose,
  openAddProduct,
  setOpenAddProduct
}: NewMessageProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const currentStore = useSelector(
    (state: RootState) => state.global.currentStore
  );
  const dataContainer = useSelector(
    (state: RootState) => state.global.dataContainer
  );
  const theme = useTheme();

  const dispatch = useDispatch();

  const openModal = () => {
    setOpenAddProduct(true);
  };

  const closeModal = () => {
    setOpenAddProduct(false);
    onClose();
  };

  useEffect(() => {
    if (editProduct) {
      setOpenAddProduct(true);
    }
  }, [editProduct]);

  async function addProduct({
    title,
    description,
    type,
    images,
    price,
    mainImageIndex,
    category,
    status
  }: PublishProductParams) {
    let address: string = "";
    let name: string = "";
    let errorMsg = "";

    address = user?.address || "";
    name = user?.name || "";

    if (!address) {
      errorMsg = "Cannot send: your address isn't available";
    }
    if (!name) {
      errorMsg = "Cannot send a message without a access to your name";
    }
    if (images.length === 0) {
      errorMsg = "Missing images";
    }
    if (!currentStore) {
      errorMsg = "Cannot create a product without having a store";
    }
    if (!dataContainer) {
      errorMsg = "Cannot create a product without having a data-container";
    }

    if (errorMsg) {
      dispatch(
        setNotification({
          msg: errorMsg,
          alertType: "error"
        })
      );
      return;
    }

    try {
      if (!currentStore?.id) throw new Error("Cannot find store id");
      if (!dataContainer?.products)
        throw new Error("Cannot find data-container products");
      const storeId: string = currentStore?.id;

      const parts = storeId.split("q-store-general-");
      const shortStoreId = parts[1];
      const productId = uid();
      if (!currentStore) return;
      // Edit Product
      if (editProduct) {
        const productObject: any = {
          ...editProduct,
          title,
          description,
          images,
          mainImageIndex,
          type,
          price,
          category,
          isUpdate: true,
          status
        };

        dispatch(setProductsToSave(productObject));
      } else {
        const id = `q-store-product-${shortStoreId}-${productId}`;
        const productObject: any = {
          title,
          description,
          created: Date.now(),
          version: 1,
          images,
          mainImageIndex,
          type,
          price,
          storeId,
          shortStoreId,
          category,
          id
        };
        // Add Product to productsToSave object in Global Slice Redux Store
        dispatch(setProductsToSave(productObject));
      }

      closeModal();
    } catch (error: any) {
      let notificationObj = null;
      if (typeof error === "string") {
        notificationObj = {
          msg: error || "Failed to send message",
          alertType: "error"
        };
      } else if (typeof error?.error === "string") {
        notificationObj = {
          msg: error?.error || "Failed to send message",
          alertType: "error"
        };
      } else {
        notificationObj = {
          msg: error?.message || "Failed to send message",
          alertType: "error"
        };
      }
      if (!notificationObj) return;
      dispatch(setNotification(notificationObj));

      throw new Error("Failed to send message");
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        padding: "5px 15px"
      }}
    >
      <CreateProductButton onClick={openModal}>
        <AddSVG color={"#ffffff"} height={"22"} width={"22"} />
        Add Product
      </CreateProductButton>

      <Modal
        open={openAddProduct}
        onClose={closeModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <ModalBody>
          <ProductForm
            onClose={closeModal}
            editProduct={editProduct}
            onSubmit={addProduct}
          />
        </ModalBody>
      </Modal>
    </Box>
  );
};
