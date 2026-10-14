import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { setItem, getItem } from "../utils/storage";
import { AuthContext } from "../components/auth/AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const saveTimeout = useRef(null);
  const { userLogin } = useContext(AuthContext);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await getItem("cart");
        if (Array.isArray(savedCart)) {
          setCart(savedCart);
        }
      } catch (error) {
        if (__DEV__) console.error("Failed to load cart:", error);
      }
    };

    loadCart();
  }, []);

  // Drop in-memory state on logout so the debounced save can't
  // resurrect the purged "cart" key for the next user.
  useEffect(() => {
    if (!userLogin) setCart([]);
  }, [userLogin]);

  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      setItem("cart", cart);
    }, 300);
  }, [cart]);

  const addToCart = useCallback((product) => {
    if (!product || !product.id) {
      console.error("Invalid product:", product);
      return;
    }

    setCart((prevCart) => {
      const index = prevCart.findIndex((item) => item.id === product.id && item.size === product.size);

      if (index !== -1) {
        const updated = [...prevCart];
        updated[index].quantity += product.quantity || 1;
        return updated;
      }

      return [...prevCart, { ...product, quantity: product.quantity || 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id, size) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === id && item.size === size)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      addToCart,
      removeFromCart,
      clearCart,
    }),
    [cart, cartCount, addToCart, removeFromCart, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
