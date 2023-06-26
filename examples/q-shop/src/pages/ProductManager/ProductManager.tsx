import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { Box, useTheme } from "@mui/material";
import LazyLoad from "../../components/common/LazyLoad";
import { NewProduct } from "./NewProduct";
import { ShowOrder } from "./ShowOrder";
import SimpleTable from "./ProductTable";
import { setNotification } from "../../state/features/notificationsSlice";
import { objectToBase64 } from "../../utils/toBase64";
import ShortUniqueId from "short-unique-id";
import {
  Catalogue,
  CatalogueDataContainer,
  DataContainer,
  removeFromProductsToSave
} from "../../state/features/globalSlice";
import { Price, Product } from "../../state/features/storeSlice";
import { useFetchOrders } from "../../hooks/useFetchOrders";
import { AVAILABLE } from "../../constants/product-status";
import {
  TabsContainer,
  StyledTabs,
  StyledTab,
  ProductsToSaveCard,
  ProductToSaveCard,
  CardHeader,
  Bulletpoints,
  TimesIcon,
  CardButtonRow
} from "./ProductManager-styles";
import OrderTable from "./OrderTable";
import { BackToStorefrontButton } from "../Store/Store-styles";
import { QortalSVG } from "../../assets/svgs/QortalSVG";
import { CategorySVG } from "../../assets/svgs/CategorySVG";
import { LoyaltySVG } from "../../assets/svgs/LoyaltySVG";
import useConfirmationModal from "../../hooks/useConfirmModal";
import { CreateButton } from "../../components/modals/CreateStoreModal-styles";

const uid = new ShortUniqueId({ length: 10 });

