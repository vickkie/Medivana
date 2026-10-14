import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { setItem, getItem } from "../utils/storage";
import { AuthContext } from "../components/auth/AuthContext";
import Toast from "react-native-toast-message";

const WishContext = createContext();

export const WishProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { userLogin } = useContext(AuthContext);

  const showToast = useCallback((type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
    });
  }, []);

  // Load wishlist on start
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const saved = await getItem("wishlist");
        setWishlist(Array.isArray(saved) ? saved : []);
      } catch (err) {
        if (__DEV__) console.error("Failed to load wishlist:", err);
      }
    };
    loadWishlist();
  }, []);

  // Drop in-memory state on logout so the debounced save can't
  // resurrect the purged "wishlist" key for the next user.
  useEffect(() => {
    if (!userLogin) setWishlist([]);
  }, [userLogin]);

  // Save wishlist on change with a debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      setItem("wishlist", wishlist);
    }, 200);
    return () => clearTimeout(timeout);
  }, [wishlist]);

  const addToWishlist = useCallback(
    (doctor) => {
      if (!doctor || !doctor._id) return;
      setWishlist((prev) => (prev.some((d) => d._id === doctor._id) ? prev : [...prev, doctor]));

      showToast("success", `${doctor?.firstname} Added to Favourites ❤️`, "added to favourites ");
    },
    [showToast],
  );

  const removeFromWishlist = useCallback(
    (doctor) => {
      setWishlist((prev) => prev.filter((d) => d._id !== doctor._id));
      showToast("success", `${doctor?.firstname} Removed From favourites`, ` success`);
    },
    [showToast],
  );

  const toggleWishlistItem = useCallback(
    (doctor) => {
      if (!doctor || !doctor._id) return;
      const exists = wishlist.some((d) => d._id === doctor._id);
      exists ? removeFromWishlist(doctor) : addToWishlist(doctor);
    },
    [wishlist, addToWishlist, removeFromWishlist],
  );

  const isItemInWishlist = useCallback(
    (doctor) => {
      return wishlist.some((d) => d._id === doctor._id);
    },
    [wishlist],
  );

  const clearWishlist = useCallback(() => setWishlist([]), []);

  const value = useMemo(
    () => ({
      wishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlistItem,
      isItemInWishlist,
      clearWishlist,
      wishCount: wishlist.length,
    }),
    [wishlist, addToWishlist, removeFromWishlist, toggleWishlistItem, isItemInWishlist, clearWishlist],
  );

  return <WishContext.Provider value={value}>{children}</WishContext.Provider>;
};

export const useWish = () => useContext(WishContext);
