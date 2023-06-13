import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../state/store'

import {
  Box,
  Button,
  Input,
  Typography,
  useTheme,
  IconButton
} from '@mui/material'
import LazyLoad from '../../components/common/LazyLoad'
import { NewProduct } from './NewProduct'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { ShowOrder } from './ShowOrder'
import SimpleTable from './ProductTable'
import { setNotification } from '../../state/features/notificationsSlice'
import { objectToBase64 } from '../../utils/toBase64'
import ShortUniqueId from 'short-unique-id'
import {
  Catalogue,
  CatalogueDataContainer,
  DataContainer
} from '../../state/features/globalSlice'
import { Price, Product } from '../../state/features/storeSlice'
import { useFetchOrders } from '../../hooks/useFetchOrders'
import { AVAILABLE } from '../../constants/product-status'
import OrderTable from './OrderTable'

const uid = new ShortUniqueId({ length: 10 })

export const ProductManager = () => {
  const theme = useTheme()
  const { user } = useSelector((state: RootState) => state.auth)
  const productsToSave = useSelector(
    (state: RootState) => state.global.productsToSave
  )
  const productsDataContainer = useSelector(
    (state: RootState) => state.global?.dataContainer?.products
  )
  const currentStore = useSelector(
    (state: RootState) => state.global.currentStore
  )
  const dataContainer = useSelector(
    (state: RootState) => state.global.dataContainer
  )
  const orders = useSelector((state: RootState) => state.order.orders)
  const hashMapOrders = useSelector(
    (state: RootState) => state.order.hashMapOrders
  )

  console.log({ orders, hashMapOrders })
  const products = useSelector((state: RootState) => state.global.products)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [order, setOrder] = useState<any>(null)
  const [replyTo, setReplyTo] = useState<any>(null)

  const [valueTab, setValueTab] = React.useState(0)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)
  const userName = useMemo(() => {
    if (!user?.name) return ''
    return user.name
  }, [user])

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValueTab(newValue)
  }

  async function publishQDNResource() {
    let address: string = ''
    let name: string = ''
    let errorMsg = ''

    address = user?.address || ''
    name = user?.name || ''

    if (!address) {
      errorMsg = "Cannot send: your address isn't available"
    }
    if (!name) {
      errorMsg = 'Cannot send a message without a access to your name'
    }

    if (!currentStore) {
      errorMsg = 'Cannot create a product without having a store'
    }
    if (!dataContainer) {
      errorMsg = 'Cannot create a product without having a data-container'
    }

    if (errorMsg) {
      dispatch(
        setNotification({
          msg: errorMsg,
          alertType: 'error'
        })
      )
      throw new Error(errorMsg)
    }
    if (!currentStore?.id) throw new Error('Cannot find store id')
    if (!dataContainer?.products)
      throw new Error('Cannot find data-container products')

    try {
      const storeId: string = currentStore?.id
      if (!storeId) throw new Error('Could not find your store')
      const parts = storeId.split('q-store-general-')
      const shortStoreId = parts[1]

      if (!currentStore) throw new Error('Could not find your store')
      console.log({ shortStoreId, currentStore })
      // let lengthOfProducts = Object.keys(productsDataContainer || {})?.length

      const lastCatalogue: CatalogueDataContainer | undefined =
        dataContainer?.catalogues?.at(-1)
      let catalogue = null
      const listOfCataloguesToPublish: Catalogue[] = []
      const dataContainerToPublish: DataContainer = {
        ...dataContainer,
        products: structuredClone(dataContainer.products),
        catalogues: structuredClone(dataContainer.catalogues)
      }
      console.log({ dataContainerToPublish })
      if (lastCatalogue && Object.keys(lastCatalogue?.products)?.length < 10) {
        // create new catalogue
        // add product to new catalogue
        // add products to dataContainer catalogue products

        const catalogueResponse = await qortalRequest({
          action: 'FETCH_QDN_RESOURCE',
          name: name,
          service: 'DOCUMENT',
          identifier: lastCatalogue.id
        })
        console.log({ catalogueResponse })
        if (catalogueResponse && !catalogueResponse?.error)
          catalogue = catalogueResponse
      }
      console.log({ catalogue })
      if (catalogue) listOfCataloguesToPublish.push(catalogue)

      Object.keys(productsToSave)
        .filter((item) => !productsToSave[item]?.isUpdate)
        .forEach((key) => {
          const product = productsToSave[key]
          console.log({ product })
          const priceInQort = product?.price?.find(
            (item: Price) => item?.currency === 'qort'
          )?.value
          if (!priceInQort)
            throw new Error('Cannot find price for one of your products')
          const lastCatalogueInList = listOfCataloguesToPublish.at(-1)
          const lastCatalogueInListIndex = listOfCataloguesToPublish.length - 1
          console.log({ lastCatalogueInList, lastCatalogueInListIndex })
          if (
            lastCatalogueInList &&
            Object.keys(lastCatalogueInList?.products)?.length < 10
          ) {
            const copyLastCatalogue = { ...lastCatalogueInList }
            console.log({ copyLastCatalogue })
            copyLastCatalogue.products[key] = product
            console.log('2', { copyLastCatalogue })
            dataContainerToPublish.products[key] = {
              created: product.created,
              priceQort: priceInQort,
              category: product?.category || '',
              catalogueId: copyLastCatalogue.id,
              status: AVAILABLE
            }
            console.log({ dataContainerToPublish })
            if (!dataContainerToPublish.catalogues)
              dataContainerToPublish.catalogues = []

            const findCatalogueInDataContainer =
              dataContainerToPublish.catalogues.findIndex(
                (item) => item.id === copyLastCatalogue.id
              )
            console.log({ findCatalogueInDataContainer })
            if (findCatalogueInDataContainer >= 0) {
              dataContainerToPublish.catalogues[
                findCatalogueInDataContainer
              ].products[key] = true
            } else {
              dataContainerToPublish.catalogues = [
                ...dataContainerToPublish.catalogues,
                {
                  id: copyLastCatalogue.id,
                  products: {
                    [key]: true
                  }
                }
              ]
            }
          } else {
            const uidGenerator = uid()
            const catalogueId = `q-store-catalogue-${shortStoreId}-${uidGenerator}`
            console.log({ catalogueId })
            listOfCataloguesToPublish.push({
              id: catalogueId,
              products: {
                [key]: product
              }
            })
            console.log({ listOfCataloguesToPublish, dataContainerToPublish })
            try {
              dataContainerToPublish.products[key] = {
                created: product.created,
                priceQort: priceInQort,
                category: product?.category || '',
                catalogueId,
                status: AVAILABLE
              }
            } catch (error) {
              console.log('my error', error)
            }

            if (!dataContainerToPublish.catalogues)
              dataContainerToPublish.catalogues = []

            const findCatalogueInDataContainer =
              dataContainerToPublish.catalogues.findIndex(
                (item) => item.id === catalogueId
              )
            if (findCatalogueInDataContainer >= 0) {
              dataContainerToPublish.catalogues[
                findCatalogueInDataContainer
              ].products[key] = true
            } else {
              dataContainerToPublish.catalogues = [
                ...dataContainerToPublish.catalogues,
                {
                  id: catalogueId,
                  products: {
                    [key]: true
                  }
                }
              ]
            }
          }
        })
      const productsToUpdate = Object.keys(productsToSave)
        .filter((item) => !!productsToSave[item]?.isUpdate)
        .map((key) => productsToSave[key])
      for (const product of productsToUpdate) {
        const priceInQort = product?.price?.find(
          (item: Price) => item?.currency === 'qort'
        )?.value
        if (!priceInQort)
          throw new Error('Cannot find price for one of your products')

        dataContainerToPublish.products[product.id] = {
          created: product.created,
          priceQort: priceInQort,
          category: product?.category || '',
          catalogueId: product.catalogueId,
          status: product?.status || ''
        }

        const findCatalogueFromExistingList =
          listOfCataloguesToPublish.findIndex(
            (cat) => cat.id === product.catalogueId
          )
        if (findCatalogueFromExistingList >= 0) {
          listOfCataloguesToPublish[findCatalogueFromExistingList].products[
            product.id
          ] = product
        } else {
          const catalogueResponse = await qortalRequest({
            action: 'FETCH_QDN_RESOURCE',
            name: name,
            service: 'DOCUMENT',
            identifier: product.catalogueId
          })
          if (catalogueResponse && !catalogueResponse?.error) {
            const copiedCatalogue = structuredClone(catalogueResponse)
            copiedCatalogue.products[product.id] = product
            listOfCataloguesToPublish.push(copiedCatalogue)
          }
        }
      }

      if (!currentStore) return
      let publishMultipleCatalogues = []

      for (const catalogue of listOfCataloguesToPublish) {
        const catalogueToBase64 = await objectToBase64(catalogue)
        const publish = {
          name,
          service: 'DOCUMENT',
          identifier: catalogue.id,
          filename: 'catalogue.json',
          data64: catalogueToBase64
        }
        publishMultipleCatalogues.push(publish)
      }
      const dataContainerToBase64 = await objectToBase64(dataContainerToPublish)
      const publishDataContainer = {
        name,
        service: 'DOCUMENT',
        identifier: dataContainerToPublish.id,
        filename: 'datacontainer.json',
        data64: dataContainerToBase64
      }

      const multiplePublish = {
        action: 'PUBLISH_MULTIPLE_QDN_RESOURCES',
        resources: [...publishMultipleCatalogues, publishDataContainer]
      }
      await qortalRequest(multiplePublish)

      dispatch(
        setNotification({
          msg: 'Products saved',
          alertType: 'success'
        })
      )
    } catch (error: any) {
      let notificationObj = null
      if (typeof error === 'string') {
        notificationObj = {
          msg: error || 'Failed to send message',
          alertType: 'error'
        }
      } else if (typeof error?.error === 'string') {
        notificationObj = {
          msg: error?.error || 'Failed to send message',
          alertType: 'error'
        }
      } else {
        notificationObj = {
          msg: error?.message || 'Failed to send message',
          alertType: 'error'
        }
      }
      if (!notificationObj) return
      dispatch(setNotification(notificationObj))

      throw new Error('Failed to send message')
    }
  }

  const { getOrders, getProducts } = useFetchOrders()
  const handleGetOrders = React.useCallback(async () => {
    await getOrders()
  }, [getOrders])

  const handleGetProducts = React.useCallback(async () => {
    await getProducts()
  }, [getProducts])

  console.log({ productToEdit })

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        backgroundColor: 'background.paper'
      }}
    >
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'flex-start'
        }}
      >
        <Tabs
          value={valueTab}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab
            sx={{
              '&.Mui-selected': {
                color: theme.palette.text.primary,
                fontWeight: theme.typography.fontWeightMedium
              }
            }}
            label="Orders"
          />
          <Tab
            sx={{
              '&.Mui-selected': {
                color: theme.palette.text.primary,
                fontWeight: theme.typography.fontWeightMedium
              }
            }}
            label="Products"
          />
        </Tabs>
      </Box>

      {Object.keys(productsToSave).length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            right: '25px',
            bottom: '25px'
          }}
        >
          <Button variant="contained" onClick={publishQDNResource}>
            Save Products
          </Button>
        </Box>
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
            setOrder(order)
            setIsOpen(true)
          }}
          data={orders}
        ></OrderTable>
        <LazyLoad onLoadMore={handleGetOrders}></LazyLoad>
      </TabPanel>
      <TabPanel value={valueTab} index={1}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <NewProduct
            editProduct={productToEdit}
            onClose={() => {
              setProductToEdit(null)
            }}
          />
        </Box>
        <SimpleTable
          openProduct={(product) => {
            setProductToEdit(product)
          }}
          data={products}
        ></SimpleTable>
        <LazyLoad onLoadMore={handleGetProducts}></LazyLoad>
      </TabPanel>
    </Box>
  )
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

export function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mail-tabs-${index}`}
      aria-labelledby={`mail-tabs-${index}`}
      {...other}
      style={{
        width: '100%'
      }}
    >
      {value === index && children}
    </div>
  )
}
