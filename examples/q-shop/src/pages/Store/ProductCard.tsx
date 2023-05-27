import React from 'react'
import { Card, CardContent, CardMedia, Typography, Button } from '@mui/material'
import { Product } from '../../state/features/storeSlice'
import { useDispatch } from 'react-redux'
import { setProductToCart } from '../../state/features/cartSlice'

// export interface IProduct {
//   id: string
//   title: string
//   price: number
//   image?: string
//   images?: any[]
//   description: string
// }

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart
}) => {
  const dispatch = useDispatch()
  const profileImg = product?.images?.[0]
  return (
    <Card
      sx={{ maxWidth: 345 }}
      onClick={() => {
        dispatch(
          setProductToCart({
            id: product.id
          })
        )
      }}
    >
      <CardMedia
        component="img"
        height="140"
        image={profileImg}
        alt={product?.title}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {product?.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product?.description}
        </Typography>
        <Typography variant="body1" color="text.primary">
          {/* $ {product?.price} */}
        </Typography>
      </CardContent>
      <Button
        color="primary"
        onClick={() => {
          if (onAddToCart) {
            onAddToCart(product)
          }
        }}
      >
        Add to Cart
      </Button>
    </Card>
  )
}
