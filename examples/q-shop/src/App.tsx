// @ts-nocheck

import { Routes, Route } from 'react-router-dom'
import { Product } from './pages/Product/Product'
import { StoreList } from './pages/StoreList/StoreList'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { lightTheme, darkTheme } from './styles/theme'
import { store } from './state/store'
import { Provider } from 'react-redux'
import GlobalWrapper from './wrappers/GlobalWrapper'
import DownloadWrapper from './wrappers/DownloadWrapper'
import Notification from './components/common/Notification/Notification'
import { useState } from 'react'
import { ProductManager } from './pages/ProductManager/ProductManager'
import { Store } from './pages/Store/Store'

function App() {
  const themeColor = window._qdnTheme


  return (
    <Provider store={store}>
      <ThemeProvider theme={themeColor === 'light' ? lightTheme : darkTheme}>
        <Notification />
        <DownloadWrapper>
          <GlobalWrapper>
            <CssBaseline />

            <Routes>
              <Route
                path="/:user/:store/:product"
                element={<Product />}
              />
             
              <Route
                path="/product-manager"
                element={<ProductManager  />}
              />
              <Route
                path="/:user/:store"
                element={<Store  />}
              />
              <Route path="/" element={<StoreList />} />
            </Routes>
          </GlobalWrapper>
        </DownloadWrapper>
      </ThemeProvider>
    </Provider>
  )
}

export default App
