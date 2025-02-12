import { TouchableOpacity, Text, View, Image, Alert } from "react-native";
import React, { useState, useEffect, useContext, memo } from "react";
import { useNavigation } from "@react-navigation/native";
import styles from "./cartcardview.style";
import Icon from "../../constants/icons";
import Toast from "react-native-toast-message";
import { useCart } from "../../contexts/CartContext";
import { useWish } from "../../contexts/WishContext";
import { Ionicons, Fontisto } from "@expo/vector-icons";
import { COLORS } from "../../constants";

const CartCardView = ({ item }) => {
  // console.log(item);
  const navigation = useNavigation();
  const { cart, addToCart, removeFromCart } = useCart();
  const { wishlist, wishCount, addToWishlist, removeFromWishlist, clearWishlist } = useWish();
  const [count, setCount] = useState(item.quantity);
  const [selectedSize, setSelectedSize] = useState("M");

  const { id, title, price, imageUrl, quantity, size } = item || {};

  if (!item.id) return null;
  // return null;

  const parsedPrice =
    typeof price === "number" ? price : price != null ? parseFloat(String(price).replace(/[^0-9.-]+/g, "")) : 0;

  const [totalPrice, setTotalPrice] = useState(parsedPrice * quantity);
  const [isWished, setIsWished] = useState(false);

  useEffect(() => {
    const found = wishlist.some((wishItem) => wishItem.id === item.id && wishItem.size === selectedSize);
    setIsWished(found);
  }, [wishlist, item]);

  useEffect(() => {
    setTotalPrice(parsedPrice * count);
  }, [count]);

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2 || "",
      visibilityTime: 3000,
    });
  };

  const increment = () => {
    setCount((prevCount) => prevCount + 1);
    addToCart({ ...item, quantity: 1 });
  };

  const decrement = () => {
    if (count > 1) {
      setCount((prevCount) => prevCount - 1);
      addToCart({ ...item, quantity: -1 });
    }
  };

  const deleteItem = () => {
    Alert.alert(
      "Remove item",
      "Are you sure you want to remove this item from the cart?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: () => removeFromCart(id, size) },
      ],
      { cancelable: true }
    );
  };

  const toggleWishlist = () => {
    const product = { id: id, title: item.title, imageUrl: item.imageUrl, size: selectedSize, price: item.price };
    console.log(product, "wtf");

    if (isWished) {
      removeFromWishlist(item.id, selectedSize);
      showToast("info", "Removed", `${item.title} removed from wishlist`);
    } else {
      addToWishlist(product);
      showToast("success", "Added to Wishlist", `${item.title} added to wishlist ❤️`);
    }

    setIsWished(!isWished);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => navigation.navigate("ProductDetails", { item: item, itemid: id })}
      >
        <Image source={{ uri: imageUrl }} style={styles.image} />
      </TouchableOpacity>

      <View style={{ gap: 12 }}>
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>
            {title.length > 20 ? `${title.substring(0, 20)}...` : title}
          </Text>
          <View style={styles.lovehate}>
            <TouchableOpacity style={styles.lovebuttons} onPress={toggleWishlist}>
              {isWished ? (
                <Ionicons name="heart" size={20} color={COLORS.primary} />
              ) : (
                <Ionicons name="heart-outline" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.lovebuttons} onPress={deleteItem}>
              <Icon name="delete" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.size}>SIZE-{size}</Text>

        <View style={styles.priceadd}>
          <View style={styles.addminus}>
            <TouchableOpacity style={styles.addBtn} onPress={decrement}>
              <Icon name="minus" size={24} />
            </TouchableOpacity>
            <Text style={styles.quantity}>{count}</Text>
            <TouchableOpacity style={styles.addBtn} onPress={increment}>
              <Icon name="add" size={24} />
            </TouchableOpacity>
          </View>
          <Text style={styles.price}>{`Ksh ${totalPrice.toLocaleString()}`}</Text>
        </View>
      </View>
    </View>
  );
};

export default CartCardView;
