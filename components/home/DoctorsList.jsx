import React, { useEffect, useCallback, useState } from "react";
import { View, Text, FlatList, SafeAreaView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../constants";
import useFetch from "../../hook/useFetch";
import DoctorCard from "./DoctorCard";
import styles from "./styles/doctorsList.js";
import LottieView from "lottie-react-native";
import { RefreshCcw } from "lucide-react-native";

const CACHE_KEY = "cached_doctors";

const DoctorsList = ({
  refreshList,
  setRefreshList,
  field = "medic",
  limit = 8,
  speciality = "",
  setDoctorCount,
  searchQuery = "",
  scrollEnabled = true,
  externalLoadMore,
}) => {
  const [offset, setOffset] = useState(0);
  const [endReached, setEndReached] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [doctors, setDoctors] = useState([]);

  const url = `${field}?limit=${limit}&specialization=${speciality}&search=${searchQuery}&offset=${offset}`;
  const { data, isLoading, error, refetch, statusCode } = useFetch(url);
  // console.log(url);

  // 🔹 Handle new data from API
  useEffect(() => {
    if (statusCode === 200 && Array.isArray(data?.doctors)) {
      const fetched = data.doctors;
      // console.log(`Fetched ${fetched.length} doctors at offset ${offset}`);

      setDoctors((prev) => {
        if (offset === 0) return fetched; // fresh load

        // merge without duplicates
        const combined = [...prev, ...fetched];
        return Array.from(new Map(combined.map((d) => [d._id, d])).values());
      });

      setDoctorCount?.(data.totalCount || 0);

      // cache only the first batch
      if (offset === 0) {
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fetched)).catch(console.error);
      }

      // if fetched < limit, we reached the end
      if (fetched.length < limit) setEndReached(true);
      else setEndReached(false);
    }
  }, [data, statusCode, offset, limit, setDoctorCount]);

  // 🔹 Reset when filters/search change
  useEffect(() => {
    setOffset(0);
    setEndReached(false);
    setDoctors([]);
  }, [field, limit, speciality, searchQuery]);

  // 🔹 Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setOffset(0);
    setEndReached(false);
    refetch();
    setRefreshing(false);
  }, [refetch]);

  // 🔹 Load cached data if fetch fails
  useEffect(() => {
    if (offset === 0 && (error || !data?.doctors?.length)) {
      AsyncStorage.getItem(CACHE_KEY)
        .then((json) => {
          if (json) setDoctors(JSON.parse(json));
        })
        .catch(console.error);
    }
  }, [error, data, offset]);

  // 🔹 External refresh trigger
  useEffect(() => {
    if (refreshList) {
      onRefresh();
      setRefreshList(false);
    }
  }, [refreshList, onRefresh, setRefreshList]);

  // 🔹 Load more (scroll)
  const handleEndReached = useCallback(() => {
    if (!isLoading && !endReached) {
      setOffset((prev) => prev + limit);
    }
  }, [isLoading, endReached, limit]);

  // 🔹 Allow parent to manually load more if scroll disabled
  useEffect(() => {
    if (!scrollEnabled && typeof externalLoadMore === "function") {
      externalLoadMore(() => {
        if (!isLoading && !endReached) {
          setOffset((prev) => prev + limit);
        }
      });
    }
  }, [externalLoadMore, scrollEnabled, isLoading, endReached, limit]);

  // 🔹 Render doctor item
  const renderItem = useCallback(({ item }) => <DoctorCard doctor={item} showBook />, []);
  const keyExtractor = useCallback((item, index) => item?._id ?? `key-${index}`, []);

  // 🔹 Render loading footer (for last 8 + 2 scenario)
  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && doctors.length === 0 ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : doctors.length === 0 ? (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>No medics available</Text>
          <View style={styles.animationWrapper}>
            <LottieView source={require("../../assets/data/doc-quiz.json")} autoPlay loop style={styles.animation} />
          </View>
          <TouchableOpacity onPress={refetch} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
            <RefreshCcw color={COLORS.themew} size={20} />
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          scrollEnabled={scrollEnabled}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          onEndReachedThreshold={0.5}
          onEndReached={scrollEnabled ? handleEndReached : null}
          ListFooterComponent={renderFooter}
        />
      )}
    </SafeAreaView>
  );
};

export default DoctorsList;
