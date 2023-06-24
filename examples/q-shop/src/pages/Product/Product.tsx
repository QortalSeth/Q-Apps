import React, {useMemo} from 'react'
import { useDispatch } from 'react-redux'
import { setProductToCart } from '../../state/features/cartSlice'

export const Product = ({productItem}: any) => {
  const {title, description, created, price, id} = productItem
  const dispatch = useDispatch()
  const priceInQort = useMemo(()=> {
    return price?.find((priceItem: any)=> priceItem?.currency === 'qort')?.value || null
  }, [price])

  const addToCart = ()=> {
    dispatch(setProductToCart({
      id
    }))
  }
  return (
    <div>
      <p>{title}</p>
      <p>{description}</p>
      <p>{created}</p>
      <p>{priceInQort}</p>
      <button onClick={addToCart}>Add to cart</button>
    </div>
  )
}
