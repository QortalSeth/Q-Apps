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
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import Joyride, { ACTIONS, EVENTS, STATUS, Step } from 'react-joyride'
import SendIcon from '@mui/icons-material/Send'
import MailIcon from '@mui/icons-material/Mail'
import {
  Box,
  Button,
  Input,
  Typography,
  useTheme,
  IconButton
} from '@mui/material'
import LazyLoad from '../../components/common/LazyLoad'
import { removePrefix } from '../../utils/blogIdformats'
import { NewProduct } from './NewProduct'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { ShowMessage } from './ShowProduct'
import SimpleTable from './ProductTable'
import { setNotification } from '../../state/features/notificationsSlice'
import { objectToBase64 } from '../../utils/toBase64'
import ShortUniqueId from 'short-unique-id'
import {
  Catalogue,
  CatalogueDataContainer,
  DataContainer
} from '../../state/features/globalSlice'
import { Price } from '../../state/features/storeSlice'

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
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [message, setMessage] = useState<any>(null)
  const [replyTo, setReplyTo] = useState<any>(null)
  const [valueTab, setValueTab] = React.useState(0)
  const [aliasValue, setAliasValue] = useState('')
  const [alias, setAlias] = useState<string[]>([])
  const [run, setRun] = useState(false)

  const userName = useMemo(() => {
    if (!user?.name) return ''
    return user.name
  }, [user])

  const dispatch = useDispatch()
  const navigate = useNavigate()

  function a11yProps(index: number) {
    return {
      id: `mail-tabs-${index}`,
      'aria-controls': `mail-tabs-${index}`
    }
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValueTab(newValue)
  }

  function CustomTabLabelDefault({ label }: any) {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span
          style={{
            textTransform: 'none'
          }}
        >
          {label}
        </span>
        <IconButton id="close-button" edge="end" color="inherit" size="small">
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </div>
    )
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
      const newDataContainer = { ...dataContainer }
      const dataContainerProducts = { ...dataContainer.products }
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to create product')
    }
    try {
      const storeId: string = currentStore?.id

      const parts = storeId.split('q-store-general-')
      const shortStoreId = parts[1]

      if (!currentStore) return

      // let lengthOfProducts = Object.keys(productsDataContainer || {})?.length

      const lastCatalogue: CatalogueDataContainer | undefined =
        dataContainer?.catalogues?.at(-1)
      let catalogue = null
      const listOfCataloguesToPublish: Catalogue[] = []
      const dataContainerToPublish: DataContainer = { ...dataContainer }
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

        if (catalogueResponse && !catalogueResponse?.error)
          catalogue = catalogueResponse
      }
      if (catalogue) listOfCataloguesToPublish.push(catalogue)

      Object.keys(productsToSave).forEach((key) => {
        const product = productsToSave[key]
        const priceInQort = product?.price?.find(
          (item: Price) => item?.currency === 'qort'
        )?.value
        if (!priceInQort)
          throw new Error('Cannot find price for one of your products')
        const lastCatalogueInList = listOfCataloguesToPublish.at(-1)
        const lastCatalogueInListIndex = listOfCataloguesToPublish.length - 1
        if (
          lastCatalogueInList &&
          Object.keys(lastCatalogueInList?.products)?.length < 10
        ) {
          lastCatalogueInList.products[key] = product
          dataContainerToPublish.products[key] = {
            created: product.created,
            priceQort: priceInQort,
            category: product.category,
            catalogueId: lastCatalogueInList.id
          }
          dataContainerToPublish.catalogues[lastCatalogueInListIndex].products[
            key
          ] = true
        } else {
          const catalogueId = uid()
          const id = `q-store-catalogue-${shortStoreId}-${catalogueId}`
          listOfCataloguesToPublish.push({
            id: id,
            products: {
              [key]: product
            }
          })
          dataContainerToPublish.products[key] = {
            created: product.created,
            priceQort: priceInQort,
            category: product.category,
            catalogueId
          }
          const lastCatalogueInListIndex = listOfCataloguesToPublish.length - 1
          dataContainerToPublish.catalogues[lastCatalogueInListIndex].products[
            key
          ] = true
        }
      })

      // if (!lastCatalogue || lastCatalogue?.products?.length === 10) {
      //   // create new catalogue
      //   // add product to new catalogue
      //   // add products to dataContainer catalogue products
      //   const catalogueId = uid()
      // const id = `q-store-catalogue-${shortStoreId}-${catalogueId}`
      //   return
      // }

      // let catalogue = null
      // const catalogueResponse =  await qortalRequest({
      //   action: 'FETCH_QDN_RESOURCE',
      //   name: name,
      //   service: 'DOCUMENT',
      //   identifier: lastCatalogue.id
      // })

      // if(catalogueResponse && !catalogueResponse?.error) catalogue = catalogueResponse
      // add products to catalogue
      // add products to dataContainer catalogue products
      //

      const catalogueObject: any = {
        // ...catalogue,
        // products: {
        //   ...catalogue.products
        //   [product.id]: product
        // }
      }
      const blogPostToBase64 = await objectToBase64(catalogueObject)
      if (!currentStore) return
      const productResource = {
        // identifier: id,
        title: 'Shoes',
        name,
        service: 'PRODUCT',
        filename: 'product.json',
        data64: blogPostToBase64
      }

      const multiplePublish = {
        action: 'PUBLISH_MULTIPLE_QDN_RESOURCES',
        resources: [productResource]
      }
      await qortalRequest(multiplePublish)

      dispatch(
        setNotification({
          msg: 'Message sent',
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

  console.log({ productsToSave })

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
            label={<CustomTabLabelDefault label={user?.name} />}
          />
        </Tabs>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}
      >
        <NewProduct />
      </Box>
      {Object.keys(productsToSave).length === 0 && (
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
      <ShowMessage
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        message={message}
        setReplyTo={setReplyTo}
      />

      <TabPanel value={valueTab} index={0}>
        <SimpleTable openMessage={() => {}} data={[]}></SimpleTable>
        {/* <LazyLoad onLoadMore={getMessages}></LazyLoad> */}
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
