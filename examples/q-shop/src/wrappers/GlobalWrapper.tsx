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
  toggleEditStoreModal,
  toggleCreateStoreModal,
  setIsLoadingGlobal,
  resetProducts,
  resetListProducts,
  DataContainer,
  ProductDataContainer,
  updateRecentlyVisitedStoreId,
  clearDataCotainer
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
import { DATA_CONTAINER_BASE, STORE_BASE } from "../constants/identifiers";
import { ReusableModal } from "../components/modals/ReusableModal";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { CustomModalButton, CustomModalTitle } from "./GlobalWrapper-styles";
interface Props {
  children: React.ReactNode;
  setTheme: (val: string) => void;
}
interface ShortDataContainer {
  storeId: string;
  shortStoreId: string;
  owner: string;
  products: Record<string, ProductDataContainer>;
}

const GlobalWrapper: React.FC<Props> = ({ children, setTheme }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user from auth
  const user = useSelector((state: RootState) => state.auth.user);
  // Fetch all my stores from global redux
  const myStores = useSelector((state: RootState) => state.store.myStores);
  // Fetch recentlyVisitedStoreId from cart redux
  const recentlyVisitedStoreId = useSelector(
    (state: RootState) => state.global.recentlyVisitedStoreId
  );
  // Open create & edit shop modals
  const isOpenCreateStoreModal = useSelector(
    (state: RootState) => state.global.isOpenCreateStoreModal
  );
  const isOpenEditStoreModal = useSelector(
    (state: RootState) => state.global.isOpenEditStoreModal
  );
  // Get current store from global store
  const currentStore = useSelector(
    (state: RootState) => state.global.currentStore
  );
  // Loading global state
  const isLoadingGlobal = useSelector(
    (state: RootState) => state.global.isLoadingGlobal
  );
  const userOwnDataContainer = useSelector(
    (state: RootState) => state.global.dataContainer
  );

  const { getStore, checkAndUpdateResource } = useFetchStores();

  const [userAvatar, setUserAvatar] = useState<string>("");
  const [closeCreateStoreModal, setCloseCreateStoreModal] =
    useState<boolean>(false);
  const [hasAttemptedToFetchShopInitial, setHasAttemptedToFetchShopInitial] =
    useState<boolean>(false);
  const [storedDataContainer, setStoredDataContainer] =
    useState<ShortDataContainer | null>(null);
  const [openDataContainerModal, setOpenDataContainer] =
    useState<boolean>(false);
  const [retryDataContainer, setRetryDataContainer] = useState<boolean>(false);

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

  async function getNameInfo(address: string) {
    const response = await fetch("/names/address/" + address);
    const nameData = await response.json();

    if (nameData?.length > 0) {
      return nameData[0].name;
    } else {
      return "";
    }
  }

  // Function to determine if the response is successful for a PUBLISH_QDN_RESOURCE request
  function isSuccessful(response: any) {
    return (
      response && response.type && response.timestamp && response.signature
    );
  }

  async function verifyIfStoreIdExists(username: string, identifier: string) {
    let doesExist = true;
    const url2 = `/arbitrary/resources?service=STORE&identifier=${identifier}&exactmatchnames=true&name=${username}&limit=1&includemetadata=true`;
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
    const url = `/arbitrary/resources/search?service=STORE&identifier=${STORE_BASE}-&exactmatchnames=true&name=${name}&prefix=true&limit=20&includemetadata=false`;
    const responseBlogs = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const responseDataBlogs = await responseBlogs.json();
    const filterOut = responseDataBlogs.filter((blog: any) =>
      blog.identifier.startsWith(`${STORE_BASE}-`)
    );
    let store;
    if (filterOut.length === 0) return;
    if (filterOut.length !== 0) {
      store = filterOut[0];
    }
    const urlBlog = `/arbitrary/STORE/${store.name}/${store.identifier}`;
    const response = await fetch(urlBlog, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const responseData = await response.json();

    const urlDataContainer = `/arbitrary/DOCUMENT/${store.name}/${store.identifier}-${DATA_CONTAINER_BASE}`;
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
        id: store.identifier,
        title: responseData?.title || "",
        location: responseData?.location,
        shipsTo: responseData?.shipsTo,
        description: responseData?.description || "",
        category: store.metadata?.category,
        tags: store.metadata?.tags || [],
        logo: responseData?.logo || "",
        shortStoreId: responseData?.shortStoreId
      })
    );
    // Set listProducts in the Redux global state
    if (responseData2 && !responseData2.error) {
      dispatch(
        setDataContainer({
          ...responseData2,
          id: `${store.identifier}-${DATA_CONTAINER_BASE}`
        })
      );
    } else {
      const parts = store.identifier.split(`${STORE_BASE}-`);
      const shortStoreId = parts[1];
      const dataContainer: ShortDataContainer = {
        storeId: store.identifier,
        shortStoreId: shortStoreId,
        owner: store.name,
        products: {}
      };
      const dataContainerToBase64 = await objectToBase64(dataContainer);

      const resourceResponse2 = await qortalRequest({
        action: "PUBLISH_QDN_RESOURCE",
        name: store.name,
        service: "DOCUMENT",
        data64: dataContainerToBase64,
        identifier: `${store.identifier}-${DATA_CONTAINER_BASE}`
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

  const handlePublishDataContainer = React.useCallback(async () => {
    try {
      const dataContainerToBase64 = await objectToBase64(storedDataContainer);
      // Publish Data Container to QDN
      const resourceResponse = await qortalRequest({
        action: "PUBLISH_QDN_RESOURCE",
        name: storedDataContainer?.owner,
        service: "DOCUMENT",
        data64: dataContainerToBase64,
        identifier: `${storedDataContainer?.storeId}-${DATA_CONTAINER_BASE}`,
        filename: "datacontainer.json"
      });
      if (isSuccessful(resourceResponse)) {
        await new Promise<void>((res, rej) => {
          setTimeout(() => {
            res();
          }, 1000);
        });
        dispatch(
          setDataContainer({
            ...storedDataContainer,
            id: `${storedDataContainer?.storeId}-${DATA_CONTAINER_BASE}`
          })
        );
        dispatch(
          setNotification({
            msg: "Shop successfully created",
            alertType: "success"
          })
        );
        setCloseCreateStoreModal(true);
        setRetryDataContainer(false);
        setOpenDataContainer(false);
      } else {
        setOpenDataContainer(true);
      }
    } catch (error) {
      console.error(error);
      dispatch(
        setNotification({
          msg: "You must create a data container in order to create a shop!",
          alertType: "error"
        })
      );
      // Try again after 8 seconds automatically
      setOpenDataContainer(true);
      let interval: number | undefined = undefined;
      const dataContainerToBase64 = await objectToBase64(storedDataContainer);
      interval = window.setInterval(async () => {
        try {
          const resourceResponse = await qortalRequest({
            action: "PUBLISH_QDN_RESOURCE",
            name: storedDataContainer?.owner,
            service: "DOCUMENT",
            data64: dataContainerToBase64,
            identifier: `${storedDataContainer?.storeId}-${DATA_CONTAINER_BASE}`,
            filename: "datacontainer.json"
          });
          if (isSuccessful(resourceResponse)) {
            await new Promise<void>((res, rej) => {
              setTimeout(() => {
                res();
              }, 1000);
            });
            dispatch(
              setDataContainer({
                ...storedDataContainer,
                id: `${storedDataContainer?.storeId}-${DATA_CONTAINER_BASE}`
              })
            );
            dispatch(
              setNotification({
                msg: "Shop successfully created",
                alertType: "success"
              })
            );
            setCloseCreateStoreModal(true);
            setRetryDataContainer(false);
            setOpenDataContainer(false);
            clearInterval(interval);
          }
        } catch (error) {
          console.error(error);
          setRetryDataContainer(false);
          // clear interval
          if (interval) {
            clearInterval(interval);
          }
          dispatch(
            setNotification({
              msg: "You must create a data container in order to create a shop!",
              alertType: "error"
            })
          );
        }
      }, 8000);
    }
  }, [storedDataContainer]);

  // If they successfully create a store but not a data container, keep the data-container information in the state.
  // Wait 8 seconds and try again automatically. If it fails again, then tell them to republish again.
  // Have another variable to keep track of that. Keep the modal open. If they successfully create a store and a data container, then close the modal and delete the data container from the state. Inside the modal, tell them to republish again if it failed, and that there was an error in step 2. Cannot close the modal, setNotification that you need to publish again, that they need to complete the store or else the store won't function properly.
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
      formatStoreIdentifier.trim();
      if (!formatStoreIdentifier) {
        throw new Error("Please insert a valid store id");
      }
      const identifier = `${STORE_BASE}-${formatStoreIdentifier}`;
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
      if (!storeObj.shortStoreId) {
        throw new Error("Please insert a valid store id");
      }
      const storeToBase64 = await objectToBase64(storeObj);
      // Store Data Container to send to QDN (this will allow easier querying of products afterwards. Think of it as a database in the redux global state for the current store. Max 1 per store). At first there's no products, but they will be added later. We store this in the state so we can reuse it easily if our data container fails to publish.
      try {
        // Publish Store to QDN
        const resourceResponse = await qortalRequest({
          action: "PUBLISH_QDN_RESOURCE",
          name: name,
          service: "STORE",
          data64: storeToBase64,
          filename: "store.json",
          title,
          description,
          identifier: identifier
        });
        if (isSuccessful(resourceResponse)) {
          await new Promise<void>((res, rej) => {
            setTimeout(() => {
              res();
            }, 1000);
          });
          const createdAt = Date.now();
          const dataContainer = {
            storeId: identifier,
            shortStoreId: formatStoreIdentifier,
            owner: name,
            products: {}
          };
          // Store data (other than the raw data or metadata) to add to Redux
          const storeData = {
            title: title,
            description: description,
            created: createdAt,
            owner: name,
            id: storeIdentifier,
            shortStoreId: formatStoreIdentifier,
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
          dispatch(addToAllMyStores(storeData));
          setStoredDataContainer(dataContainer);
          setRetryDataContainer(true);
        } else {
          throw new Error("Failed to create store");
        }
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
          console.error(error);
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
      if (!currentStore.id) throw new Error("Store id is required");
      const name = user.name;

      const parts: string[] = currentStore.id.split(`${STORE_BASE}-`);
      const shortStoreId: string = parts[1];

      // Add shortStoreId to the store object if it doesn't exist. This was added because of a previous bug where we weren't adding
      const storeObj = {
        ...currentStore,
        title,
        description,
        location,
        shipsTo,
        logo,
        shortStoreId: currentStore.shortStoreId ?? shortStoreId
      };

      const storeToBase64 = await objectToBase64(storeObj);
      try {
        const resourceResponse = await qortalRequest({
          action: "PUBLISH_QDN_RESOURCE",
          name: name,
          service: "STORE",
          data64: storeToBase64,
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

        dispatch(setCurrentStore(storeObj));
        dispatch(
          setNotification({
            msg: "Shop successfully updated",
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

  const onCloseEditStoreModal = React.useCallback(() => {
    dispatch(toggleEditStoreModal(false));
  }, []);

  // Get my stores
  const getMyStores = async () => {
    if (!user || !user?.name) return;
    try {
      const name = user?.name;
      const query = STORE_BASE;
      const url = `/arbitrary/resources/search?service=STORE&name=${name}&query=${query}&limit=20&prefix=true&exactmatchnames=true&mode=ALL&includemetadata=false&reverse=true`;
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
    } catch (error) {
      console.error(error);
    }
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
  // Will only run if storeId changes, or the reduxDataContainer and is ours within our list of stores
  // If currentStore.id is equal to recentlyVisitedStoreId, it means we already have the datacontainer and store data in redux, so we don't need to fetch it again
  // If no datacontainer is found, see if it exists. If it doesn't, ask user to create it and don't let them into their store without doing so.
  useEffect(() => {
    if (recentlyVisitedStoreId && myStores.length > 0) {
      const myStoreFound = myStores.find(
        (store: Store) => store.id === recentlyVisitedStoreId
      );
      if (
        myStoreFound &&
        (recentlyVisitedStoreId !== currentStore?.id || !userOwnDataContainer)
      ) {
        try {
          dispatch(setIsLoadingGlobal(true));
          const getStoreAndDataContainer = async () => {
            // Fetch shop raw data on QDN
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
                tags: myStoreFound?.tags || [],
                logo: shopResource?.logo,
                shortStoreId: shopResource?.shortStoreId
              })
            );
            // Fetch data container data on QDN (product resources)
            const urlDataContainer = `/arbitrary/DOCUMENT/${myStoreFound?.owner}/${myStoreFound?.id}-${DATA_CONTAINER_BASE}`;
            const response = await fetch(urlDataContainer, {
              method: "GET",
              headers: {
                "Content-Type": "application/json"
              }
            });
            const responseData2 = await response.json();
            if (
              responseData2 &&
              !responseData2.error &&
              responseData2?.storeId
            ) {
              dispatch(
                setDataContainer({
                  ...responseData2,
                  id: `${myStoreFound.id}-${DATA_CONTAINER_BASE}`
                })
              );
            } else if (user?.name && recentlyVisitedStoreId) {
              // Call to see if the datacontainer actually exists
              const dataContainerExists = await qortalRequest({
                action: "SEARCH_QDN_RESOURCES",
                service: "DOCUMENT",
                identifier: `${recentlyVisitedStoreId}-${DATA_CONTAINER_BASE}`,
                name: user?.name,
                prefix: false,
                exactMatchNames: true,
                limit: 0,
                offset: 0,
                reverse: true,
                mode: "ALL"
              });
              if (dataContainerExists?.length === 0) {
                // Publish Data Container to QDN
                let formatStoreIdentifier = recentlyVisitedStoreId;
                if (formatStoreIdentifier.endsWith("-")) {
                  formatStoreIdentifier = formatStoreIdentifier.slice(0, -1);
                }
                if (formatStoreIdentifier.startsWith("-")) {
                  formatStoreIdentifier = formatStoreIdentifier.slice(1);
                }
                const dataContainer = {
                  storeId: recentlyVisitedStoreId,
                  shortStoreId: formatStoreIdentifier,
                  owner: user?.name,
                  products: {}
                };
                const dataContainerToBase64 = await objectToBase64(
                  dataContainer
                );
                try {
                  const dataContainerCreated = await qortalRequest({
                    action: "PUBLISH_QDN_RESOURCE",
                    name: user?.name,
                    service: "DOCUMENT",
                    data64: dataContainerToBase64,
                    identifier: `${recentlyVisitedStoreId}-${DATA_CONTAINER_BASE}`,
                    filename: "datacontainer.json"
                  });
                  if (dataContainerCreated && !dataContainerCreated.error) {
                    dispatch(
                      setDataContainer({
                        ...dataContainer,
                        id: `${recentlyVisitedStoreId}-${DATA_CONTAINER_BASE}`
                      })
                    );
                  }
                  dispatch(
                    setNotification({
                      msg: "Data Container Created!",
                      alertType: "success"
                    })
                  );
                } catch (error) {
                  navigate("/");
                  dispatch(
                    setNotification({
                      msg: "Error when creating the data container. Please try again!",
                      alertType: "error"
                    })
                  );
                  dispatch(updateRecentlyVisitedStoreId(""));
                  dispatch(clearDataCotainer());
                }
              } else {
                dispatch(
                  setNotification({
                    msg: "Error when fetching store data. Please try again!",
                    alertType: "error"
                  })
                );
                navigate("/");
              }
            }
          };
          getStoreAndDataContainer();
        } catch (error) {
          console.error(error);
        } finally {
          dispatch(setIsLoadingGlobal(false));
        }
      }
    }
  }, [recentlyVisitedStoreId, myStores, userOwnDataContainer]);

  // Handle publishing of data container when creating a store, or if it fails too (Need this to be able to call it from the reusable modal)
  useEffect(() => {
    const publishDataContainer = async () => {
      // Publish Data Container to QDN here
      await handlePublishDataContainer();
    };
    if (
      retryDataContainer &&
      storedDataContainer &&
      Object.keys(storedDataContainer).length > 0
    ) {
      publishDataContainer();
    }
    // We only want to run this when retryDataContainer changes, or else storedDataContainer will be cleared beforehand.
  }, [retryDataContainer]);

  return (
    <>
      {isLoadingGlobal && <PageLoader />}
      {isOpenCreateStoreModal && user?.name && (
        <CreateStoreModal
          open={isOpenCreateStoreModal}
          closeCreateStoreModal={closeCreateStoreModal}
          setCloseCreateStoreModal={(val: boolean) =>
            setCloseCreateStoreModal(val)
          }
          onPublish={createStore}
          username={user?.name || ""}
        />
      )}
      <EditStoreModal
        open={isOpenEditStoreModal}
        onClose={onCloseEditStoreModal}
        onPublish={editStore}
        username={user?.name || ""}
      />
      {/* Trigger reusable modal if something goes wrong during creation of the datacontainer */}
      <ReusableModal
        open={openDataContainerModal}
        onClose={() => {
          return;
        }}
      >
        <Stack spacing={2}>
          <CustomModalTitle>Failed to create data container</CustomModalTitle>
          <Typography>
            Shop successfully created! However, please accept the next modal to
            create a data container for your shop now which is obligatory.
          </Typography>
          <CustomModalButton
            style={{ fontFamily: "Raleway" }}
            variant="contained"
            color="primary"
            onClick={() => setRetryDataContainer(true)}
          >
            Retry Publishing
          </CustomModalButton>
        </Stack>
      </ReusableModal>
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
