import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductList from "../components/products/ProductList";
import Icon from "../constants/icons";
import { useCart } from "../contexts/CartContext";
import { useWish } from "../contexts/WishContext";
import { SIZES, COLORS } from "../constants";

const Products = ({ navigation }) => {
  const { itemCount } = useCart();
  const { wishCount } = useWish();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.upperRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.buttonWrap}>
            <Icon size={30} name="backbutton" />
          </TouchableOpacity>
          <Text style={styles.heading}>Products</Text>
          <View style={styles.lovebuy}>
            <TouchableOpacity onPress={() => navigation.navigate("Favourites")} style={styles.buttonWrap1}>
              <Icon size={30} name="heart" />
              <View style={styles.numbers}>
                {wishCount !== 0 ? (
                  <Text style={styles.number}>{wishCount}</Text>
                ) : (
                  <Text style={styles.number}>0</Text>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Cart")} style={styles.buttonWrap1}>
              <Icon size={30} name="cart" />
              <View style={styles.numbers}>
                {itemCount !== 0 ? (
                  <Text style={styles.number}>{itemCount}</Text>
                ) : (
                  <Text style={styles.number}>0</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <ProductList />
      </View>
    </SafeAreaView>
  );
};

export default Products;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },

  wrapper: {
    flex: 1,
    backgroundColor: COLORS.themew,
    alignItems: "center",
    justifyContent: "center",
  },

  upperRow: {
    width: SIZES.width - 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.large,
    top: SIZES.small,
    minHeight: 100,
    zIndex: 999,
  },

  heading: {
    color: COLORS.themeb,
    marginLeft: 5,
    fontFamily: "semibold",
    fontSize: SIZES.large,
  },
  buttonWrap: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 10,
    marginStart: 10,
  },
  lovebuy: {
    flexDirection: "row",
  },
  buttonWrap1: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  spaceRight: {},
  numbers: {
    padding: 3,
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
