import React, { useEffect, useState } from 'react'
import { ReusableModal } from '../../components/modals/ReusableModal'
import {
  Box,
  Button,
  Input,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'

import { Descendant } from 'slate'
import ShortUniqueId from 'short-unique-id'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import { objectToBase64 } from '../../utils/toBase64'

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }]
  }
]
const uid = new ShortUniqueId()

export const ShowOrder = ({ isOpen, setIsOpen, order, from }: any) => {
  const [note, setNote] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const user = useSelector((state: RootState) => state.auth?.user)
  const username = useSelector((state: RootState) => state.auth.user?.name)
  const usernamePublicKey = useSelector(
    (state: RootState) => state.auth.user?.publicKey
  )
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

  useEffect(() => {
    if (from === 'ProductManager' && order) {
      setNote(order?.note || '')
      setSelectedStatus(order?.status || '')
    }
  }, [order, from])

  const updateStatus = async () => {
    try {
      const orderStateObject: any = {
        status: selectedStatus,
        note
      }
      const orderStatusToBase64 = await objectToBase64(orderStateObject)

      let res = await qortalRequest({
        action: 'GET_NAME_DATA',
        name: order.user
      })
      const address = res.owner
      const resAddress = await qortalRequest({
        action: 'GET_ACCOUNT_DATA',
        address: address
      })
      if (!resAddress?.publicKey) throw new Error('Cannot find store owner')
      const string = order.id

      const identifier = string.replace(/(q-store)(-order)/, '$1-status$2')
      const productRequestBody = {
        action: 'PUBLISH_QDN_RESOURCE',
        identifier: identifier,
        name: username,
        service: 'DOCUMENT_PRIVATE',
        filename: `${order.id}_status.json`,
        data64: orderStatusToBase64,
        encrypt: true,
        publicKeys: [resAddress.publicKey, usernamePublicKey]
      }
      await qortalRequest(productRequestBody)
    } catch (error) {
      console.log({ error })
    }
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
          {' '}
          <a
            href={`qortal://APP/Q-Mail?to=${order?.delivery?.customerName}`}
            className="qortal-link"
            style={{
              width: '100%',
              display: 'flex',
              gap: '5px',
              alignItems: 'center'
            }}
          >
            <EmailIcon
              sx={{
                color: '#50e3c2'
              }}
            />
            Message {order?.delivery?.customerName} on Q-Mail
          </a>
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
          {from === 'ProductManager' ? (
            <Box>
              <InputLabel id="status">Order Status</InputLabel>
              <Select
                name="status"
                value={selectedStatus}
                onChange={(event) => {
                  setSelectedStatus(event.target.value)
                }}
                variant="outlined"
                required
              >
                <MenuItem value="Received">Received</MenuItem>
                <MenuItem value="Shipped">Shipped</MenuItem>
                <MenuItem value="Refunded">Refunded</MenuItem>
              </Select>
              <TextField
                name="note"
                label="Note"
                value={note}
                variant="outlined"
                onChange={(e) => setNote(e.target.value)}
              />
              <Button onClick={updateStatus} variant="contained">
                Update Status
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography>Order Status</Typography>
              <Typography>status: {order?.status}</Typography>
              <Typography>{order?.note}</Typography>
            </Box>
          )}
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
