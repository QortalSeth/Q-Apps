import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import EditIcon from '@mui/icons-material/Edit'
import {
  Box,
  Button,
  List,
  ListItem,
  Typography,
  useTheme
} from '@mui/material'
import { useFetchProducts } from '../../hooks/useFetchProducts'
import LazyLoad from '../../components/common/LazyLoad'
import { removePrefix } from '../../utils/blogIdformats'
import Masonry from 'react-masonry-css'
import ContextMenuResource from '../../components/common/ContextMenu/ContextMenuResource'
import { setIsLoadingGlobal } from '../../state/features/globalSlice'
import { Store } from '../../state/features/storeSlice'
import { useFetchStores } from '../../hooks/useFetchStores'

const breakpointColumnsObj = {
  default: 5,
  1600: 4,
  1300: 3,
  940: 2,
  700: 1,
  500: 1
}
interface BlogListProps {
  mode?: string
}
export const StoreList = ({ mode }: BlogListProps) => {
  const theme = useTheme()
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const [stores, setStores] = useState<Store[]>([])
  const hashMapStores = useSelector(
    (state: RootState) => state.store.hashMapStores
  )
  const { getStore, checkAndUpdateResource } = useFetchStores()
  // const stores = useSelector(
  //   (state: RootState) => state.store.stores
  // )
  const navigate = useNavigate()

  const getUserStores = React.useCallback(async () => {
    try {
      dispatch(setIsLoadingGlobal(true))
      const offset = stores.length
      //TODO - NAME SHOULD BE EXACT
      const query = `q-store-general`
      const url = `/arbitrary/resources/search?service=STORE&query=${query}&limit=20&exactmatchnames=true&includemetadata=true&offset=${offset}&reverse=true`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const responseData = await response.json()
      console.log({ responseData })
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
        }
      })
      console.log({ structureData })
      const copiedStores: Store[] = [...stores]
      structureData.forEach((storeItem: Store) => {
        const index = stores.findIndex((p: Store) => p.id === storeItem.id)
        if (index !== -1) {
          copiedStores[index] = storeItem
        } else {
          copiedStores.push(storeItem)
        }
      })
      setStores(copiedStores)
      for (const content of structureData) {
        if (content.owner && content.id) {
          const res = checkAndUpdateResource({
            id: content.id,
            updated: content.updated
          })
          if (res) {
            getStore(content.owner, content.id, content)
          }
        }
      }
    } catch (error) {
    } finally {
      dispatch(setIsLoadingGlobal(false))
    }
  }, [stores])
  const getStores = React.useCallback(async () => {
    await getUserStores()
  }, [getUserStores, user?.name])

  console.log({ stores, hashMapStores })
  return (
    <>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {stores.map((store: Store, index) => {
          const existingStore = hashMapStores[store.id]
          let storeItem = store
          if (existingStore) {
            storeItem = existingStore
          }
          const storeId = storeItem?.id || ''
          const storeOwner = storeItem?.owner || ''
          const storeTitle = storeItem?.title || 'missing metadata'
          return (
            <Box
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
              key={storeId}
            >
              <ContextMenuResource
                name={storeOwner}
                service="STORE"
                identifier={storeId}
                link={`qortal://APP/Q-Store/${storeOwner}/${storeId}`}
              >
                <p onClick={() => navigate(`/${storeOwner}/${storeId}`)}>
                  {storeTitle}
                </p>
              </ContextMenuResource>
            </Box>
          )
        })}
      </Masonry>
      <LazyLoad onLoadMore={getStores}></LazyLoad>
    </>
  )
}
