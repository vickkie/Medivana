import { FlatList, Text, View, ActivityIndicator, RefreshControl, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { COLORS, SIZES } from "../../constants";
import styles from "./styles/doctorCategoriesRow.js";
import { Ionicons } from "@expo/vector-icons";
import useFetch from "../../hook/useFetch";
import Icon from "../../constants/icons";

const DoctorCategoryCard = ({ item }) => {
  const formatIconName = (str) => (str ? str.toLowerCase() : item?.bodypart);
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Icon name={formatIconName(item?.bodypart)} size={24} color={COLORS.white} />
        {console.warn(formatIconName(item?.bodypart))}
        <Image source={{ uri: item?.icon }} style={styles.icon} />
      </View>
      <Text style={styles.title}>{item?.bodypart.charAt(0).toUpperCase() + item?.bodypart.slice(1).toLowerCase()}</Text>
    </View>
  );
};

const DoctorsCategoriesRow = ({ refreshList, setRefreshList }) => {
  const { data, isLoading, error, refetch } = useFetch("specialization");
  const [refreshing, setRefreshing] = useState(false);

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

  const dataArray = Array.isArray(data) ? [...data].sort((a, b) => a.bodypart?.localeCompare(b.bodypart)) : [];

  const keyExtractor = useCallback((item) => item._id, []);

  const renderItem = useCallback(({ item }) => <DoctorCategoryCard item={item} />, []);

  return (
    <View style={[styles.container, { marginBottom: 20 }]}>
      {isLoading ? (
        <ActivityIndicator size={SIZES.xxLarge} color={COLORS.primary} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorMessage}>Couldn’t load categories</Text>
          <TouchableOpacity onPress={refetch} style={styles.retryButton}>
            <Ionicons size={24} name="reload-circle" color={COLORS.white} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={dataArray}
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
