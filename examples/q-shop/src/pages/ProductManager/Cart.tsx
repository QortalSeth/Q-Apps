import React, { useState } from 'react'
import { ReusableModal } from '../../components/modals/ReusableModal'
import { Box, Button, Input, Typography } from '@mui/material'

import { Descendant } from 'slate'
import ShortUniqueId from 'short-unique-id'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import { setIsOpen } from '../../state/features/cartSlice'
import { objectToBase64 } from '../../utils/toBase64'

const uid = new ShortUniqueId({
  length: 10
})

export const Cart = () => {
  const username = useSelector((state: RootState) => state.auth.user?.name)
  const usernamePublicKey = useSelector(
    (state: RootState) => state.auth.user?.publicKey
  )
  const isOpen = useSelector((state: RootState) => state.cart.isOpen)
  const currentCart = useSelector((state: RootState) => state.cart.currentCart)
  const hashMapProducts = useSelector(
    (state: RootState) => state.store.hashMapProducts
  )
  const catalogueHashMap = useSelector(
    (state: RootState) => state.global.catalogueHashMap
  )
  const dispatch = useDispatch()

  const closeModal = () => {
    dispatch(setIsOpen(false))
  }

  const handlePurchase = async () => {
    const details = Object.keys(currentCart?.orders || {}).reduce(
      (acc: any, key) => {
        const order = currentCart?.orders[key]
        const quantity = order?.quantity
        const productId = order?.productId
        const catalogueId = order?.catalogueId
        let product = null
        if (productId && catalogueId && catalogueHashMap[catalogueId]) {
          product = catalogueHashMap[catalogueId]?.products[productId]
        }
        if (!product) return acc
        const priceInQort =
          product.price?.find(
            (priceItem: any) => priceItem?.currency === 'qort'
          )?.value || null
        if (!priceInQort) throw new Error('Could not retrieve price')
        const totalProductPrice = priceInQort * quantity
        acc[productId] = {
          product,
          catalogueId,
          quantity,
          pricePerUnit: priceInQort,
          totalProductPrice: priceInQort * quantity
        }
        acc['totalPrice'] = acc['totalPrice'] + totalProductPrice
        return acc
      },
      {
        totalPrice: 0
      }
    )
    details['totalPrice'] = details['totalPrice'].toFixed(8)
    const priceToPay = details['totalPrice']
    console.log({ priceToPay })
    const storeOwner = currentCart.storeOwner
    if (!storeOwner) throw new Error('Cannot find store owner')
    let res = await qortalRequest({
      action: 'GET_NAME_DATA',
      name: storeOwner
    })
    const address = res.owner
    const resAddress = await qortalRequest({
      action: 'GET_ACCOUNT_DATA',
      address: address
    })
    if (!resAddress?.publicKey) throw new Error('Cannot find store owner')
    const responseSendCoin = await qortalRequest({
      action: 'SEND_COIN',
      coin: 'QORT',
      destinationAddress: address,
      amount: priceToPay
    })
    console.log({ responseSendCoin })
    const signature = responseSendCoin.signature
    try {
      const orderObject: any = {
        created: Date.now(),
        version: 1,
        details,
        delivery: {
          customerName: 'Phil',
          shippingAddress: {
            streetAddress: '2323 Street name',
            city: 'Milan',
            region: 'Lombardy',
            country: 'Italy',
            zipCode: '23233'
          }
        },
        payment: {
          total: priceToPay,
          currency: 'QORT',
          transactionSignature: signature
        },
        communicationMethod: ['Q-Mail']
      }
      const blogPostToBase64 = await objectToBase64(orderObject)
      console.log({ blogPostToBase64 })
      const orderId = uid()
      const storeId = currentCart.storeId
      if (!storeId) throw new Error('Cannot find store identifier')
      const parts = storeId.split('q-store-general-')
      const shortStoreId = parts[1]
      const productRequestBody = {
        action: 'PUBLISH_QDN_RESOURCE',
        identifier: `q-store-order-${shortStoreId}-${orderId}`,
        name: username,
        service: 'DOCUMENT_PRIVATE',
        filename: `order_${orderId}.json`,
        data64: blogPostToBase64,
        encrypt: true,
        publicKeys: [resAddress.publicKey, usernamePublicKey]
      }
      await qortalRequest(productRequestBody)
    } catch (error) {
      console.log({ error })
    }
  }

  console.log({ currentCart })
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%'
      }}
    >
      <ReusableModal
        open={isOpen}
        customStyles={{
          width: '96%',
          maxWidth: 1500,
          height: '96%'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            alignItems: 'center'
          }}
        ></Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 1,
            flexGrow: 1,
            overflow: 'auto',
            width: '100%'
          }}
        >
          {Object.keys(currentCart?.orders || {}).map((key) => {
            const order = currentCart?.orders[key]
            const quantity = order?.quantity
            const productId = order?.productId
            const catalogueId = order?.catalogueId
            let product = null
            if (productId && catalogueId && catalogueHashMap[catalogueId]) {
              product = catalogueHashMap[catalogueId]?.products[productId]
            }
            if (!product) return null
            const priceInQort =
              product.price?.find(
                (priceItem: any) => priceItem?.currency === 'qort'
              )?.value || null
            return (
              <Box key={key}>
                <Typography>{product.title}</Typography>
                <Typography>Quantity: {quantity}</Typography>
                <Typography>Price per unit: {priceInQort}</Typography>
                {priceInQort && (
                  <Typography>Total Price: {priceInQort * quantity}</Typography>
                )}
              </Box>
            )
          })}
          <Button variant="contained" onClick={handlePurchase}>
            Purchase
          </Button>
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'flex-end'
          }}
        >
          <Button variant="contained" onClick={closeModal}>
            Close
          </Button>
        </Box>
      </ReusableModal>
    </Box>
  )
}
