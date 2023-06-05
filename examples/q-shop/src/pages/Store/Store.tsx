import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import { useParams } from 'react-router-dom'
import { Typography, Box, Button, useTheme } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { setIsLoadingGlobal } from '../../state/features/globalSlice'
import { Product } from '../../state/features/storeSlice'
import { useFetchProducts } from '../../hooks/useFetchProducts'
import LazyLoad from '../../components/common/LazyLoad'
import ContextMenuResource from '../../components/common/ContextMenu/ContextMenuResource'
import {
  setProductToCart,
  setStoreId,
  setStoreOwner
} from '../../state/features/cartSlice'
import { ProductCard } from './ProductCard'
import { ProductDataContainer } from '../../state/features/globalSlice'
import { useFetchOrders } from '../../hooks/useFetchOrders'

interface IListProducts {
  sort: string
  products: ProductDataContainer[]
  categories: string[]
}
export const Store = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { user } = useSelector((state: RootState) => state.auth)
  const currentStore = useSelector(
    (state: RootState) => state.global.currentStore
  )
  const { checkAndUpdateResourceCatalogue, getCatalogue } = useFetchOrders()
  const { store, user: username } = useParams()
  const catalogueHashMap = useSelector(
    (state: RootState) => state.global.catalogueHashMap
  )
  const dispatch = useDispatch()
  const [userStore, setUserStore] = React.useState<any>(null)
  const [dataContainer, setDataContainer] = useState(null)
  const { getProduct, hashMapProducts, checkAndUpdateResource } =
    useFetchProducts()

  const [products, setProducts] = React.useState<Product[]>([])
  const [listProducts, setListProducts] = useState<IListProducts>({
    sort: 'created',
    products: [],
    categories: []
  })
  const getProducts = React.useCallback(async () => {
    if (!store) return

    try {
      dispatch(setIsLoadingGlobal(true))
      const offset = products.length
      const productList = listProducts.products
      const responseData = productList.slice(offset, offset + 20)

      const structureData = responseData.map(
        (product: ProductDataContainer): Product => {
          return {
            created: product?.created,
            catalogueId: product.catalogueId,
            id: product?.productId || '',
            user: product?.user || '',
            status: product?.status || ''
          }
        }
      )
      const copiedProducts = [...products]
      structureData.forEach((product: Product) => {
        const index = copiedProducts.findIndex((p) => p.id === product.id)
        if (index !== -1) {
          copiedProducts[index] = product
        } else {
          copiedProducts.push(product)
        }
      })
      setProducts(copiedProducts)

      for (const content of structureData) {
        if (content.user && content.id) {
          const res = checkAndUpdateResourceCatalogue({
            id: content.catalogueId
          })
          if (res) {
            getCatalogue(content.user, content.catalogueId)
          }
        }
      }
    } catch (error) {
    } finally {
      dispatch(setIsLoadingGlobal(false))
    }
  }, [products, listProducts])
  const getStore = React.useCallback(async () => {
    let name = username

    if (!name) return
    if (!store) return
    try {
      const urlStore = `/arbitrary/STORE/${name}/${store}`
      const response = await fetch(urlStore, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const responseData = await response.json()
      const urlDatacontainer = `/arbitrary/DOCUMENT/${name}/${store}-datacontainer`
      const responseContainer = await fetch(urlDatacontainer, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const responseDataContainer = await responseContainer.json()
      setDataContainer({
        ...responseDataContainer,
        id: `${store}-datacontainer`
      })
      let categories: any = {}
      const mappedProducts = Object.keys(responseDataContainer.products)
        .map((key) => {
          const category = responseDataContainer?.products[key]?.category
          if (category) {
            categories[category] = true
          }
          return {
            ...responseDataContainer.products[key],
            productId: key,
            user: responseDataContainer.owner
          }
        })
        .sort((a, b) => b.created - a.created)
      setListProducts({
        sort: 'created',
        products: mappedProducts,
        categories: Object.keys(categories).map((cat) => cat)
      })

      setUserStore(responseData)
      dispatch(setStoreId(store))
      dispatch(setStoreOwner(name))
    } catch (error) {}
  }, [username, store, dataContainer])

  React.useEffect(() => {
    getStore()
  }, [username, store])
  const getProductsHandler = React.useCallback(async () => {
    await getProducts()
  }, [getProducts])

  console.log({ products, hashMapProducts })
  if (!userStore) return null
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          margin: '15px'
        }}
      >
        {products.map((product: Product, index) => {
          let existingProduct = product
          if (
            catalogueHashMap[product?.catalogueId] &&
            catalogueHashMap[product.catalogueId].products[product?.id]
          ) {
            existingProduct = {
              ...product,
              ...catalogueHashMap[product.catalogueId].products[product?.id],
              catalogueId: product?.catalogueId || ''
            }
          }
          const storeId = currentStore?.id || ''
          return (
            <Box
              key={existingProduct.id}
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                width: 'auto',
                position: 'relative',
                ' @media (max-width: 450px)': {
                  width: '100%'
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
            </Box>
          )
        })}
      </Box>
      <LazyLoad onLoadMore={getProductsHandler}></LazyLoad>
    </>
  )
}
