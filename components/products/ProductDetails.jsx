import { Text, TouchableOpacity, View, Image, ScrollView, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import React, { useState, useContext, useEffect } from "react";

import { COLORS } from "../../constants";
import styles from "./productdetails.style";
// import Animated from "react-native-reanimated";
import Icon from "../../constants/icons";
import usePost from "../../hook/usePost";
import { AuthContext } from "../auth/AuthContext";
import useFetch from "../../hook/useFetch";
import Toast from "react-native-toast-message";

import { useCart } from "../../contexts/CartContext";
import { useWish } from "../../contexts/WishContext";
const ProductDetails = ({ navigation }) => {};

export default ProductDetails;
