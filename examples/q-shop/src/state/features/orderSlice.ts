import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface OrderState {
  hashMapOrders: Record<string, Order>
  orders: Order[]
  isOpen: boolean
}
const initialState: OrderState = {
  hashMapOrders: {},
  orders: [],
  isOpen: false
}

interface Details {}

interface Delivery {
  customerName: string
  shippingAddress: {
    streetAddress: string
    city: string
    region: string
    country: string
    zipCode: string
  }
}

interface Payment {
  total: number
  currency: string
  transactionSignature: string
}
enum CommunicationMethod {
  QMail = 'Q-Mail'
}
export interface Order {
  created: number
  updated: number
  version?: number
  details?: Details
  delivery?: Delivery
  payment?: Payment
  communicationMethod?: CommunicationMethod[]
  user: string
  id: string
  totalPrice?: string
  status?: string
}

export interface Status {
  status: string
}

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    upsertOrders: (state, action) => {
      action.payload.forEach((order: Order) => {
        const index = state.orders.findIndex((p) => p.id === order.id)
        if (index !== -1) {
          state.orders[index] = order
        } else {
          state.orders.push(order)
        }
      })
    },
    addToHashMap: (state, action) => {
      const order = action.payload
      state.hashMapOrders[order.id] = {
        ...order,
        totalPrice: order.details.totalPrice
      }
    }
  }
})

export const { upsertOrders, addToHashMap } = orderSlice.actions

export default orderSlice.reducer
