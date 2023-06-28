import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { useParams } from "react-router-dom";
import { useTheme, Grid, CircularProgress } from "@mui/material";
import {
  resetListProducts,
  setCurrentStore,
  setIsLoadingGlobal,
  updateRecentlyVisitedStoreId
} from "../../state/features/globalSlice";
import { Product } from "../../state/features/storeSlice";
import { useFetchProducts } from "../../hooks/useFetchProducts";
import LazyLoad from "../../components/common/LazyLoad";
import ContextMenuResource from "../../components/common/ContextMenu/ContextMenuResource";
import { setStoreId, setStoreOwner } from "../../state/features/cartSlice";
import { ProductCard } from "./ProductCard";
import { ProductDataContainer } from "../../state/features/globalSlice";
import { useFetchOrders } from "../../hooks/useFetchOrders";
import {
  ProductManagerRow,
  ProductManagerButton,
  BackToStorefrontButton,
  ProductsContainer,
  NoProductsContainer,
  NoProductsText,
  StoreControlsRow,
  EditStoreButton
} from "./Store-styles";
import { toggleEditBlogModal } from "../../state/features/globalSlice";
interface IListProducts {
  sort: string;
  products: ProductDataContainer[];
  categories: string[];
}
export const Store = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const currentStore = useSelector(
    (state: RootState) => state.global.currentStore
  );
  const { isLoadingGlobal } = useSelector((state: RootState) => state.global);

  const { checkAndUpdateResourceCatalogue, getCatalogue } = useFetchOrders();
  const { store, user: username } = useParams();

  const catalogueHashMap = useSelector(
    (state: RootState) => state.global.catalogueHashMap
  );
  const dispatch = useDispatch();
  const { getProduct, hashMapProducts, checkAndUpdateResource } =
    useFetchProducts();

  const [userStore, setUserStore] = React.useState<any>(null);
  const [dataContainer, setDataContainer] = useState(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [listProducts, setListProducts] = useState<IListProducts>({
    sort: "created",
    products: [],
    categories: []
  });

  const getProducts = React.useCallback(async () => {
    if (!store) return;
    try {
      dispatch(setIsLoadingGlobal(true));
      const offset = products.length;
      const productList = listProducts.products;
      const responseData = productList.slice(offset, offset + 20);
      const structureData = responseData.map(
        (product: ProductDataContainer): Product => {
          return {
            created: product?.created,
            catalogueId: product.catalogueId,
            id: product?.productId || "",
            user: product?.user || "",
            status: product?.status || ""
          };
        }
      );
      const copiedProducts = [...products];
      structureData.forEach((product: Product) => {
        const index = copiedProducts.findIndex((p) => p.id === product.id);
        if (index !== -1) {
          copiedProducts[index] = product;
        } else {
          copiedProducts.push(product);
        }
      });
      console.log({ copiedProducts });
      setProducts(copiedProducts);

      for (const content of structureData) {
        if (content.user && content.id) {
          const res = checkAndUpdateResourceCatalogue({
            id: content.catalogueId
          });
          if (res) {
            getCatalogue(content.user, content.catalogueId);
          }
        }
      }
    } catch (error) {
    } finally {
      dispatch(setIsLoadingGlobal(false));
    }
  }, [products, listProducts]);

  // Get store on mount & setCurrentStore when it's your own store
  const getStore = React.useCallback(async () => {
    let name = username;
    if (!name) return;
    if (!store) return;

    try {
      dispatch(setIsLoadingGlobal(true));
      let myStore;
      const url = `/arbitrary/resources/search?service=STORE&identifier=${store}&exactmatchnames=true&name=${name}&includemetadata=true`;
      const info = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const responseDataStore = await info.json();
      const filterOut = responseDataStore.filter((store: any) =>
        store.identifier.startsWith("q-store-general-")
      );
      if (filterOut.length === 0) return;
      if (filterOut.length !== 0) {
        // Get first element since it returns an array of stores
        myStore = filterOut[0];
      }

      const urlStore = `/arbitrary/STORE/${name}/${store}`;
      const resource = await fetch(urlStore, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const responseData = await resource.json();
      // Dispatch userStore to local state now that you have the info/metadata & resource
      setUserStore({
        created: responseData?.created || "",
        id: myStore.identifier,
        title: responseData?.title || "",
        location: responseData?.location,
        shipsTo: responseData?.shipsTo,
        description: responseData?.description || "",
        category: myStore.metadata?.category,
        tags: myStore.metadata?.tags || [],
        logo: responseData?.logo || ""
      });
      const urlDatacontainer = `/arbitrary/DOCUMENT/${name}/${store}-datacontainer`;
      const responseContainer = await fetch(urlDatacontainer, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      // Set dataContainer locally to do filtering in the future since it cannot be done on QDN at the moment
      const responseDataContainer = await responseContainer.json();
      setDataContainer({
        ...responseDataContainer,
        id: `${store}-datacontainer`
      });
      let categories: any = {};
      const mappedProducts = Object.keys(responseDataContainer.products)
        .map((key) => {
          const category = responseDataContainer?.products[key]?.category;
          if (category) {
            categories[category] = true;
          }
          return {
            ...responseDataContainer.products[key],
            productId: key,
            user: responseDataContainer.owner
          };
        })
        .sort((a, b) => b.created - a.created);
      // Setting list products locally
      setListProducts({
        sort: "created",
        products: mappedProducts,
        categories: Object.keys(categories).map((cat) => cat)
      });
      dispatch(resetListProducts());
      dispatch(setStoreId(store));
      dispatch(updateRecentlyVisitedStoreId(store));
      dispatch(setStoreOwner(name));
    } catch (error) {
    } finally {
      dispatch(setIsLoadingGlobal(false));
    }
  }, [username, store, dataContainer]);

  // Get Store and set it in local state
  useEffect(() => {
    setProducts([]);
    setUserStore(null);
    getStore();
  }, [username, store]);

  const getProductsHandler = React.useCallback(async () => {
    await getProducts();
  }, [getProducts]);

  if (!userStore) return null;
  if (isLoadingGlobal) return <CircularProgress />;
  return (
    <>
      <ProductManagerRow>
        <BackToStorefrontButton
          onClick={() => {
            navigate("/");
          }}
        >
          Back To All Shops
        </BackToStorefrontButton>
        {username === user?.name && (
          <StoreControlsRow>
            <EditStoreButton
              onClick={() => {
                dispatch(toggleEditBlogModal(true));
              }}
            >
              Edit Shop
            </EditStoreButton>
            <ProductManagerButton
              onClick={() => {
                navigate(`/product-manager/${store}`);
              }}
            >
              Product Manager
            </ProductManagerButton>
          </StoreControlsRow>
        )}
      </ProductManagerRow>
      <ProductsContainer container sx={{}}>
        {products.length > 0 ? (
          products.map((product: Product, index) => {
            let existingProduct = product;
            if (
              catalogueHashMap[product?.catalogueId] &&
              catalogueHashMap[product.catalogueId].products[product?.id]
            ) {
              existingProduct = {
                ...product,
                ...catalogueHashMap[product.catalogueId].products[product?.id],
                catalogueId: product?.catalogueId || ""
              };
            }
            const storeId = currentStore?.id || "";
            return (
              <Grid
                xs={12}
                sm={6}
                md={4}
                lg={3}
                item
                key={existingProduct.id}
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  width: "auto",
                  position: "relative",
                  " @media (max-width: 450px)": {
                    width: "100%"
                  }
                }}
              >
                <ContextMenuResource
                  name={existingProduct.user}
                  service="PRODUCT"
                  identifier={existingProduct.id}
                  link={`qortal://APP/Q-Shop/${existingProduct.user}/${storeId}/${existingProduct.id}`}
                >
                  <ProductCard product={existingProduct} />
                </ContextMenuResource>
              </Grid>
            );
          })
        ) : products.length === 0 && username === user?.name ? (
          <NoProductsContainer>
            <NoProductsText>
              You currently have no products! Add some in the Product Manager.
            </NoProductsText>
          </NoProductsContainer>
        ) : (
          <NoProductsContainer>
            <NoProductsText>
              There are currently no products for sale!
            </NoProductsText>
          </NoProductsContainer>
        )}
      </ProductsContainer>
      <LazyLoad onLoadMore={getProductsHandler}></LazyLoad>
    </>
  );
};
