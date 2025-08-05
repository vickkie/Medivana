import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ListFilter, RefreshCcw } from "lucide-react-native";

import styles from "./styles/doctorCategoriesRow";
import Icon from "../../constants/icons";
import { COLORS, SIZES } from "../../constants";
import useFetch from "../../hook/useFetch";

// === Constants ===
const CACHE_KEY = "cached_specializations";
const CACHE_TTL = 5 * 60 * 60 * 1000; // 5 hrs

// === Category Card Component ===
const DoctorCategoryCard = ({ item, backColor, isSelected, onSelect }) => {
  const isActive = isSelected === item._id;

  const formatIconName = (str) => (str ? str.toLowerCase() : item?.bodypart);

  return (
    <TouchableOpacity style={styles.card} onPress={() => onSelect(item)}>
      {item._id === "all" ? (
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
            <Icon name={formatIconName(item.bodypart)} size={24} color={COLORS.white} />
            <Image source={{ uri: item.icon }} style={styles.icon} />
          </View>
          <Text style={[styles.title, isActive && { color: COLORS.themey }]}>
            {item.bodypart.charAt(0).toUpperCase() + item.bodypart.slice(1).toLowerCase()}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// === Main Component ===
const DoctorsCategoriesRow = ({ refreshList, setRefreshList, backColor = "#F0F5F9", setSelectedCat }) => {
  const { data, isLoading, error, refetch } = useFetch("specialization");

  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState();

  // Load cached data first
  useEffect(() => {
    const loadCache = async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (!cached) return;

        const { data: cachedData, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setCategories(cachedData);
        }
      } catch (err) {
        console.warn("Failed to load cache:", err);
      }
    };

    loadCache();
  }, []);

  // When data from API comes in, update state + cache
  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) return;

    const sorted = data.sort((a, b) => a.bodypart?.localeCompare(b.bodypart));

    const withAll = [
      {
        _id: "all",
        name: "all",
        bodypart: "All",
        icon: "https://cdn-icons-png.flaticon.com/512/992/992651.png",
      },
      ...sorted,
    ];

    setCategories(withAll);

    AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ data: withAll, timestamp: Date.now() })).catch((e) =>
      console.warn("Failed to cache data:", e)
    );
  }, [data]);

  // Trigger refetch if external refresh is requested
  useEffect(() => {
    if (refreshList) {
      refetch();
      setRefreshList(false);
    }
  }, [refreshList]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch();
    setTimeout(() => setRefreshing(false), 1000); // Prevents UI flicker
  }, []);

  // Handle category selection
  const handleSelect = (item) => {
    setSelectedCat(item.name === "all" ? null : item.name);
    setSelectedId(item._id);
  };

  const renderItem = useCallback(
    ({ item }) => (
      <DoctorCategoryCard item={item} backColor={backColor} isSelected={selectedId} onSelect={handleSelect} />
    ),
    [backColor, selectedId]
  );

  return (
    <View style={[styles.container, { marginBottom: 20 }]}>
      {isLoading && categories.length === 0 ? (
        <ActivityIndicator size={SIZES.xxLarge} color={COLORS.primary} />
      ) : error && categories.length === 0 ? (
        <View style={styles.errorContainer}>
          <TouchableOpacity onPress={refetch} style={styles.retryButton}>
            <RefreshCcw size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.errorText}>No internet. Try again.</Text>
        </View>
      ) : (
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10, columnGap: 8 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        />
      )}
    </View>
  );
};

export default DoctorsCategoriesRow;
