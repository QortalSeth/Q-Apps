import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../state/features/authSlice";
import { RootState } from "../state/store";
import CreateStoreModal, {
  onPublishParam
} from "../components/modals/CreateStoreModal";
import EditStoreModal, {
  onPublishParamEdit
} from "../components/modals/EditStoreModal";
import {
  setCurrentStore,
  setDataContainer,
  toggleEditBlogModal,
  toggleCreateStoreModal,
  setIsLoadingGlobal,
  resetProducts,
  resetListProducts
} from "../state/features/globalSlice";
import NavBar from "../components/layout/Navbar/Navbar";
import PageLoader from "../components/common/PageLoader";
import { setNotification } from "../state/features/notificationsSlice";
import ConsentModal from "../components/modals/ConsentModal";
import { objectToBase64 } from "../utils/toBase64";
import { Cart } from "../pages/Cart/Cart";
import {
  Store,
  addToAllMyStores,
  addToHashMapStores,
  addToStores,
  setAllMyStores
} from "../state/features/storeSlice";
import { useFetchStores } from "../hooks/useFetchStores";
interface Props {
  children: React.ReactNode;
  setTheme: (val: string) => void;
}

const GlobalWrapper: React.FC<Props> = ({ children, setTheme }) => {
  const dispatch = useDispatch();

  // Get user from auth
  const user = useSelector((state: RootState) => state.auth.user);
  // Fetch all my stores from global redux
  const myStores = useSelector((state: RootState) => state.store.myStores);
  // Fetch recentlyVisitedStoreId from cart redux
  const recentlyVisitedStoreId = useSelector(
    (state: RootState) => state.global.recentlyVisitedStoreId
  );

  const { getStore, checkAndUpdateResource } = useFetchStores();

  const [userAvatar, setUserAvatar] = useState<string>("");

  const [hasAttemptedToFetchShopInitial, setHasAttemptedToFetchShopInitial] =
    useState(false);

  useEffect(() => {
    if (!user?.name) return;

    getAvatar();
  }, [user?.name]);

  const getAvatar = async () => {
    try {
      let url = await qortalRequest({
        action: "GET_QDN_RESOURCE_URL",
        name: user?.name,
        service: "THUMBNAIL",
        identifier: "qortal_avatar"
      });

      if (url === "Resource does not exist") return;

      setUserAvatar(url);
    } catch (error) {
      console.error(error);
    }
  };

  const {
    isOpenCreateStoreModal,
    currentStore,
    isLoadingGlobal,
    isOpenEditBlogModal
  } = useSelector((state: RootState) => state.global);

  async function getNameInfo(address: string) {
    const response = await fetch("/names/address/" + address);
    const nameData = await response.json();

    if (nameData?.length > 0) {
      return nameData[0].name;
    } else {
      return "";
    }
  }

  async function verifyIfStoreIdExists(username: string, identifier: string) {
    let doesExist = true;
    const url2 = `/arbitrary/resources?service=STORE&identifier=${identifier}&name=${username}&limit=1&includemetadata=true`;
    const responseBlogs = await fetch(url2, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const dataMetadata = await responseBlogs.json();
    if (dataMetadata.length === 0) {
      doesExist = false;
    }
    return doesExist;
  }

  async function getMyCurrentStore(name: string) {
    //TODO NAME SHOULD BE EXACT
    const url = `/arbitrary/resources/search?service=STORE&identifier=q-store-general-&exactmatchnames=true&name=${name}&prefix=true&limit=20&includemetadata=true`;
    const responseBlogs = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const responseDataBlogs = await responseBlogs.json();
    const filterOut = responseDataBlogs.filter((blog: any) =>
      blog.identifier.startsWith("q-store-general-")
    );
    let blog;
    if (filterOut.length === 0) return;
    if (filterOut.length !== 0) {
      blog = filterOut[0];
    }
    const urlBlog = `/arbitrary/STORE/${blog.name}/${blog.identifier}`;
    const response = await fetch(urlBlog, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const responseData = await response.json();

    const urlDataContainer = `/arbitrary/DOCUMENT/${blog.name}/${blog.identifier}-datacontainer`;
    const response2 = await fetch(urlDataContainer, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const responseData2 = await response2.json();
    // Set currentStore in the Redux global state
    dispatch(
      setCurrentStore({
        created: responseData?.created || "",
        id: blog.identifier,
        title: responseData?.title || "",
        location: responseData?.location,
        shipsTo: responseData?.shipsTo,
        description: responseData?.description || "",
        category: blog.metadata?.category,
        tags: blog.metadata?.tags || []
      })
    );
    // Set listProducts in the Redux global state
    if (responseData2 && !responseData2.error) {
      console.log("responseData2", responseData2);
      dispatch(
        setDataContainer({
          ...responseData2,
          id: `${blog.identifier}-datacontainer`
        })
      );
    } else {
      const parts = blog.identifier.split("q-store-general-");
      const shortStoreId = parts[1];
      const dataContainer = {
        storeId: blog.identifier,
        shortStoreId: shortStoreId,
        owner: blog.name,
        products: {}
      };
      const dataContainerToBase64 = await objectToBase64(dataContainer);

      const resourceResponse2 = await qortalRequest({
        action: "PUBLISH_QDN_RESOURCE",
        name: blog.name,
        service: "DOCUMENT",
        data64: dataContainerToBase64,
        identifier: `${blog.identifier}-datacontainer`
      });
    }
  }

  const askForAccountInformation = React.useCallback(async () => {
    try {
      let account = await qortalRequest({
        action: "GET_USER_ACCOUNT"
      });

      const name = await getNameInfo(account.address);
      dispatch(addUser({ ...account, name }));

      const blog = await getMyCurrentStore(name);
      setHasAttemptedToFetchShopInitial(true);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const createStore = React.useCallback(
    async ({
      title,
      description,
      location,
      shipsTo,
      storeIdentifier,
      logo
    }: onPublishParam) => {
      if (!user || !user.name)
        throw new Error("Cannot publish: You do not have a Qortal name");
      if (!title) throw new Error("A title is required");
      if (!description) throw new Error("A description is required");
      if (!location) throw new Error("A location is required");
      if (!shipsTo) throw new Error("Ships to is required");
      const name = user.name;
      let formatStoreIdentifier = storeIdentifier;
      if (formatStoreIdentifier.endsWith("-")) {
        formatStoreIdentifier = formatStoreIdentifier.slice(0, -1);
      }
      if (formatStoreIdentifier.startsWith("-")) {
        formatStoreIdentifier = formatStoreIdentifier.slice(1);
      }
      if (!formatStoreIdentifier) {
        throw new Error("Please insert a valid store id");
      }
      const identifier = `q-store-general-${formatStoreIdentifier}`;
      const doesExist = await verifyIfStoreIdExists(name, identifier);
      if (doesExist) {
        throw new Error("The store identifier already exists");
      }
      // Store Object to send to QDN
      const storeObj = {
        title,
        description,
        location,
        shipsTo,
        created: Date.now(),
        shortStoreId: formatStoreIdentifier,
        logo
      };
      // Store Data Container to send to QDN (this will allow easier querying of products afterwards. Think of it as a database in the redux global state for the current store. Max 1 per store). At first there's no products, but they will be added later.
      const dataContainer = {
        storeId: identifier,
        shortStoreId: formatStoreIdentifier,
        owner: name,
        products: {}
      };
      const blogPostToBase64 = await objectToBase64(storeObj);
      const dataContainerToBase64 = await objectToBase64(dataContainer);
      try {
        // Publish Store to QDN
        const resourceResponse = await qortalRequest({
          action: "PUBLISH_QDN_RESOURCE",
          name: name,
          service: "STORE",
          data64: blogPostToBase64,
          filename: "store.json",
          title,
          description,
          identifier: identifier
        });
        // Publish Data Container to QDN
        const resourceResponse2 = await qortalRequest({
          action: "PUBLISH_QDN_RESOURCE",
          name: name,
          service: "DOCUMENT",
          data64: dataContainerToBase64,
          identifier: `${identifier}-datacontainer`,
          filename: "datacontainer.json"
        });
        await new Promise<void>((res, rej) => {
          setTimeout(() => {
            res();
          }, 1000);
        });
        const createdAt = Date.now();

        // Store data (other than the raw data or metadata) to add to Redux
        const storeData = {
          title: title,
          description: description,
          created: createdAt,
          owner: name,
          id: storeIdentifier,
          logo: logo
        };
        // Store Full Object to send to redux hashMapStores
        const storefullObj = {
          ...storeObj,
          id: identifier,
          isValid: true,
          owner: name,
          created: createdAt,
          updated: createdAt
        };

        dispatch(setCurrentStore(storefullObj));
        dispatch(addToHashMapStores(storefullObj));
        dispatch(addToStores(storefullObj));
        dispatch(
          setDataContainer({
            ...dataContainer,
            id: `${identifier}-datacontainer`
          })
        );
        dispatch(addToAllMyStores(storeData));
        dispatch(
          setNotification({
            msg: "Store successfully created",
            alertType: "success"
          })
        );
      } catch (error: any) {
        let notificationObj: any = null;
        if (typeof error === "string") {
          notificationObj = {
            msg: error || "Failed to create store",
            alertType: "error"
          };
        } else if (typeof error?.error === "string") {
          notificationObj = {
            msg: error?.error || "Failed to create store",
            alertType: "error"
          };
        } else {
          notificationObj = {
            msg: error?.message || "Failed to create store",
            alertType: "error"
          };
        }
        if (!notificationObj) return;
        dispatch(setNotification(notificationObj));
        if (error instanceof Error) {
          throw new Error(error.message);
        } else {
          throw new Error("An unknown error occurred");
        }
      }
    },
    [user]
  );

  const editStore = React.useCallback(
    async ({
      title,
      description,
      location,
      shipsTo,
      logo
    }: onPublishParamEdit) => {
      if (!user || !user.name || !currentStore)
        throw new Error("Cannot publish: You do not have a Qortal name");
      if (!title) throw new Error("A title is required");
      if (!description) throw new Error("A description is required");
      if (!location) throw new Error("A location is required");
      if (!shipsTo) throw new Error("Ships to is required");
      const name = user.name;

      const blogobj = {
        ...currentStore,
        title,
        description,
        location,
        shipsTo,
        logo
      };
      const blogPostToBase64 = await objectToBase64(blogobj);
      try {
        const resourceResponse = await qortalRequest({
          action: "PUBLISH_QDN_RESOURCE",
          name: name,
          service: "STORE",
          data64: blogPostToBase64,
          filename: "store.json",
          title,
          description,
          identifier: currentStore.id
        });

        await new Promise<void>((res, rej) => {
          setTimeout(() => {
            res();
          }, 1000);
        });

        dispatch(setCurrentStore(blogobj));
        dispatch(
          setNotification({
            msg: "Store successfully updated",
            alertType: "success"
          })
        );
      } catch (error: any) {
        let notificationObj: any = null;
        if (typeof error === "string") {
          notificationObj = {
            msg: error || "Failed to update blog",
            alertType: "error"
          };
        } else if (typeof error?.error === "string") {
          notificationObj = {
            msg: error?.error || "Failed to update blog",
            alertType: "error"
          };
        } else {
          notificationObj = {
            msg: error?.message || "Failed to update blog",
            alertType: "error"
          };
        }
        if (!notificationObj) return;
        dispatch(setNotification(notificationObj));
        if (error instanceof Error) {
          throw new Error(error.message);
        } else {
          throw new Error("An unknown error occurred");
        }
      }
    },
    [user, currentStore]
  );

  const onClosePublishBlogModal = React.useCallback(() => {
    dispatch(toggleCreateStoreModal(false));
  }, []);

  const onCloseEditBlogModal = React.useCallback(() => {
    dispatch(toggleEditBlogModal(false));
  }, []);

  // Get my stores
  const getMyStores = async () => {
    if (!user || !user?.name) return;
    try {
      const offset = 0;
      const name = user?.name;
      const url = `/arbitrary/resources/search?service=STORE&name=${name}&limit=20&exactmatchnames=true&mode=ALL&includemetadata=true&offset=${offset}&reverse=true`;
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

      // Add All My Stores to Redux
      dispatch(setAllMyStores(structureData));

      // Get the store raw data from getStore API Call only if the hashmapStore doesn't have my store or if my store is more recently updated than the existing store
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
    } catch (error) {}
  };

  useEffect(() => {
    askForAccountInformation();
  }, []);

  // Fetch My Stores on Mount once Auth Is Complete
  useEffect(() => {
    if (!user?.name) return;
    getMyStores();
  }, [user]);

  // Listener useEffect to fetch dataContainer and store data if store?.id changes and it is ours
  // Make sure myStores is not empty before executing
  // Will only run if storeId changes and is ours within our list of stores
  // If no datacontainer is found, make sure to set it empty in global state
  useEffect(() => {
    if (recentlyVisitedStoreId && myStores) {
      const myStoreFound = myStores.find(
        (store: Store) => store.id === recentlyVisitedStoreId
      );
      if (myStoreFound) {
        try {
          dispatch(setIsLoadingGlobal(true));
          const getStoreAndDataContainer = async () => {
            // Fetch shop data on QDN
            const urlShop = `/arbitrary/STORE/${myStoreFound.owner}/${myStoreFound.id}`;
            const shopData = await fetch(urlShop, {
              method: "GET",
              headers: {
                "Content-Type": "application/json"
              }
            });
            const shopResource = await shopData.json();
            // Clear product list from redux global state
            dispatch(resetListProducts());
            dispatch(
              setCurrentStore({
                created: shopResource?.created || "",
                id: myStoreFound.id,
                title: shopResource?.title || "",
                location: shopResource?.location,
                shipsTo: shopResource?.shipsTo,
                description: shopResource?.description || "",
                category: myStoreFound?.category,
                tags: myStoreFound?.tags || []
              })
            );
            // Fetch data container data on QDN (product resources)
            const urlDataContainer = `/arbitrary/DOCUMENT/${myStoreFound.owner}/${myStoreFound.id}-datacontainer`;
            const response = await fetch(urlDataContainer, {
              method: "GET",
              headers: {
                "Content-Type": "application/json"
              }
            });
            const responseData2 = await response.json();
            if (responseData2 && !responseData2.error) {
              dispatch(
                setDataContainer({
                  ...responseData2,
                  id: `${myStoreFound.id}-datacontainer`
                })
              );
            } else {
              dispatch(setDataContainer(null));
            }
            // Clear product data from redux global state
            dispatch(resetProducts());
          };
          getStoreAndDataContainer();
        } catch (error) {
        } finally {
          dispatch(setIsLoadingGlobal(false));
        }
      }
    }
  }, [recentlyVisitedStoreId, myStores]);

  return (
    <>
      {isLoadingGlobal && <PageLoader />}
      {isOpenCreateStoreModal && user?.name && (
        <CreateStoreModal
          open={isOpenCreateStoreModal}
          onClose={onClosePublishBlogModal}
          onPublish={createStore}
          username={user?.name || ""}
        />
      )}
      <EditStoreModal
        open={isOpenEditBlogModal}
        onClose={onCloseEditBlogModal}
        onPublish={editStore}
        currentStore={currentStore}
        username={user?.name || ""}
      />
      <NavBar
        setTheme={(val: string) => setTheme(val)}
        isAuthenticated={!!user?.name}
        userName={user?.name || ""}
        userAvatar={userAvatar}
        authenticate={askForAccountInformation}
        hasAttemptedToFetchShopInitial={hasAttemptedToFetchShopInitial}
      />
      <ConsentModal />
      {/* Cart opens when setIsOpen action is dispatched to Redux Global State */}
      <Cart />
      {children}
    </>
  );
};

export default GlobalWrapper;
