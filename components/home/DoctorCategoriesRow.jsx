import { FlatList, Text, View, ActivityIndicator, RefreshControl, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES } from "../../constants";
import styles from "./styles/doctorCategoriesRow.js";

import useFetch from "../../hook/useFetch";
import Icon from "../../constants/icons";
import { RefreshCcw } from "lucide-react-native";

const DoctorCategoryCard = ({ item }) => {
  const formatIconName = (str) => (str ? str.toLowerCase() : item?.bodypart);
  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Icon name={formatIconName(item?.bodypart)} size={24} color={COLORS.white} />
          <Image source={{ uri: item?.icon }} style={styles.icon} />
        </View>
        <Text style={styles.title}>
          {item?.bodypart.charAt(0).toUpperCase() + item?.bodypart.slice(1).toLowerCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const CACHE_KEY = "cached_specializations";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const DoctorsCategoriesRow = ({ refreshList, setRefreshList }) => {
  const { data, isLoading, error, refetch } = useFetch("specialization");
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

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
      setCategories(sorted);

      AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ data: sorted, timestamp: Date.now() })).catch((e) =>
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
  const renderItem = useCallback(({ item }) => <DoctorCategoryCard item={item} />, []);

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
