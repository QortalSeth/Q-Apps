import React, { useState, useEffect, useCallback, useMemo } from "react";
import { redirect, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../state/store";
import { useParams } from "react-router-dom";
import {
  useTheme,
  Grid,
  CircularProgress,
  Chip,
  FormControl,
  Rating,
  Typography
} from "@mui/material";
import {
  Catalogue,
  setIsLoadingGlobal,
  updateRecentlyVisitedStoreId
} from "../../../state/features/globalSlice";
import {
  Product,
  clearReviews,
  clearViewedStoreDataContainer,
  setCurrentViewedStore,
  setViewedStoreDataContainer
} from "../../../state/features/storeSlice";
import LazyLoad from "../../../components/common/LazyLoad";
import ContextMenuResource from "../../../components/common/ContextMenu/ContextMenuResource";
import { setStoreId, setStoreOwner } from "../../../state/features/storeSlice";
import { ProductCard } from "../ProductCard/ProductCard";
import { ProductDataContainer } from "../../../state/features/globalSlice";
import { useFetchOrders } from "../../../hooks/useFetchOrders";
import {
  ProductManagerRow,
  ProductManagerButton,
  BackToStorefrontButton,
  ProductsContainer,
  NoProductsContainer,
  NoProductsText,
  StoreControlsRow,
  EditStoreButton,
  CartIconContainer,
  NotificationBadge,
  FiltersCol,
  FiltersContainer,
  FiltersTitle,
  FiltersCheckbox,
  FiltersRow,
  FiltersSubContainer,
  FilterSelect,
  FilterSelectMenuItems,
  ProductCardCol,
  StoreTitleCard,
  StoreLogo,
  StoreTitleCol,
  StoreTitle,
  RatingContainer,
  ReusableModalStyled
} from "./Store-styles";
import { toggleEditStoreModal } from "../../../state/features/globalSlice";
import { CartIcon } from "../../../components/layout/Navbar/Navbar-styles";
import { setIsOpen } from "../../../state/features/cartSlice";
import { Cart as CartInterface } from "../../../state/features/cartSlice";
import { ExpandMoreSVG } from "../../../assets/svgs/ExpandMoreSVG";
import { StoreDetails } from "../StoreDetails/StoreDetails";
import { StoreReviews } from "../StoreReviews/StoreReviews";
import { setNotification } from "../../../state/features/notificationsSlice";
import { objectToBase64 } from "../../../utils/toBase64";

interface IListProducts {
  sort: string;
  products: ProductDataContainer[];
  categories: { label: string }[];
}

enum PriceFilter {
  highest = "Highest",
  lowest = "Lowest"
}

enum DateFilter {
  newest = "Newest",
  oldest = "Oldest"
}

export const Store = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const user = useSelector((state: RootState) => state.auth.user);
  const currentStore = useSelector(
    (state: RootState) => state.global.currentStore
  );
  const isLoadingGlobal = useSelector(
    (state: RootState) => state.global.isLoadingGlobal
  );
  const catalogueHashMap = useSelector(
    (state: RootState) => state.global.catalogueHashMap
  );
  // Fetch all carts from Redux
  const carts = useSelector((state: RootState) => state.cart.carts);
  // Get storeId from Redux
  const storeId = useSelector((state: RootState) => state.store.storeId);
  // Get current viewed store from Redux
  const currentViewedStore = useSelector(
    (state: RootState) => state.store.currentViewedStore
  );
  // List products from store's data container
  const viewedStoreListProducts = useSelector(
    (state: RootState) => state.store.viewedStoreListProducts
  );

  const { checkAndUpdateResourceCatalogue, getCatalogue } = useFetchOrders();

  const { store, user: username } = useParams();

  const dispatch = useDispatch();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [totalCartQuantity, setTotalCartQuantity] = useState<number>(0);
  const [filterPrice, setFilterPrice] = useState<PriceFilter | null>(null);
  const [filterDate, setFilterDate] = useState<DateFilter | null>(
    DateFilter.newest
  );
  const [categoryChips, setCategoryChips] = useState<string[]>([]);
  const [openStoreDetails, setOpenStoreDetails] = useState<boolean>(false);
  const [openStoreReviews, setOpenStoreReviews] = useState<boolean>(false);
  const [averageStoreRating, setAverageStoreRating] = useState<number | null>(
    null
  );
  const [averageRatingLoader, setAverageRatingLoader] =
    useState<boolean>(false);

  const getProducts = useCallback(async () => {
    if (!store) return;
    try {
      const offset = products.length;
      const productList = viewedStoreListProducts.products;
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
      setProducts(copiedProducts);
      // First check in catalogueHashMap if the product raw data is available. If it is, don't do anything as that data will already be available to use in the filterProducts useMemo() function.
      // If it isn't in catalogueHashMap, loop through the products and add the catalogue found so that you don't fetch other catalogues that you don't need, as each one contains 10 products. This goes too fast on first mount, therefore you can't rely on redux to verify if the catalogue is available or not.
      let localCatalogue: Record<string, Catalogue> = {};
      for (const content of structureData) {
        if (
          (catalogueHashMap[content.catalogueId] &&
            catalogueHashMap[content.catalogueId].products[content.id]) ||
          localCatalogue[content.catalogueId]
        ) {
          continue;
        }
        if (content.user && content.id) {
          const res = checkAndUpdateResourceCatalogue({
            id: content.catalogueId
          });
          if (res) {
            const fetchedCatalogue: Catalogue = await getCatalogue(
              content.user,
              content.catalogueId
            );
            if (fetchedCatalogue) {
              localCatalogue = {
                ...localCatalogue,
                [content.catalogueId]: fetchedCatalogue
              };
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [products, viewedStoreListProducts]);

  // Get store on mount & setCurrentStore when it's your own store
  const getStore = useCallback(async () => {
    let name = username;
    if (!name) return;
    if (!store) return;

    try {
      dispatch(setIsLoadingGlobal(true));
      // Check if store data is not already inside redux, and that if it does, that it's not from another store. This is to avoid unnecessary QDN calls. getProducts() will get data from the existing data container if the store hasn't changed, hence why we clear the products array here as well as the datacontainer only if the currentViewedStore is not the same as the store in the url.
      if (!currentViewedStore || currentViewedStore.id !== store) {
        setProducts([]);
        dispatch(clearReviews());
        dispatch(clearViewedStoreDataContainer());
        let myStore;
        const url = `/arbitrary/resources/search?service=STORE&identifier=${store}&exactmatchnames=true&mode=ALL&name=${name}&includemetadata=true`;
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
        // Set shop data to redux now that you have the info/metadata & resource
        dispatch(
          setCurrentViewedStore({
            created: responseData?.created || "",
            id: myStore.identifier,
            title: responseData?.title || "",
            location: responseData?.location,
            shipsTo: responseData?.shipsTo,
            description: responseData?.description || "",
            category: myStore.metadata?.category,
            tags: myStore.metadata?.tags || [],
            logo: responseData?.logo || ""
          })
        );
        // Have access to the storeId in global state for when you are in cart for example
        dispatch(setStoreId(store));
        dispatch(updateRecentlyVisitedStoreId(store));
        dispatch(setStoreOwner(name));

        const urlDatacontainer = `/arbitrary/DOCUMENT/${name}/${store}-datacontainer`;
        const responseContainer = await fetch(urlDatacontainer, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        // Set dataContainer in redux if the response is 200 status. This is to do filtering in the future since it cannot be done on QDN at the moment
        if (responseContainer.ok) {
          const responseDataContainer = await responseContainer.json();
          dispatch(
            setViewedStoreDataContainer({
              ...responseDataContainer,
              id: `${store}-datacontainer`
            })
          );
          // If you can't find the data container, aka response code of 404, and it's not your own store, redirect to home page
        } else if (
          responseContainer.status === 404 &&
          username !== user?.name
        ) {
          navigate("/");
          dispatch(
            setNotification({
              msg: "Error getting store data container.",
              alertType: "error"
            })
          );
          // If you can't find the data container, aka response code of 404, and it's your own store, prompt to create the data container
        } else if (
          responseContainer.status === 404 &&
          username === user?.name
        ) {
          // Publish Data Container to QDN
          let formatStoreIdentifier = store;
          if (formatStoreIdentifier.endsWith("-")) {
            formatStoreIdentifier = formatStoreIdentifier.slice(0, -1);
          }
          if (formatStoreIdentifier.startsWith("-")) {
            formatStoreIdentifier = formatStoreIdentifier.slice(1);
          }
          const dataContainer = {
            storeId: store,
            shortStoreId: formatStoreIdentifier,
            owner: username,
            products: {}
          };
          const dataContainerToBase64 = await objectToBase64(dataContainer);
          await qortalRequest({
            action: "PUBLISH_QDN_RESOURCE",
            name: name,
            service: "DOCUMENT",
            data64: dataContainerToBase64,
            identifier: `${storeId}-datacontainer`,
            filename: "datacontainer.json"
          });
          // If you can't find the data container, but it's a response of 500, throw general error and redirect to home page
        } else if (!responseContainer.ok && responseContainer.status !== 404) {
          navigate("/");
          dispatch(
            setNotification({
              msg: "Server Error",
              alertType: "error"
            })
          );
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setIsLoadingGlobal(false));
    }
  }, [username, store, currentViewedStore]);

  // Get 100 store reviews from QDN and calculate the average review
  const getStoreAverageReview = async () => {
    if (!storeId) return;
    try {
      setAverageRatingLoader(true);
      const parts = storeId.split("q-store-general-");
      const shortStoreId = parts[1];
      const query = `q-store-review-${shortStoreId}`;
      // Since it the url includes /resources, you know you're fetching the resources and not the raw data
      const url = `/arbitrary/resources/search?service=DOCUMENT&query=${query}&limit=100&includemetadata=false&mode=LATEST&reverse=true`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const responseData = await response.json();
      if (responseData.length === 0) {
        setAverageStoreRating(null);
        return;
      }
      // Modify resource into data that is more easily used on the front end
      const storeRatingsArray = responseData.map((review: any) => {
        const splitIdentifier = review.identifier.split("-");
        const rating = Number(splitIdentifier[splitIdentifier.length - 1]) / 10;
        return rating;
      });

      // Calculate average rating of the store
      let averageRating =
        storeRatingsArray.reduce((acc: number, curr: number) => {
          return acc + curr;
        }, 0) / storeRatingsArray.length;

      averageRating = Math.ceil(averageRating * 2) / 2;

      setAverageStoreRating(averageRating);
    } catch (error) {
      console.error(error);
    } finally {
      setAverageRatingLoader(false);
    }
  };

  // Get Store and set it in local state
  useEffect(() => {
    getStore();
  }, [username, store]);

  // Get average store rating when storeId is available
  useEffect(() => {
    if (storeId && currentViewedStore?.id !== storeId) {
      getStoreAverageReview();
    }
  }, [storeId, currentViewedStore]);

  // Set cart notifications when cart changes
  useEffect(() => {
    if (user?.name && storeId) {
      const shopCart: CartInterface = carts[storeId];
      // Get the orders of this cart
      const orders = shopCart?.orders || {};
      let totalQuantity = 0;
      Object.keys(orders).forEach((key) => {
        const order = orders[key];
        const { quantity } = order;
        totalQuantity += quantity;
      });
      setTotalCartQuantity(totalQuantity);
    }
  }, [carts, user, storeId]);

  const getProductsHandler = useCallback(async () => {
    await getProducts();
  }, [getProducts]);

  // Filter products
  const filteredProducts = useMemo(() => {
    const newArray: any = products
      .map((product: Product, index) => {
        if (
          catalogueHashMap[product?.catalogueId] &&
          catalogueHashMap[product.catalogueId].products[product?.id]
        ) {
          return {
            ...product,
            ...catalogueHashMap[product.catalogueId].products[product?.id],
            catalogueId: product?.catalogueId || ""
          };
        } else {
          return product;
        }
      })
      .filter((product: any) => {
        const condition =
          product?.status === "AVAILABLE" || product?.status === "OUT_OF_STOCK";
        return condition;
      });
    const newArray2 = newArray.sort((a: Product, b: Product) => {
      if (
        filterPrice === PriceFilter.highest &&
        a?.price &&
        b?.price &&
        a?.price[0]?.value &&
        b?.price[0]?.value
      ) {
        return b?.price[0]?.value - a?.price[0]?.value;
      } else if (
        filterPrice === PriceFilter.lowest &&
        a?.price &&
        b?.price &&
        a?.price[0]?.value &&
        b?.price[0]?.value
      ) {
        return a?.price[0]?.value - Number(b?.price[0]?.value);
      } else return newArray;
    });
    const newArray3: any = newArray2.filter((product: Product) => {
      const condition =
        categoryChips.length > 0
          ? product?.category &&
            categoryChips.some((chip) => chip === product.category)
          : true;
      return condition;
    });
    const newArray4: any = newArray3.sort((a: Product, b: Product) => {
      if (filterDate === DateFilter.newest) {
        return b?.created - a?.created;
      } else if (filterDate === DateFilter.oldest) {
        return a?.created - b?.created;
      } else {
        return newArray3;
      }
    });
    return newArray4;
  }, [filterDate, filterPrice, products, categoryChips, catalogueHashMap]);

  // Filtering by categories

  const handleChipSelect = (value: string[]) => {
    setCategoryChips(value);
  };

  const handleChipRemove = (chip: string) => {
    setCategoryChips((prevChips) => prevChips.filter((c) => c !== chip));
  };

  if (isLoadingGlobal) return;

  if (!currentViewedStore && !isLoadingGlobal)
    return (
      <Typography
        marginTop={"20px"}
        fontFamily={"Karla"}
        fontSize={"25px"}
        fontWeight={"500"}
        textAlign={"center"}
      >
        Store Not Found!
      </Typography>
    );

  return (
    <Grid container sx={{ width: "100%" }}>
      <FiltersCol item xs={12} sm={3}>
        <BackToStorefrontButton
          style={{ maxWidth: "70%", alignSelf: "center" }}
          onClick={() => {
            navigate("/");
          }}
        >
          Back To All Shops
        </BackToStorefrontButton>
        <FiltersContainer>
          <FiltersTitle>
            Categories
            <ExpandMoreSVG
              color={theme.palette.text.primary}
              height={"22"}
              width={"22"}
            />
          </FiltersTitle>
          <FiltersSubContainer>
            <FormControl sx={{ width: "100%" }}>
              <FilterSelect
                multiple
                id="categories-select"
                value={categoryChips}
                options={viewedStoreListProducts?.categories}
                disableCloseOnSelect
                onChange={(e: any, value) =>
                  handleChipSelect(value as string[])
                }
                renderTags={(values: any) =>
                  values.map((value: string) => {
                    return (
                      <Chip
                        key={value}
                        label={value}
                        onDelete={() => {
                          handleChipRemove(value);
                        }}
                      />
                    );
                  })
                }
                renderOption={(props, option: any) => (
                  <li {...props}>
                    <FiltersCheckbox
                      checked={categoryChips.some((chip) => chip === option)}
                    />
                    {option}
                  </li>
                )}
                renderInput={(params) => (
                  <FilterSelectMenuItems
                    {...params}
                    label="Categories"
                    placeholder="Filter by category"
                  />
                )}
              />
            </FormControl>
          </FiltersSubContainer>
          <FiltersTitle>
            Price
            <ExpandMoreSVG
              color={theme.palette.text.primary}
              height={"22"}
              width={"22"}
            />
          </FiltersTitle>
          <FiltersSubContainer>
            <FiltersRow>
              Highest
              <FiltersCheckbox
                checked={filterPrice === PriceFilter.highest}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFilterPrice(PriceFilter.highest);
                  setFilterDate(null);
                }}
                inputProps={{ "aria-label": "controlled" }}
              />
            </FiltersRow>
            <FiltersRow>
              Lowest
              <FiltersCheckbox
                checked={filterPrice === PriceFilter.lowest}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFilterPrice(PriceFilter.lowest);
                  setFilterDate(null);
                }}
                inputProps={{ "aria-label": "controlled" }}
              />
            </FiltersRow>
          </FiltersSubContainer>
          <FiltersTitle>
            Date Product Added
            <ExpandMoreSVG
              color={theme.palette.text.primary}
              height={"22"}
              width={"22"}
            />
          </FiltersTitle>
          <FiltersSubContainer>
            <FiltersRow>
              Most Recent
              <FiltersCheckbox
                checked={filterDate === DateFilter.newest}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFilterDate(DateFilter.newest);
                  setFilterPrice(null);
                }}
                inputProps={{ "aria-label": "controlled" }}
              />
            </FiltersRow>
            <FiltersRow>
              Oldest
              <FiltersCheckbox
                checked={filterDate === DateFilter.oldest}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFilterDate(DateFilter.oldest);
                  setFilterPrice(null);
                }}
                inputProps={{ "aria-label": "controlled" }}
              />
            </FiltersRow>
          </FiltersSubContainer>
        </FiltersContainer>
      </FiltersCol>
      <Grid item xs={12} sm={9}>
        <ProductManagerRow>
          <StoreTitleCard>
            <StoreLogo
              src={
                username === user?.name
                  ? currentStore?.logo
                  : currentViewedStore?.logo
              }
              alt={
                username === user?.name
                  ? currentStore?.id
                  : currentViewedStore?.id
              }
            />
            <StoreTitleCol>
              <StoreTitle
                onClick={() => {
                  setOpenStoreDetails(true);
                }}
              >
                {username === user?.name
                  ? currentStore?.title
                  : currentViewedStore?.title}
              </StoreTitle>
              {averageRatingLoader ? (
                <CircularProgress />
              ) : (
                <RatingContainer
                  onClick={() => {
                    setOpenStoreReviews(true);
                  }}
                >
                  {!averageStoreRating ? (
                    "No reviews yet"
                  ) : (
                    <Rating
                      precision={0.5}
                      value={averageStoreRating}
                      readOnly
                    />
                  )}
                </RatingContainer>
              )}
            </StoreTitleCol>
          </StoreTitleCard>
          {username === user?.name ? (
            <StoreControlsRow>
              <EditStoreButton
                onClick={() => {
                  dispatch(toggleEditStoreModal(true));
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
          ) : user?.name ? (
            <CartIconContainer
              fixedCartPosition={totalCartQuantity > 0 ? true : false}
              onClick={() => {
                dispatch(setIsOpen(true));
              }}
            >
              <CartIcon
                color={theme.palette.text.primary}
                height={"32"}
                width={"32"}
              />
              {totalCartQuantity > 0 && (
                <NotificationBadge
                  fixedCartPosition={totalCartQuantity > 0 ? true : false}
                >
                  {totalCartQuantity}
                </NotificationBadge>
              )}
            </CartIconContainer>
          ) : null}
        </ProductManagerRow>
        <ProductsContainer container spacing={2}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product: Product) => {
              const storeId = currentStore?.id || "";
              return (
                <ProductCardCol
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  item
                  key={product.id}
                >
                  <ContextMenuResource
                    name={product.user}
                    service="PRODUCT"
                    identifier={product.id}
                    link={`qortal://APP/Q-Shop/${product?.user}/${storeId}/${product?.id}/${product?.catalogueId}`}
                  >
                    <ProductCard product={product} />
                  </ContextMenuResource>
                </ProductCardCol>
              );
            })
          ) : filteredProducts.length === 0 && username === user?.name ? (
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
      </Grid>
      <ReusableModalStyled
        id={"store-details"}
        customStyles={{
          width: "96%",
          maxWidth: 700,
          height: "70%",
          backgroundColor:
            theme.palette.mode === "light" ? "#e8e8e8" : "#32333c",
          position: "relative",
          padding: "25px 40px",
          borderRadius: "5px",
          outline: "none",
          overflowY: "auto"
        }}
        open={openStoreDetails}
      >
        <StoreDetails
          setOpenStoreDetails={setOpenStoreDetails}
          storeTitle={
            username === user?.name
              ? currentStore?.title || ""
              : currentViewedStore?.title || ""
          }
          storeImage={
            username === user?.name
              ? currentStore?.logo || ""
              : currentViewedStore?.logo || ""
          }
          storeOwner={username || ""}
          storeDescription={
            username === user?.name
              ? currentStore?.description || ""
              : currentViewedStore?.description || ""
          }
          dateCreated={
            username === user?.name
              ? currentStore?.created || 0
              : currentViewedStore?.created || 0
          }
          location={
            username === user?.name
              ? currentStore?.location || ""
              : currentViewedStore?.location || ""
          }
          shipsTo={
            username === user?.name
              ? currentStore?.shipsTo || ""
              : currentViewedStore?.shipsTo || ""
          }
        />
      </ReusableModalStyled>
      <ReusableModalStyled
        id={"store-details"}
        customStyles={{
          width: "96%",
          maxWidth: 1200,
          height: "95vh",
          backgroundColor:
            theme.palette.mode === "light" ? "#e8e8e8" : "#32333c",
          position: "relative",
          padding: "25px 40px",
          borderRadius: "5px",
          outline: "none",
          overflowY: "auto",
          overflowX: "hidden"
        }}
        open={openStoreReviews}
      >
        <StoreReviews
          averageStoreRating={averageStoreRating}
          storeTitle={currentViewedStore?.title || ""}
          storeImage={currentViewedStore?.logo || ""}
          storeId={currentViewedStore?.id || ""}
          setOpenStoreReviews={setOpenStoreReviews}
        />
      </ReusableModalStyled>
    </Grid>
  );
};
