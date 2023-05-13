import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToHashMap } from '../state/features/storeSlice'

import { RootState } from '../state/store'
import { fetchAndEvaluateProducts } from '../utils/fetchPosts'

export const useFetchProducts = () => {
  const dispatch = useDispatch()
  const hashMapProducts = useSelector(
    (state: RootState) => state.store.hashMapProducts
  )

  const getProduct = async (user: string, productId: string, content: any) => {
    const res = await fetchAndEvaluateProducts({
      user,
      productId,
      content
    })

    dispatch(addToHashMap(res))
  }

  return {
    getProduct,
    hashMapProducts
  }
}
