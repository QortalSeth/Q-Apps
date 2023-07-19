import React, {useEffect, useMemo, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Cart as CartInterface, setIsOpen, setProductToCart} from '../../state/features/cartSlice'
import {RootState} from "../../state/store";
import {useParams} from "react-router-dom";
import {Button, Drawer, IconButton, InputAdornment, TextField, useTheme} from "@mui/material";
import TabImageList from "../../components/common/TabImageList";
import {Product} from "../../state/features/storeSlice"
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import {CartIcon} from "../../components/layout/Navbar/Navbar-styles";
import {CartIconContainer, NotificationBadge} from "../Store/Store-styles";

export const ProductPage = () => {
    const dispatch = useDispatch()
    const params = useParams()
    const theme = useTheme();
    const productID = params.product;
    const catalogueID = params.catalogue;
    const noProduct = <div>Product ID ${productID} Not Found</div>

    const productDebugging = false
    if (productID) {

        const [cartAddCount, setCartAddCount] = useState<string>('1')
        const [totalCartQuantity, setTotalCartQuantity] = useState<number>(0);
        const global = useSelector((state: RootState) => state.global);
        const {carts} = useSelector((state: RootState) => state.cart);
        const { user } = useSelector((state: RootState) => state.auth);
        const { storeId, storeOwner } = useSelector((state: RootState) => state.store);

        if (productDebugging) console.log('params is: ', params)
        if (productDebugging) console.log('ID is: ', productID)


        // Set cart notifications when cart changes
        useEffect(() => {
            if (Object.keys(carts).length > 0 && user?.name && storeId) {
                const shopCart: CartInterface = carts[storeId];
                // Get the orders of this cart
                const orders = shopCart?.orders || {};
                let totalQuantity = 0;
                Object.keys(orders).forEach((key) => {
                    const order = orders[key];
                    const { quantity } = order;
                    totalQuantity += quantity;
                });
                setTotalCartQuantity(totalQuantity);
            }
        }, [carts, user, storeId]);

        const getProductData = (productID: string | undefined) => {
            if (productID) {
                if (catalogueID) {
                    const productData: Product = global?.catalogueHashMap[catalogueID].products[productID];
                    if (productDebugging) console.log('catalogueID is: ', catalogueID);
                    return productData
                } else return undefined
            } else return undefined
        }

        const product = getProductData(productID)
        console.log('Product is: ', product)


        // const priceInQort = useMemo(()=> {
        //     return price?.find((priceItem: any)=> priceItem?.currency === 'qort')?.value || null
        // }, [price])
        // @ts-ignore
        // const price = product?.price[0];
        // const priceString = `currency: ${price.currency}  amount: ${price.value}`

        const price = product?.price?.find(
            (item) => item?.currency === "qort"
        )?.value;

        const addToCart = () => {
            if (product) {
                for (let i = 0; i < Number(cartAddCount); i++) {
                    dispatch(
                        setProductToCart({
                            productId: product.id,
                            catalogueId: product.catalogueId,
                            storeId,
                            storeOwner
                        })
                    );
                }
            }
        }
        const sidebarStyle = {}
        const debugNumFilter = true

        const setMinMaxValueDec = (value: string, minValue: number, maxValue: number): string => {
            let valueNum = Number(`${value}`);

            // Bounds checking on valueNum
            valueNum = Math.min(valueNum, maxValue);
            valueNum = Math.max(valueNum, minValue);

            return valueNum.toString();
        };

        const numFilter = (value: string, minValue: number, maxValue: number, emptyReturn = '') => {
            if (debugNumFilter) console.log('starting value is: ', value);
            if (value === '-1') {
                if (debugNumFilter) console.log('filtered value is: ', emptyReturn);
                return emptyReturn;
            }
            const isPositiveNum = /^[0-9]+$/.test(value);
            const isNotNum = /[^0-9]/;

            if (isPositiveNum) {
                const minMaxCheck = setMinMaxValueDec(value, minValue, maxValue);
                if (debugNumFilter) console.log('filtered value is: ', minMaxCheck);
                return minMaxCheck;
            }

            return value.replace(isNotNum, '');
        };

        const minCart = 1;
        const maxCart = 10;
        const changeValue = (value: string, change: number) => {
            if (!value) value = '1';
            const valueNum = Number(value)
            setCartAddCount(numFilter((valueNum + change).toString(), minCart, maxCart))
        }


        return (
            product ?
                <div>
                    <div style={{display: 'grid', gridTemplateColumns: `repeat(3, 1fr)`}}>
                        <TabImageList divStyle={sidebarStyle} images={product.images}/>
                        <div>
                            <h1>{product.title}</h1>
                            <p>{product.description}</p>
                            <h3>Price: {price}</h3>
                            <TextField InputProps={{
                                endAdornment: (
                                    <InputAdornment position='end'>
                                        <IconButton onClick={(e) => changeValue(cartAddCount, 1)}><AddIcon/> </IconButton>
                                        <IconButton onClick={(e) => changeValue(cartAddCount, -1)}><RemoveIcon/> </IconButton>
                                    </InputAdornment>)
                            }}
                                       value={cartAddCount}
                                       onChange={(e) => {
                                           setCartAddCount(numFilter(e.currentTarget.value || '-1', minCart, maxCart))
                                       }}
                                       autoComplete='off'
                                       label='Quantity'
                                       style={{width: '34vw'}}
                            >
                            </TextField>
                            <Button style={{marginTop: '2px', width: '34vw'}} variant={'contained'} color={'primary'}
                                    size={'large'} onClick={addToCart}>
                                <CartIcon
                                    color={theme.palette.text.primary}
                                    height={"32"}
                                    width={"32"}
                                /><span style={{marginLeft: '5px'}}>Add to Cart</span></Button>
                        </div>
                        {user?.name ? (
                            <div style={{display: 'flex', justifyContent:'end', paddingRight:'10px', paddingTop:'10px'}}>
                                <CartIconContainer>
                                    <CartIcon
                                        color={theme.palette.text.primary}
                                        height={"32"}
                                        width={"32"}
                                        onClickFunc={() => {
                                            dispatch(setIsOpen(true));
                                        }}
                                    />
                                    {totalCartQuantity > 0 && (
                                        <NotificationBadge>{totalCartQuantity}</NotificationBadge>
                                    )}
                                </CartIconContainer>
                            </div>
                        ) : null}
                    </div>
                </div>
                : noProduct
        )
    } else return noProduct
}

