import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { addUser } from "../state/features/authSlice";
import ShortUniqueId from "short-unique-id";
import { RootState } from "../state/store";
import PublishStoreModal, {
  onPublishParam
} from "../components/modals/PublishStoreModal";
import EditBlogModal, {
  onPublishParamEdit
} from "../components/modals/EditStoreModal";

import {
  setCurrentStore,
  setDataContainer,
  setIsLoadingGlobal,
  toggleEditBlogModal,
  toggleCreateStoreModal
} from "../state/features/globalSlice";
import NavBar from "../components/layout/Navbar/Navbar";
import PageLoader from "../components/common/PageLoader";

import { setNotification } from "../state/features/notificationsSlice";
import localForage from "localforage";
import ConsentModal from "../components/modals/ConsentModal";
import { objectToBase64 } from "../utils/toBase64";
import { Cart } from "../pages/ProductManager/Cart";

interface Props {
  children: React.ReactNode;
  setTheme: (val: string) => void;
}

const uid = new ShortUniqueId();

const GlobalWrapper: React.FC<Props> = ({ children, setTheme }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [userAvatar, setUserAvatar] = useState<string>("");
  const [isOpenCart, setIsOpenCart] = useState<boolean>(false);
  const { user } = useSelector((state: RootState) => state.auth);
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
    // const url = `/arbitrary/metadata/BLOG/${username}/${identifier}}`
    // const responseBlogs = await fetch(url, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   }
    // })
    // const responseDataBlogs = await responseBlogs.json()
    if (dataMetadata.length === 0) {
      doesExist = false;
    }

    return doesExist;
  }

  async function getStore(name: string) {
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
    console.log({ responseData2 });
    if (responseData2 && !responseData2.error) {
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
    // const response = await fetch("/names/address/" + address);
    // const nameData = await response.json();

    //   if (nameData?.length > 0 ) {
    //       return nameData[0].name;
    //   } else {
    //       return '';
    //   }
  }

  const askForAccountInformation = React.useCallback(async () => {
    try {
      let account = await qortalRequest({
        action: "GET_USER_ACCOUNT"
      });

      const name = await getNameInfo(account.address);
      dispatch(addUser({ ...account, name }));

      const blog = await getStore(name);
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
      let formatBlogIdentifier = storeIdentifier;
      if (formatBlogIdentifier.endsWith("-")) {
        formatBlogIdentifier = formatBlogIdentifier.slice(0, -1);
      }
      if (formatBlogIdentifier.startsWith("-")) {
        formatBlogIdentifier = formatBlogIdentifier.slice(1);
      }
      if (!formatBlogIdentifier) {
        throw new Error("Please insert a valid store id");
      }
      const identifier = `q-store-general-${formatBlogIdentifier}`;
      const doesExitst = await verifyIfStoreIdExists(name, identifier);
      if (doesExitst) {
        throw new Error("The store identifier already exists");
      }

      const storeObj = {
        title,
        description,
        location,
        shipsTo,
        created: Date.now(),
        shortStoreId: formatBlogIdentifier,
        logo
      };
      const dataContainer = {
        storeId: identifier,
        shortStoreId: formatBlogIdentifier,
        owner: name,
        products: {}
      };
      const blogPostToBase64 = await objectToBase64(storeObj);
      const dataContainerToBase64 = await objectToBase64(dataContainer);
      try {
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
        const resourceResponse2 = await qortalRequest({
          action: "PUBLISH_QDN_RESOURCE",
          name: name,
          service: "DOCUMENT",
          data64: dataContainerToBase64,
          identifier: `${identifier}-datacontainer`,
          filename: "datacontainer.json"
        });
        // navigate(`/${user.name}/${identifier}`)
        await new Promise<void>((res, rej) => {
          setTimeout(() => {
            res();
          }, 1000);
        });
        const createdAt = Date.now();
        const storefullObj = {
          ...storeObj,
          id: identifier,
          isValid: true,
          owner: name,
          created: createdAt,
          updated: createdAt
        };

        dispatch(setCurrentStore(storefullObj));
        dispatch(
          setDataContainer({
            ...dataContainer,
            id: `${identifier}-datacontainer`
          })
        );
        // getStore(name)
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

  React.useEffect(() => {
    askForAccountInformation();
  }, []);

  const onClosePublishBlogModal = React.useCallback(() => {
    dispatch(toggleCreateStoreModal(false));
  }, []);
  const onCloseEditBlogModal = React.useCallback(() => {
    dispatch(toggleEditBlogModal(false));
  }, []);

  return (
    <>
      {isLoadingGlobal && <PageLoader />}

      {isOpenCreateStoreModal && user?.name && (
        <PublishStoreModal
          open={isOpenCreateStoreModal}
          onClose={onClosePublishBlogModal}
          onPublish={createStore}
          username={user?.name || ""}
        />
      )}

      <EditBlogModal
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
        blog={currentStore}
        authenticate={askForAccountInformation}
        hasAttemptedToFetchShopInitial={hasAttemptedToFetchShopInitial}
      />
      <ConsentModal />
      <Cart />
      {children}
    </>
  );
};

export default GlobalWrapper;
