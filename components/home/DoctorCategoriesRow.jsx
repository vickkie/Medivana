import { FlatList, Text, View, ActivityIndicator, RefreshControl, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES } from "../../constants";
import styles from "./styles/doctorCategoriesRow.js";

import useFetch from "../../hook/useFetch";
import Icon from "../../constants/icons";
import { ListFilter, RefreshCcw } from "lucide-react-native";

const DoctorCategoryCard = ({ item, backColor, setSelectedCat, setisselected, isselected }) => {
  const isActive = isselected === item?._id;
  const formatIconName = (str) => (str ? str.toLowerCase() : item?.bodypart);

  return (
    <TouchableOpacity
      style={[styles.card]}
      onPress={() => {
        setSelectedCat(item?.name === "all" ? null : item?.name);
        setisselected(item?._id);
      }}
    >
      {item?._id === "all" ? (
        <View
          style={[
            styles.allCatFilter,
            { backgroundColor: backColor },
            isActive && { borderWidth: 1, borderColor: COLORS.themey },
          ]}
        >
          <ListFilter size={26} color={COLORS.themey} />
        </View>
      ) : (
        <>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: backColor },
              isActive && { borderWidth: 1, borderColor: COLORS.themey },
            ]}
          >
            <Icon name={formatIconName(item?.bodypart)} size={24} color={COLORS.white} />
            <Image source={{ uri: item?.icon }} style={styles.icon} />
          </View>
          <Text style={[styles.title, isActive && { color: COLORS.themey }]}>
            {item?.bodypart.charAt(0).toUpperCase() + item?.bodypart.slice(1).toLowerCase()}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const CACHE_KEY = "cached_specializationss";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const DoctorsCategoriesRow = ({ refreshList, setRefreshList, backColor = "#F0F5F9", setSelectedCat }) => {
  const { data, isLoading, error, refetch } = useFetch("specialization");
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isselected, setisselected] = useState();

  // Load cache on mount
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          const isFresh = Date.now() - parsed.timestamp < CACHE_TTL;
          if (isFresh) setCategories(parsed.data);
        }
      } catch (e) {
        console.warn("Failed to load specialization cache", e);
      }
    };
    loadCachedData();
  }, []);

  // Update state + cache when data comes in
  useEffect(() => {
    if (Array.isArray(data) && data.length) {
      const sorted = [...data].sort((a, b) => a.bodypart?.localeCompare(b.bodypart));

      const withAll = [
        {
          _id: "all",
          name: "all",
          bodypart: "All",
          icon: "https://cdn-icons-png.flaticon.com/512/992/992651.png", // optional custom icon
        },
        ...sorted,
      ];

      setCategories(withAll);

      AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ data: withAll, timestamp: Date.now() })).catch((e) =>
        console.warn("Failed to cache specialization data", e)
      );
    }
  }, [data]);

  useEffect(() => {
    if (refreshList) refetch();
    return () => setRefreshList(false);
  }, [refreshList]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      refetch();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const keyExtractor = useCallback((item) => item._id, []);
  const renderItem = useCallback(
    ({ item }) => (
      <DoctorCategoryCard
        item={item}
        backColor={backColor}
        setSelectedCat={setSelectedCat}
        setisselected={setisselected}
        isselected={isselected}
      />
    ),
    [backColor, isselected, setisselected, setSelectedCat]
  );

  return (
    <View style={[styles.container, { marginBottom: 20 }]}>
      {isLoading && !categories.length ? (
        <ActivityIndicator size={SIZES.xxLarge} color={COLORS.primary} />
      ) : error && !categories.length ? (
        <View style={styles.errorContainer}>
          <TouchableOpacity onPress={refetch} style={styles.retryButton}>
            <RefreshCcw size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ columnGap: 8, paddingHorizontal: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        />
      )}
    </View>
  );
};

export default DoctorsCategoriesRow;
