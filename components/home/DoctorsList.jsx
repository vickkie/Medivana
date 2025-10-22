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

  // 🧩 Cache-busting param to always fetch fresh on refresh
  const url = `${field}?limit=${limit}&specialization=${speciality}&search=${searchQuery}&offset=${offset}${
    refreshing ? `&_t=${Date.now()}` : ""
  }`;

  const { data, isLoading, error, refetch, statusCode } = useFetch(url);

  // 🧠 Merge new data and cache properly
  useEffect(() => {
    const updateDoctors = async () => {
      if (statusCode === 200 && Array.isArray(data?.doctors)) {
        const fetched = data.doctors;

        setDoctors((prev) => {
          if (offset === 0) return fetched; // full refresh
          const merged = [...prev, ...fetched];
          return Array.from(new Map(merged.map((d) => [d._id, d])).values());
        });

        setDoctorCount?.(data.totalCount || 0);
        setEndReached(fetched.length < limit);

        // 🧠 Always overwrite cache on first page load (fresh data)
        if (offset === 0) {
          try {
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fetched));
          } catch (err) {
            console.error("Cache write error:", err);
          }
        }
      }
    };

    updateDoctors();
  }, [data, statusCode, offset, limit, setDoctorCount]);

  // 🧹 Reset list when filters/search change
  useEffect(() => {
    setOffset(0);
    setEndReached(false);
    setDoctors([]);
  }, [field, limit, speciality, searchQuery]);

  // 🔄 Pull-to-refresh logic (force network, no cache)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setOffset(0);
    setEndReached(false);

    try {
      // If your useFetch hook supports options, pass force:true
      await refetch({ force: true });
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // 🧰 Load cached data ONLY when API fails completely
  useEffect(() => {
    const loadCache = async () => {
      if (offset === 0 && error) {
        try {
          const json = await AsyncStorage.getItem(CACHE_KEY);
          if (json) {
            const cached = JSON.parse(json);
            setDoctors(cached);
            console.log("Loaded cached doctors (fallback).");
          }
        } catch (err) {
          console.error("Cache load error:", err);
        }
      }
    };

    loadCache();
  }, [error, offset]);

  // 🌐 External refresh trigger from parent
  useEffect(() => {
    if (refreshList) {
      onRefresh();
      setRefreshList(false);
    }
  }, [refreshList, onRefresh, setRefreshList]);

  // 📜 Pagination handler
  const handleEndReached = useCallback(() => {
    if (!isLoading && !endReached) {
      setOffset((prev) => prev + limit);
    }
  }, [isLoading, endReached, limit]);

  // 🧩 Allow parent manual load-more when scrolling disabled
  useEffect(() => {
    if (!scrollEnabled && typeof externalLoadMore === "function") {
      externalLoadMore(() => {
        if (!isLoading && !endReached) {
          setOffset((prev) => prev + limit);
        }
      });
    }
  }, [externalLoadMore, scrollEnabled, isLoading, endReached, limit]);

  // 🧱 Render doctor item
  const renderItem = useCallback(({ item }) => <DoctorCard doctor={item} showBook />, []);
  const keyExtractor = useCallback((item, index) => item?._id ?? `key-${index}`, []);

  // 🌀 Footer loader
  const renderFooter = () =>
    isLoading && doctors.length > 0 ? (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    ) : null;

  // 💬 UI Rendering
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
          <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
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
