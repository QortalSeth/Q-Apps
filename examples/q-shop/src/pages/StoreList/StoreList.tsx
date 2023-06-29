import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import LazyLoad from "../../components/common/LazyLoad";
import ContextMenuResource from "../../components/common/ContextMenu/ContextMenuResource";
import { setIsLoadingGlobal } from "../../state/features/globalSlice";
import { Store } from "../../state/features/storeSlice";
import { useFetchStores } from "../../hooks/useFetchStores";
import {
  StoreCard,
  StoreCardDescription,
  StoreCardImage,
  StoreCardImageContainer,
  StoreCardInfo,
  StoreCardOwner,
  StoreCardTitle,
  StoreCardYouOwn,
  StoresContainer,
  StoresRow,
  MyStoresRow,
  MyStoresCard,
  MyStoresCheckbox
} from "./StoreList-styles";
import DefaultStoreImage from "../../assets/img/Q-AppsLogo.webp";
import { StarSVG } from "../../assets/svgs/StarSVG";
interface BlogListProps {
  mode?: string;
}
export const StoreList = ({ mode }: BlogListProps) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [stores, setStores] = useState<Store[]>([]);
  const [filterUserStores, setFilterUserStores] = useState<boolean>(false);
  // TODO: Need skeleton at first while the data is being fetched
  // Will rerender and replace if the hashmap wasn't found initially
  const hashMapStores = useSelector(
    (state: RootState) => state.store.hashMapStores
  );

  // Fetch My Stores from Redux
  const { myStores } = useSelector((state: RootState) => state.store);
  const { getStore, checkAndUpdateResource } = useFetchStores();
  const navigate = useNavigate();

  const getUserStores = useCallback(async () => {
    try {
      dispatch(setIsLoadingGlobal(true));
      const offset = stores.length;
      //TODO - NAME SHOULD BE EXACT
      const query = `q-store-general`;
      const url = `/arbitrary/resources/search?service=STORE&query=${query}&limit=20&exactmatchnames=true&includemetadata=true&offset=${offset}&reverse=true`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const responseData = await response.json();
      // Data returned from that endpoint of the API
      const structureData = responseData.map((storeItem: any): Store => {
        return {
          title: storeItem?.metadata?.title,
          category: storeItem?.metadata?.category,
          categoryName: storeItem?.metadata?.categoryName,
          tags: storeItem?.metadata?.tags || [],
          description: storeItem?.metadata?.description,
          created: storeItem.created,
          updated: storeItem.updated,
          owner: storeItem.name,
          id: storeItem.identifier
        };
      });
      // Add stores to localstate & guard against duplicates
      const copiedStores: Store[] = [...stores];
      structureData.forEach((storeItem: Store) => {
        const index = stores.findIndex((p: Store) => p.id === storeItem.id);
        if (index !== -1) {
          copiedStores[index] = storeItem;
        } else {
          copiedStores.push(storeItem);
        }
      });
      setStores(copiedStores);
      // Get the store raw data from getStore API Call only if the hashmapStore doesn't have the store or if the store is more recently updated than the existing store
      for (const content of structureData) {
        if (content.owner && content.id) {
          const res = checkAndUpdateResource({
            id: content.id,
            updated: content.updated
          });
          if (res) {
            getStore(content.owner, content.id, content);
          }
        }
      }
    } catch (error) {
    } finally {
      dispatch(setIsLoadingGlobal(false));
    }
  }, [stores]);

  // Get all stores on mount or if user changes

  const getStores = useCallback(async () => {
    await getUserStores();
  }, [getUserStores, user?.name]);

  // Filter to show only the user's stores

  const handleFilterUserStores = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilterUserStores(event.target.checked);
  };

  const filteredStores = useMemo(() => {
    if (filterUserStores) {
      return myStores;
    } else {
      return stores;
    }
  }, [filterUserStores, stores, myStores, user?.name]);
  return (
    <>
      <StoresContainer container>
        {user && (
          <MyStoresRow>
            <MyStoresCard>
              <MyStoresCheckbox
                checked={filterUserStores}
                onChange={handleFilterUserStores}
                inputProps={{ "aria-label": "controlled" }}
              />
              See My Stores
            </MyStoresCard>
          </MyStoresRow>
        )}
        {filteredStores.map((store: Store, index) => {
          let storeItem = store;
          const existingStore = hashMapStores[store.id];
          // Check in case hashmap data isn't there yet due to async API calls.
          // If it's not there, component will rerender once it receives the metadata
          if (existingStore) {
            storeItem = existingStore;
          }
          const storeId = storeItem?.id || "";
          const storeOwner = storeItem?.owner || "";
          const storeTitle = storeItem?.title || "missing metadata";
          const storeLogo = storeItem?.logo || DefaultStoreImage;
          const storeDescription = storeItem?.description || "missing metadata";
          return (
            <StoresRow item key={storeId}>
              <ContextMenuResource
                name={storeOwner}
                service="STORE"
                identifier={storeId}
                link={`qortal://APP/Q-Store/${storeOwner}/${storeId}`}
              >
                <StoreCard
                  container
                  onClick={() => navigate(`/${storeOwner}/${storeId}`)}
                >
                  <StoreCardImageContainer item>
                    <StoreCardImage src={storeLogo} alt={storeTitle} />
                  </StoreCardImageContainer>
                  <StoreCardInfo item>
                    <StoreCardTitle>{storeTitle}</StoreCardTitle>
                    <StoreCardDescription>
                      {storeDescription}
                    </StoreCardDescription>
                  </StoreCardInfo>
                  <StoreCardOwner>{storeOwner}</StoreCardOwner>
                  {storeOwner === user?.name && (
                    <StoreCardYouOwn>
                      <StarSVG color={"#fbff2a"} width={"20"} height={"20"} />
                      You own this store
                    </StoreCardYouOwn>
                  )}
                </StoreCard>
              </ContextMenuResource>
            </StoresRow>
          );
        })}
      </StoresContainer>
      <LazyLoad onLoadMore={getStores}></LazyLoad>
    </>
  );
};
