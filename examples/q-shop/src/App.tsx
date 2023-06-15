// @ts-nocheck
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Product } from "./pages/Product/Product";
import { StoreList } from "./pages/StoreList/StoreList";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { lightTheme, darkTheme } from "./styles/theme";
import { store } from "./state/store";
import { Provider } from "react-redux";
import { Store } from "./pages/Store/Store";
import { MyOrders } from "./pages/MyOrders/MyOrders";
import { ErrorElement } from "./components/common/Error/ErrorElement";
import GlobalWrapper from "./wrappers/GlobalWrapper";
import Notification from "./components/common/Notification/Notification";
import { ProductManager } from "./pages/ProductManager/ProductManager";

function App() {
  // const themeColor = window._qdnTheme

  const [theme, setTheme] = useState("dark");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (e: ErrorEvent): void => {
      setError(e.error);
    };
    window.addEventListener("error", errorHandler);
    return () => {
      window.removeEventListener("error", errorHandler);
    };
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
        <Notification />
        <GlobalWrapper setTheme={(val: string) => setTheme(val)}>
          <CssBaseline />
          {error?.message ? (
            <ErrorElement message={error?.message} />
          ) : (
            <Routes>
              <Route path="/:user/:store/:product" element={<Product />} />
              <Route path="/product-manager" element={<ProductManager />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/:user/:store" element={<Store />} />
              <Route path="/" element={<StoreList />} />
            </Routes>
          )}
        </GlobalWrapper>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