export const ProductManager = () => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const productsToSave = useSelector(
    (state: RootState) => state.global.productsToSave
  );
  const productsDataContainer = useSelector(
    (state: RootState) => state.global?.dataContainer?.products
  );
  const currentStore = useSelector(
    (state: RootState) => state.global.currentStore
  );
  const dataContainer = useSelector(
    (state: RootState) => state.global.dataContainer
  );
  const orders = useSelector((state: RootState) => state.order.orders);
  const hashMapOrders = useSelector(
    (state: RootState) => state.order.hashMapOrders
  );
  const products = useSelector((state: RootState) => state.global.products);

  console.log({ orders, hashMapOrders });

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [order, setOrder] = useState<any>(null);
  const [valueTab, setValueTab] = React.useState(0);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const userName = useMemo(() => {
    if (!user?.name) return "";
    return user.name;
  }, [user]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Publish productsToSave to QDN
  async function publishQDNResource() {
    let address: string = "";
    let name: string = "";
    let errorMsg = "";

    address = user?.address || "";
    name = user?.name || "";

    // Validation
    if (!address) {
      errorMsg = "Cannot send: your address isn't available";
    }
    if (!name) {
      errorMsg = "Cannot send a message without a access to your name";
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
      throw new Error(errorMsg);
    }

    if (!currentStore?.id) throw new Error("Cannot find store id");
    if (!dataContainer?.products)
      throw new Error("Cannot find data-container products");

    try {
      const storeId: string = currentStore?.id;
      if (!storeId) throw new Error("Could not find your store");
      const parts = storeId.split("q-store-general-");
      const shortStoreId = parts[1];

      if (!currentStore) throw new Error("Could not find your store");
      // Get last index catalogue inside data container catalogues array
      const lastCatalogue: CatalogueDataContainer | undefined =
        dataContainer?.catalogues?.at(-1);
      let catalogue = null;
      const listOfCataloguesToPublish: Catalogue[] = [];
      // Initialize dataContainer to publish
      const dataContainerToPublish: DataContainer = {
        ...dataContainer,
        products: structuredClone(dataContainer.products),
        catalogues: structuredClone(dataContainer.catalogues)
      };

      if (lastCatalogue && Object.keys(lastCatalogue?.products)?.length < 10) {
        // fetch last catalogue on QDN
        const catalogueResponse = await qortalRequest({
          action: "FETCH_QDN_RESOURCE",
          name: name,
          service: "DOCUMENT",
          identifier: lastCatalogue.id
        });
        if (catalogueResponse && !catalogueResponse?.error)
          catalogue = catalogueResponse;
      }
      // If catalogue was found on QDN, add it to the list of catalogues to publish when it has less than 10 products
      if (catalogue) listOfCataloguesToPublish.push(catalogue);

      // Loop through productsToSave and add them to the catalogue if it has less than 10 products, otherwise create a new catalogue
      Object.keys(productsToSave)
        .filter((item) => !productsToSave[item]?.isUpdate)
        .forEach((key) => {
          const product = productsToSave[key];
          const priceInQort = product?.price?.find(
            (item: Price) => item?.currency === "qort"
          )?.value;
          if (!priceInQort)
            throw new Error("Cannot find price for one of your products");

          const lastCatalogueInList = listOfCataloguesToPublish.at(-1);
          if (
            lastCatalogueInList &&
            Object.keys(lastCatalogueInList?.products)?.length < 10
          ) {
            const copyLastCatalogue = { ...lastCatalogueInList };
            copyLastCatalogue.products[key] = product;
            dataContainerToPublish.products[key] = {
              created: product.created,
              priceQort: priceInQort,
              category: product?.category || "",
              catalogueId: copyLastCatalogue.id,
              status: AVAILABLE
            };
            if (!dataContainerToPublish.catalogues)
              dataContainerToPublish.catalogues = [];
            // Determine if data container's catalogue has products
            const findCatalogueInDataContainer =
              dataContainerToPublish.catalogues.findIndex(
                (item) => item.id === copyLastCatalogue.id
              );
            if (findCatalogueInDataContainer >= 0) {
              dataContainerToPublish.catalogues[
                findCatalogueInDataContainer
              ].products[key] = true;
            } else {
              dataContainerToPublish.catalogues = [
                ...dataContainerToPublish.catalogues,
                {
                  id: copyLastCatalogue.id,
                  products: {
                    [key]: true
                  }
                }
              ];
            }
          } else {
            // Create new catalogue
            const uidGenerator = uid();
            const catalogueId = `q-store-catalogue-${shortStoreId}-${uidGenerator}`;
            listOfCataloguesToPublish.push({
              id: catalogueId,
              products: {
                [key]: product
              }
            });
            try {
              dataContainerToPublish.products[key] = {
                created: product.created,
                priceQort: priceInQort,
                category: product?.category || "",
                catalogueId,
                status: AVAILABLE
              };
            } catch (error) {
              console.log("my error", error);
            }

            if (!dataContainerToPublish.catalogues)
              dataContainerToPublish.catalogues = [];

            const findCatalogueInDataContainer =
              dataContainerToPublish.catalogues.findIndex(
                (item) => item.id === catalogueId
              );
            // Determine if data container's catalogue has products
            if (findCatalogueInDataContainer >= 0) {
              dataContainerToPublish.catalogues[
                findCatalogueInDataContainer
              ].products[key] = true;
            } else {
              dataContainerToPublish.catalogues = [
                ...dataContainerToPublish.catalogues,
                {
                  id: catalogueId,
                  products: {
                    [key]: true
                  }
                }
              ];
            }
          }
        });
      // Update products when sending productsToSave inside existing data container
      const productsToUpdate = Object.keys(productsToSave)
        .filter((item) => !!productsToSave[item]?.isUpdate)
        .map((key) => productsToSave[key]);
      for (const product of productsToUpdate) {
        const priceInQort = product?.price?.find(
          (item: Price) => item?.currency === "qort"
        )?.value;
        if (!priceInQort)
          throw new Error("Cannot find price for one of your products");

        dataContainerToPublish.products[product.id] = {
          created: product.created,
          priceQort: priceInQort,
          category: product?.category || "",
          catalogueId: product.catalogueId,
          status: product?.status || ""
        };
        // Replace product from listOfCataloguesToPublish with updated product
        const findCatalogueFromExistingList =
          listOfCataloguesToPublish.findIndex(
            (cat) => cat.id === product.catalogueId
          );
        if (findCatalogueFromExistingList >= 0) {
          listOfCataloguesToPublish[findCatalogueFromExistingList].products[
            product.id
          ] = product;
        } else {
          // Otherwise fetch catalogue from QDN and add product to it
          const catalogueResponse = await qortalRequest({
            action: "FETCH_QDN_RESOURCE",
            name: name,
            service: "DOCUMENT",
            identifier: product.catalogueId
          });
          if (catalogueResponse && !catalogueResponse?.error) {
            const copiedCatalogue = structuredClone(catalogueResponse);
            copiedCatalogue.products[product.id] = product;
            listOfCataloguesToPublish.push(copiedCatalogue);
          }
        }
      }

      if (!currentStore) return;
      let publishMultipleCatalogues = [];
      // Loop through listOfCataloguesToPublish and publish the base64 converted object to QDN
      for (const catalogue of listOfCataloguesToPublish) {
        const catalogueToBase64 = await objectToBase64(catalogue);
        const publish = {
          name,
          service: "DOCUMENT",
          identifier: catalogue.id,
          filename: "catalogue.json",
          data64: catalogueToBase64
        };
        publishMultipleCatalogues.push(publish);
      }
      // Convert dataContainer being published to base64
      const dataContainerToBase64 = await objectToBase64(
        dataContainerToPublish
      );
      const publishDataContainer = {
        name,
        service: "DOCUMENT",
        identifier: dataContainerToPublish.id,
        filename: "datacontainer.json",
        data64: dataContainerToBase64
      };
      // Publish the catalogues and the data container to QDN. Remember that there can be multiple catalogues because each catalogue holds a maximum of 10 products. Therefore, if you're publishing multiple products, you will possibly fill up the last catalogue, before then creating a new one.
      const multiplePublish = {
        action: "PUBLISH_MULTIPLE_QDN_RESOURCES",
        resources: [...publishMultipleCatalogues, publishDataContainer]
      };
      await qortalRequest(multiplePublish);

      dispatch(
        setNotification({
          msg: "Products saved",
          alertType: "success"
        })
      );
      // Error handling
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

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValueTab(newValue);
  };

  // Confirmation to delete product from productsToSave
  const { Modal, showModal } = useConfirmationModal({
    title: "Remove Product from List To Save to the Shop",
    message: "Are you sure you want to proceed?"
  });

  const handleRemoveConfirmation = async (key: string) => {
    const userConfirmed = await showModal();
    if (userConfirmed) {
      // User confirmed action
      dispatch(removeFromProductsToSave(key));
    }
  };

  const { getOrders, getProducts } = useFetchOrders();

  const handleGetOrders = React.useCallback(async () => {
    await getOrders();
  }, [getOrders]);

  const handleGetProducts = React.useCallback(async () => {
    await getProducts();
  }, [getProducts]);

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        flexDirection: "column",
        backgroundColor: "background.paper"
      }}
    >
      <TabsContainer>
        <BackToStorefrontButton
          onClick={() => {
            navigate(`/${userName}/${currentStore?.id}}`);
          }}
        >
          Back To Storefront
        </BackToStorefrontButton>
        <StyledTabs
          value={valueTab}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <StyledTab
            sx={{
              "&.Mui-selected": {
                color: theme.palette.text.primary,
                fontWeight: theme.typography.fontWeightMedium
              }
            }}
            label="Orders"
          />
          <StyledTab
            sx={{
              "&.Mui-selected": {
                color: theme.palette.text.primary,
                fontWeight: theme.typography.fontWeightMedium
              }
            }}
            label="Products"
          />
        </StyledTabs>
      </TabsContainer>

      {/* productsToSave card inside Product Manager */}
      {Object.keys(productsToSave).length > 0 && (
        <ProductsToSaveCard>
          {Object.keys(productsToSave).map((key: string) => {
            const product = productsToSave[key];
            const { id } = product;
            return (
              <ProductToSaveCard>
                <CardHeader>{product?.title}</CardHeader>
                <Bulletpoints>
                  <QortalSVG color={"#000000"} height={"22"} width={"22"} />{" "}
                  Price: {product?.price && product?.price[0].value} QORT
                </Bulletpoints>
                <Bulletpoints>
                  <LoyaltySVG color={"#000000"} height={"22"} width={"22"} />
                  Type: {product?.type}
                </Bulletpoints>
                <Bulletpoints>
                  <CategorySVG color={"#000000"} height={"22"} width={"22"} />
                  Category: {product?.category}
                </Bulletpoints>
                <TimesIcon
                  onClickFunc={() => handleRemoveConfirmation(id)}
                  color={"#000000"}
                  height={"22"}
                  width={"22"}
                />
              </ProductToSaveCard>
            );
          })}
          <CardButtonRow>
            <CreateButton onClick={publishQDNResource}>
              Save Products
            </CreateButton>
          </CardButtonRow>
        </ProductsToSaveCard>
      )}

      <TabPanel value={valueTab} index={0}>
        <ShowOrder
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          order={order}
          from="ProductManager"
        />
        <OrderTable
          openOrder={(order) => {
            setOrder(order);
            setIsOpen(true);
          }}
          data={orders}
        ></OrderTable>
        <LazyLoad onLoadMore={handleGetOrders}></LazyLoad>
      </TabPanel>
      <TabPanel value={valueTab} index={1}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%"
          }}
        >
          <NewProduct
            editProduct={productToEdit}
            onClose={() => {
              setProductToEdit(null);
            }}
          />
        </Box>
        <SimpleTable
          openProduct={(product) => {
            setProductToEdit(product);
          }}
          data={products}
        ></SimpleTable>
        <LazyLoad onLoadMore={handleGetProducts}></LazyLoad>
      </TabPanel>
      {/* Confirm Remove Product from productsToSave in global state */}
      <Modal />
    </Box>
  );
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mail-tabs-${index}`}
      aria-labelledby={`mail-tabs-${index}`}
      {...other}
      style={{
        width: "100%"
      }}
    >
      {value === index && children}
    </div>
  );
}
