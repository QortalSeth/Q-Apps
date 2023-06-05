import React, { useState } from 'react'
import { ReusableModal } from '../../components/modals/ReusableModal'
import { Box, Button, Input, Typography } from '@mui/material'

import { Descendant } from 'slate'
import ShortUniqueId from 'short-unique-id'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../state/store'

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }]
  }
]
const uid = new ShortUniqueId()

export const ShowOrder = ({ isOpen, setIsOpen, order }: any) => {
  const user = useSelector((state: RootState) => state.auth?.user)
  const [paymentInfo, setPaymentInfo] = useState(null)
  const dispatch = useDispatch()
  const openModal = () => {
    setIsOpen(true)
  }
  const closeModal = () => {
    setIsOpen(false)
  }

  const getPaymentInfo = async (signature: string) => {
    try {
      const url = `/transactions/signature/${signature}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const responseData = await response.json()
      if (responseData && !responseData.error) {
        setPaymentInfo(responseData)
      }
    } catch (error) {}
  }

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
          height: '96%',
          wordBreak: 'break-word'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            alignItems: 'center'
          }}
        >
          Message {order?.delivery?.customerName} on Q-Mail
        </Box>

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
          <Box>
            <Typography variant="body1" color="text.primary">
              Order Payment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total payment:{' '}
              {`${order?.payment?.total}${order?.payment.currency}`}
            </Typography>
            <Button
              variant="contained"
              onClick={() =>
                getPaymentInfo(order?.payment?.transactionSignature)
              }
            >
              See payment transaction
            </Button>
            {paymentInfo && (
              <Box>
                {Object.keys(paymentInfo || {}).map((key) => {
                  return (
                    <Typography variant="body2" color="text.secondary">
                      {key}: <span>{paymentInfo[key]}</span>
                    </Typography>
                  )
                })}
              </Box>
            )}
          </Box>
          <Box>
            <Typography variant="body1" color="text.primary">
              Order Details
            </Typography>
            {Object.keys(order?.details || {}).map((key) => {
              const product = order.details[key]
              const currency = order?.payment.currency
              return (
                <Box key={key}>
                  <Typography variant="body2" color="text.secondary">
                    Product Id: {product?.product?.id}
                    Product title: {product?.product?.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quantity: {product?.quantity} Price per unit:{' '}
                    {product?.pricePerUnit}
                    {currency} Total: {product?.totalPrice}
                    {currency}
                  </Typography>
                </Box>
              )
            })}
          </Box>
          <Box>
            <Typography variant="body1" color="text.primary">
              Delivery Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customer name:{order?.delivery?.customerName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Shipping Address
            </Typography>
            <Box>
              {Object.keys(order?.delivery?.shippingAddress || {}).map(
                (key) => {
                  return (
                    <Typography variant="body2" color="text.secondary">
                      {key}: <span>{order.delivery.shippingAddress[key]}</span>
                    </Typography>
                  )
                }
              )}
            </Box>
          </Box>
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
