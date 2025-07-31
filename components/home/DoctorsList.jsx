import React, { useEffect, useCallback, useState } from "react";
import { View, Text, FlatList, SafeAreaView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { COLORS, SIZES } from "../../constants";
import useFetch from "../../hook/useFetch";
import DoctorCard from "./DoctorCard";
import styles from "./styles/doctorsList.js";

const DoctorsList = ({ refreshList, setRefreshList }) => {
  const { data, isLoading, error, refetch } = useFetch("medic");
  const [refreshing, setRefreshing] = useState(false);
  const doctors = Array.isArray(data) ? data : [];

  useEffect(() => {
    if (refreshList) refetch();
    return () => setRefreshList(false);
  }, [refreshList]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = useCallback(({ item }) => <DoctorCard doctor={item} />, []);
  const keyExtractor = useCallback((item) => item._id, []);

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : error ? (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>Failed to load doctors</Text>
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
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default DoctorsList;
