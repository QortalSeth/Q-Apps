import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Product } from "../state/features/storeSlice";
import { addToHashMap } from "../state/features/orderSlice";

import { RootState } from "../state/store";
import { Order, upsertOrders } from "../state/features/orderSlice";
import { fetchAndEvaluateOrders } from "../utils/fetchOrders";
import {
  Catalogue,
  ProductDataContainer,
  setCatalogueHashMap,
  setIsLoadingGlobal,
  upsertMyOrders,
  upsertProducts
} from "../state/features/globalSlice";
import { fetchAndEvaluateCatalogues } from "../utils/fetchCatalogues";

interface Resource {
  id: string;
  updated: number;
}
export const useFetchOrders = () => {
  const dispatch = useDispatch();
  const hashMapOrders = useSelector(
    (state: RootState) => state.order.hashMapOrders
  );
  const orders = useSelector((state: RootState) => state.order.orders);
  const store = useSelector(
    (state: RootState) => state.global?.currentStore?.id
  );
  const myOrders = useSelector((state: RootState) => state.global.myOrders);

  const products: Product[] = useSelector(
    (state: RootState) => state.global.products
  );
  const listProducts = useSelector(
    (state: RootState) => state.global.listProducts
  );

  const catalogueHashMap = useSelector(
    (state: RootState) => state.global.catalogueHashMap
  );

  const getOrder = async (user: string, orderId: string, content: any) => {
    const res = await fetchAndEvaluateOrders({
      user,
      orderId,
      content
    });

    dispatch(addToHashMap(res));
  };

  const getCatalogue = async (user: string, catalogueId: string) => {
    const res = await fetchAndEvaluateCatalogues({
      user,
      catalogueId
    });
    if (res?.isValid && !catalogueHashMap.hasOwnProperty(catalogueId)) {
      dispatch(setCatalogueHashMap(res));
    }
  };

  const checkAndUpdateResource = React.useCallback(
    (resource: Resource) => {
      // Check if the post exists in hashMapPosts
      const existingResource: Order | undefined = hashMapOrders[resource.id];
      if (!existingResource) {
        // If the post doesn't exist, add it to hashMapPosts
        return true;
      } else if (
        resource?.updated &&
        existingResource?.updated &&
        resource.updated > existingResource.updated
      ) {
        // If the post exists and its updated is more recent than the existing post's updated, update it in hashMapPosts
        return true;
      } else {
        return false;
      }
    },
    [hashMapOrders]
  );

  const checkAndUpdateResourceCatalogue = React.useCallback(
    (resource: { id: string }) => {
      // Check if the post exists in hashMapPosts
      const existingResource: Catalogue | undefined =
        catalogueHashMap[resource.id];
      if (!existingResource) {
        // If the post doesn't exist, add it to hashMapPosts
        return true;
      } else {
        return false;
      }
    },
    [catalogueHashMap]
  );

  const getOrders = React.useCallback(async () => {
    if (!store) return;

    try {
      dispatch(setIsLoadingGlobal(true));
      const offset = orders.length;
      //TODO - NAME SHOULD BE EXACT
      const parts = store.split("q-store-general-");
      const shortStoreId = parts[1];

      const query = `q-store-order-${shortStoreId}`;
      const url = `/arbitrary/resources/search?service=DOCUMENT_PRIVATE&query=${query}&limit=20&includemetadata=true&offset=${offset}&reverse=true`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const responseData = await response.json();

      const structureData = responseData.map((order: any): Order => {
        return {
          created: order?.created,
          updated: order?.updated,
          user: order.name,
          id: order.identifier
        };
      });

      dispatch(upsertOrders(structureData));
      for (const content of structureData) {
        if (content.user && content.id) {
          const res = checkAndUpdateResource(content);
          if (res) {
            getOrder(content.user, content.id, content);
          }
        }
      }
    } catch (error) {
    } finally {
      dispatch(setIsLoadingGlobal(false));
    }
  }, [store, orders]);

  const getMyOrders = React.useCallback(
    async (name: string) => {
      if (!store) return;

      try {
        dispatch(setIsLoadingGlobal(true));
        const offset = orders.length;
        //TODO - NAME SHOULD BE EXACT
        const parts = store.split("q-store-general-");
        const shortStoreId = parts[1];

        const query = `q-store-order-`;
        const url = `/arbitrary/resources/search?service=DOCUMENT_PRIVATE&query=${query}&limit=20&includemetadata=true&offset=${offset}&name=${name}&reverse=true`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        const responseData = await response.json();

        const structureData = responseData.map((order: any): Order => {
          return {
            created: order?.created,
            updated: order?.updated,
            user: order.name,
            id: order.identifier
          };
        });

        dispatch(upsertMyOrders(structureData));
        for (const content of structureData) {
          if (content.user && content.id) {
            const res = checkAndUpdateResource(content);
            if (res) {
              getOrder(content.user, content.id, content);
            }
          }
        }
      } catch (error) {
      } finally {
        dispatch(setIsLoadingGlobal(false));
      }
    },
    [store, myOrders]
  );

  const getProducts = React.useCallback(async () => {
    if (!store) return;
    try {
      dispatch(setIsLoadingGlobal(true));
      const offset = products.length;
      const productList = listProducts.products;
      const responseData = productList.slice(offset, offset + 20);
      console.log("responseData inside getProducts()", responseData);
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

      dispatch(upsertProducts(structureData));
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
      console.error(error);
    } finally {
      dispatch(setIsLoadingGlobal(false));
    }
  }, [products, listProducts]);

  return {
    getOrder,
    hashMapOrders,
    checkAndUpdateResource,
    getOrders,
    getProducts,
    getCatalogue,
    checkAndUpdateResourceCatalogue,
    getMyOrders
  };
};
