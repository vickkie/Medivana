import React, { useEffect, useCallback, useState } from "react";
import { View, Text, FlatList, SafeAreaView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../constants";
import useFetch from "../../hook/useFetch";
import DoctorCard from "./DoctorCard";
import styles from "./styles/doctorsList.js";

const CACHE_KEY = "cached_doctors";

const DoctorsList = ({ refreshList, setRefreshList }) => {
  const { data, isLoading, error, refetch } = useFetch("medic");
  const [refreshing, setRefreshing] = useState(false);
  const [doctors, setDoctors] = useState([]);

  // Cache fresh API data
  useEffect(() => {
    if (Array.isArray(data) && data.length) {
      setDoctors(data);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data)).catch(console.error);
    }
  }, [data]);

  // Load cache if there's an error or no data
  useEffect(() => {
    const loadCachedDoctors = async () => {
      if (!data || data.length === 0 || error) {
        try {
          const cached = await AsyncStorage.getItem(CACHE_KEY);
          if (cached) setDoctors(JSON.parse(cached));
        } catch (e) {
          console.error("Failed to load cached doctors", e);
        }
      }
    };
    loadCachedDoctors();
  }, [data, error]);

  useEffect(() => {
    if (refreshList) refetch();
    return () => setRefreshList(false);
  }, [refreshList]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = useCallback(({ item }) => <DoctorCard doctor={item} showBook={true} />, []);
  const keyExtractor = useCallback((item) => item._id, []);

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && !doctors.length ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : doctors.length === 0 ? (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>No doctors available</Text>
          <TouchableOpacity onPress={refetch} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          showsVerticalScrollIndicator={true}
        />
      )}
    </SafeAreaView>
  );
};

export default DoctorsList;
