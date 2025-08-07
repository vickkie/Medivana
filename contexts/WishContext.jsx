import React, { createContext, useContext, useState, useEffect } from "react";
import { setItem, getItem } from "../utils/storage";
import Toast from "react-native-toast-message";

const WishContext = createContext();

export const WishProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
    });
  };

  // Load wishlist on start
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const saved = await getItem("wishlist");
        setWishlist(saved ? JSON.parse(saved) : []);
      } catch (err) {
        console.error("❌ Failed to load wishlist:", err);
      }
    };
    loadWishlist();
  }, []);

  // Save wishlist on change with a debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      setItem("wishlist", JSON.stringify(wishlist));
    }, 200);
    return () => clearTimeout(timeout);
  }, [wishlist]);

  const addToWishlist = (doctor) => {
    if (!doctor || !doctor._id) return;
    setWishlist((prev) => (prev.some((d) => d._id === doctor._id) ? prev : [...prev, doctor]));

    showToast("success", `${doctor?.firstname} Added to Favourites ❤️`, "added to favourites ");
  };

  const removeFromWishlist = (doctor) => {
    setWishlist((prev) => prev.filter((d) => d._id !== doctor._id));
    showToast("success", `${doctor?.firstname} Removed From favourites`, ` success`);
  };

  const toggleWishlistItem = (doctor) => {
    if (!doctor || !doctor._id) return;
    const exists = wishlist.some((d) => d._id === doctor._id);
    exists ? removeFromWishlist(doctor) : addToWishlist(doctor);
  };

  const isItemInWishlist = (doctor) => {
    return wishlist.some((d) => d._id === doctor._id);
  };

  const clearWishlist = () => setWishlist([]);

  return (
    <WishContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlistItem,
        isItemInWishlist,
        clearWishlist,
        wishCount: wishlist.length,
      }}
    >
      {children}
    </WishContext.Provider>
  );
};

export const useWish = () => useContext(WishContext);
