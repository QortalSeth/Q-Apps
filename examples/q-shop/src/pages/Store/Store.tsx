import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { useParams } from "react-router-dom";
import {
  useTheme,
  Grid,
  CircularProgress,
  Chip,
  FormControl
} from "@mui/material";
import {
  resetListProducts,
  setIsLoadingGlobal,
  updateRecentlyVisitedStoreId
} from "../../state/features/globalSlice";
import { Product } from "../../state/features/storeSlice";
import LazyLoad from "../../components/common/LazyLoad";
import ContextMenuResource from "../../components/common/ContextMenu/ContextMenuResource";
import { setStoreId, setStoreOwner } from "../../state/features/storeSlice";
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
  ProductCardCol
} from "./Store-styles";
import { toggleEditBlogModal } from "../../state/features/globalSlice";
import { CartIcon } from "../../components/layout/Navbar/Navbar-styles";
import { setIsOpen } from "../../state/features/cartSlice";
import { Cart as CartInterface } from "../../state/features/cartSlice";
import { ExpandMoreSVG } from "../../assets/svgs/ExpandMoreSVG";
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

  const { user } = useSelector((state: RootState) => state.auth);
  const currentStore = useSelector(
    (state: RootState) => state.global.currentStore
  );
  const { isLoadingGlobal } = useSelector((state: RootState) => state.global);
  const catalogueHashMap = useSelector(
    (state: RootState) => state.global.catalogueHashMap
  );

  const { checkAndUpdateResourceCatalogue, getCatalogue } = useFetchOrders();

  const { store, user: username } = useParams();

  // Fetch all carts from Redux
  const { carts } = useSelector((state: RootState) => state.cart);

  // Get storeId from Redux
  const { storeId } = useSelector((state: RootState) => state.store);

  const dispatch = useDispatch();

  const [userStore, setUserStore] = React.useState<any>(null);
  const [dataContainer, setDataContainer] = useState(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [listProducts, setListProducts] = useState<IListProducts>({
    sort: "created",
    products: [],
    categories: []
  });
  const [totalCartQuantity, setTotalCartQuantity] = useState<number>(0);
  const [filterPrice, setFilterPrice] = useState<PriceFilter>(
    PriceFilter.highest
  );
  const [filterDate, setFilterDate] = useState<DateFilter>(DateFilter.newest);
  const [categoryChips, setCategoryChips] = useState<{ label: string }[]>([]);

  const getProducts = useCallback(async () => {
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
  const getStore = useCallback(async () => {
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
        categories: Object.keys(categories).map((cat) => ({ label: cat }))
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

  // Set cart notifications when cart changes
  useEffect(() => {
    if (Object.keys(carts).length > 0 && user?.name && storeId) {
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
    const newArray: any = products.map((product: Product, index) => {
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
        return products;
      }
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
            categoryChips.some((chip) => chip.label === product.category)
          : true;
      return condition;
    });
    const newArray4: any = newArray3.sort((a: Product, b: Product) => {
      if (filterDate === DateFilter.newest) {
        return b?.created - a?.created;
      } else {
        return a?.created - b?.created;
      }
    });
    return newArray4;
  }, [filterDate, filterPrice, products, categoryChips, catalogueHashMap]);

  // Filtering by categories

  const handleChipSelect = (value: { label: string }[]) => {
    setCategoryChips(value);
  };

  const handleChipRemove = (chip: { label: string }) => {
    setCategoryChips((prevChips) =>
      prevChips.filter((c) => c.label !== chip.label)
    );
  };

  if (!userStore) return null;
  if (isLoadingGlobal) return <CircularProgress />;

  return (
    <Grid container sx={{ width: "100%" }}>
      <FiltersCol item xs={12} sm={3}>
        <BackToStorefrontButton
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
                options={listProducts?.categories}
                disableCloseOnSelect
                onChange={(e: any, value) =>
                  handleChipSelect(value as { label: string }[])
                }
                renderTags={(values: any) =>
                  values.map((value: { label: string }) => {
                    return (
                      <Chip
                        key={value?.label}
                        label={value?.label}
                        onDelete={() => {
                          handleChipRemove(value as { label: string });
                        }}
                      />
                    );
                  })
                }
                renderOption={(props, option: any) => (
                  <li {...props}>
                    <FiltersCheckbox
                      checked={categoryChips.some(
                        (chip) => chip.label === option?.label
                      )}
                    />
                    {option?.label}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFilterPrice(PriceFilter.highest)
                }
                inputProps={{ "aria-label": "controlled" }}
              />
            </FiltersRow>
            <FiltersRow>
              Lowest
              <FiltersCheckbox
                checked={filterPrice === PriceFilter.lowest}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFilterPrice(PriceFilter.lowest)
                }
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFilterDate(DateFilter.newest)
                }
                inputProps={{ "aria-label": "controlled" }}
              />
            </FiltersRow>
            <FiltersRow>
              Oldest
              <FiltersCheckbox
                checked={filterDate === DateFilter.oldest}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFilterDate(DateFilter.oldest)
                }
                inputProps={{ "aria-label": "controlled" }}
              />
            </FiltersRow>
          </FiltersSubContainer>
        </FiltersContainer>
      </FiltersCol>
      <Grid item xs={12} sm={9}>
        <ProductManagerRow>
          {username === user?.name ? (
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
          ) : user?.name ? (
            <CartIconContainer>
              <CartIcon
                color={theme.palette.text.primary}
                height={"32"}
                width={"32"}
                onClickFunc={() => {
                  dispatch(setIsOpen(true));
                }}
              />
              {totalCartQuantity > 0 && (
                <NotificationBadge>{totalCartQuantity}</NotificationBadge>
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
                    link={`qortal://APP/Q-Shop/${product.user}/${storeId}/${product.id}`}
                  >
                    <ProductCard product={product} />
                  </ContextMenuResource>
                </ProductCardCol>
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
      </Grid>
    </Grid>
  );
};
