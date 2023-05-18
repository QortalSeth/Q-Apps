import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store'


interface CartState {
  hashMapCarts: Record<string, Cart>
  currentCart: {
    orders: Record<string, Order>
    lastUpdated: number | null
    storeId: string | null
    storeOwner: string | null
  }
  isOpen: boolean
}
const initialState: CartState = {
  hashMapCarts: {},
  currentCart: {
    orders: {},
    lastUpdated: null,
    storeId: null,
    storeOwner: null
  },
  isOpen: false
}

 export interface Order {
  productId: string
  quantity: number
 }

export interface Cart {
  orders: Record<string, Order>
  lastUpdated: number
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
   
    setProductToCart: (state, action) => {
      const {id} = action.payload;
      let order = state.currentCart?.orders[id];
  
      if (order) {
          // If an order already exists, increment its quantity.
          order.quantity += 1;
      } else {
          // If no order exists, create a new one with quantity 1.
          order = {
              quantity : 1,
              productId: id
          };
      }
  
      state.currentCart.orders[id] = order;
      state.currentCart.lastUpdated = Date.now()
    },
    setIsOpen: (state, action) => {
      
      state.isOpen = action.payload
    },
    setStoreId: (state, action) => {
      
      state.currentCart.storeId = action.payload
    },
    setStoreOwner: (state, action) => {
      
      state.currentCart.storeOwner = action.payload
    },
  }
})

export const {
  setProductToCart,
  setIsOpen,
  setStoreId,
  setStoreOwner
} = cartSlice.actions

export default cartSlice.reducer

