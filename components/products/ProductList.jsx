import { FlatList, Text, View, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import React, { useRef, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { COLORS, SIZES } from "../../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./productlist.style";
import ProductsCardView from "./ProductsCardView";

import { useRoute } from "@react-navigation/native";
import { BACKEND_PORT } from "@env";

const ProductList = ({ sendDataToParent, routeParams }) => {};

export default ProductList;
