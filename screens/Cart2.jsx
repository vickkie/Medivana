import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import CartList from "../components/cart/CartList";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../constants";
import Icon from "../constants/icons";
import { AuthContext } from "../components/auth/AuthContext";
import { useCart } from "../contexts/CartContext";
import { getItem, setItem } from "../utils/storage"; // Updated to use AsyncStorage

const Cart = () => {
  const navigation = useNavigation();
  const { userLogin, userData } = React.useContext(AuthContext);
  const { itemCount, handleItemCountChange } = useCart();
  const [cartItems, setCartItems] = useState([]);

  // Load cart items from AsyncStorage when the component mounts
  useEffect(() => {
    const loadCart = async () => {
      const storedCart = await getItem("cart");
      if (storedCart) {
        setCartItems(storedCart);
      }
    };
    loadCart();
  }, []);

  // Update AsyncStorage when cartItems changes
  useEffect(() => {
    setItem("cart", cartItems);
  }, [cartItems]);

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.upperRow}>
          <View style={styles.upperButtons}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
              <Icon name="backbutton" size={26} />
            </TouchableOpacity>
            <Text style={styles.topheading}>cart</Text>
            <TouchableOpacity style={styles.buttonWrap}>
              <Icon name="cart" size={26} />
              <View style={styles.numbers}>
                <Text style={styles.number}>{cartItems.length || 0}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.lowerheader}>
            <Text style={styles.heading}>My cart</Text>
            <Text style={styles.statement}>{cartItems.length} items in my cart</Text>
            <View style={styles.location}>
              <TouchableOpacity style={styles.locationName}>
                <Icon name="location" size={24} />
                {userLogin ? (
                  <Text style={{ marginLeft: 6 }}>{capitalizeFirstLetter(userData.location)}</Text>
                ) : (
                  <TouchableOpacity onPress={() => navigation.navigate("UserDetails")}>
                    <Text> Configure</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.rightLocation} onPress={() => navigation.navigate("UserDetails")}>
                <Text>change</Text>
                <View style={styles.toggleLocation}>
                  <Icon name="tuning" size={24} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <ScrollView>
          <CartList onItemCountChange={handleItemCountChange} cartData={cartItems} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Cart;

const styles = StyleSheet.create({
  textStyles: {
    fontFamily: "bold",
    fontSize: 19,
  },
  heading: {
    fontFamily: "bold",
    textTransform: "capitalize",
    fontSize: SIZES.large,
    textAlign: "left",
    color: COLORS.themeb,
    marginStart: 20,
  },
  topheading: {
    fontSize: SIZES.medium,
    textAlign: "center",
    color: COLORS.themeb,
    fontFamily: "GtAlpine",
  },
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.white,
    flexDirection: "column",
  },
  upperRow: {
    width: SIZES.width - 20,
    marginHorizontal: SIZES.xSmall,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.large,
    top: SIZES.xxSmall,
    zIndex: 999,
    minHeight: 120,
  },
  upperButtons: {
    width: SIZES.width - 20,
    marginHorizontal: SIZES.xSmall,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: SIZES.xSmall,
    top: SIZES.xxSmall,
  },
  backBtn: {
    left: 10,
  },
  buttonWrap: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 10,
  },
  lowerheader: {
    flexDirection: "column",
    justifyContent: "flex-start",
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
  },
  statement: {
    fontFamily: "regular",
    paddingLeft: 10,
    paddingVertical: 15,
  },
  location: {
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themew,
    width: SIZES.width - 40,
  },
  toggleLocation: {
    right: 10,
    padding: 7,
    backgroundColor: COLORS.white,
    borderRadius: 100,
  },
  homeheading: {
    fontFamily: "regular",
    textTransform: "capitalize",
    fontSize: SIZES.medium,
    textAlign: "left",
    color: COLORS.themeb,
    marginStart: 10,
  },
  rightLocation: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationName: {
    paddingLeft: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  numbers: {
    width: 20,
    height: 20,
    backgroundColor: COLORS.themey,
    color: COLORS.themew,
    borderRadius: 100,
    position: "absolute",
    top: "-10%",
    left: "-10%",
    justifyContent: "center",
    alignItems: "center",
  },
  number: {
    color: COLORS.white,
  },
});
