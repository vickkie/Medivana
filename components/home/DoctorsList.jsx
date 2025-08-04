import React, { useEffect, useCallback, useState } from "react";
import { View, Text, FlatList, SafeAreaView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../constants";
import useFetch from "../../hook/useFetch";
import DoctorCard from "./DoctorCard";
import styles from "./styles/doctorsList.js";

const CACHE_KEY = "cached_doctors";

const DoctorsList = ({
  refreshList,
  setRefreshList,
  field = "medic",
  limit = 8,
  speciality = "",
  setDoctorCount,
  searchQuery = "",
}) => {
  const [offset, setOffset] = useState(0);
  const [endReached, setEndReached] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [doctors, setDoctors] = useState([]);

  // Build URL with current params
  const url = `${field}?limit=${limit}&specialization=${speciality}&search=${searchQuery}&offset=${offset}`;

  // Our fetch hook will re-run whenever `url` changes
  const { data, isLoading, error, refetch, statusCode } = useFetch(url);

  // 1️⃣ When data arrives: append or replace
  useEffect(() => {
    if (statusCode === 200 && Array.isArray(data?.doctors)) {
      if (offset === 0) {
        setDoctors(data.doctors);
      } else {
        setDoctors((prev) => [...prev, ...data.doctors]);
      }

      setDoctorCount(data.totalCount);

      // cache first page only
      if (offset === 0) {
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data.doctors)).catch(console.error);
      }
      // detect end of list
      if (data.doctors.length < limit) {
        setEndReached(true);
      }
    }
  }, [data, statusCode, offset, limit, setDoctorCount]);

  // 2️⃣ Reset when filters/search change (but don't call refetch here — URL change will auto-fetch)
  useEffect(() => {
    setOffset(0);
    setEndReached(false);
    // clear current list so UI shows loading state
    setDoctors([]);
  }, [field, limit, speciality, searchQuery]);

  // 3️⃣ Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setOffset(0);
    setEndReached(false);
    // refetch uses latest URL (offset=0)
    refetch();
    setRefreshing(false);
  }, [refetch]);

  // 4️⃣ If first-page fetch fails, load cache
  useEffect(() => {
    if (offset === 0 && (error || !data?.doctors?.length)) {
      AsyncStorage.getItem(CACHE_KEY)
        .then((json) => {
          if (json) setDoctors(JSON.parse(json));
        })
        .catch(console.error);
    }
  }, [error, data, offset]);

  // 5️⃣ External refresh trigger
  useEffect(() => {
    if (refreshList) {
      onRefresh();
      setRefreshList(false);
    }
  }, [refreshList, onRefresh, setRefreshList]);

  const renderItem = useCallback(({ item }) => <DoctorCard doctor={item} showBook />, []);
  const keyExtractor = useCallback((item) => item._id, []);

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && doctors.length === 0 ? (
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
          showsVerticalScrollIndicator
          scrollEnabled
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (!endReached && !isLoading) {
              setOffset((prev) => prev + limit);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default DoctorsList;

// i want continuos loading as we scroll not all at once in api

// import React, { useEffect, useCallback, useState, useRef } from "react";
// import { View, Text, FlatList, SafeAreaView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { COLORS } from "../../constants";
// import useFetch from "../../hook/useFetch";
// import DoctorCard from "./DoctorCard";
// import styles from "./styles/doctorsList.js";

// const CACHE_KEY = "cached_doctors";

// const DoctorsList = ({
//   refreshList,
//   setRefreshList,
//   field = "medic",
//   limit = 8,
//   speciality = "",
//   setDoctorCount,
//   searchQuery = "",
// }) => {
//   console.log(limit, speciality, searchQuery);
//   const [loading, setLoading] = useState(false);
//   const [limits, setLimits] = useState(limit);
//   const [offset, setOffset] = useState(0);
//   const [page, setPage] = useState(page || "");
//   const [sortOrder, setsortOrder] = useState("");
//   const [endReached, setEndReached] = useState(false);

//   const [refreshing, setRefreshing] = useState(false);
//   const [doctors, setDoctors] = useState([]);

//   const scrollRef = useRef(null);
//   const [showScrollTopButton, setShowScrollTopButton] = useState(false);

//   const params = { limit, offset: reset ? 0 : offset };

//   const { data, isLoading, error, refetch, statusCode } = useFetch(
//     `${field}?limit=${limits}&specialization=${speciality}&search=${searchQuery}&offset=${offset}`
//   );
//   // Cache fresh API data
//   useEffect(() => {
//     if (statusCode === 200 && Array.isArray(data?.doctors)) {
//       setDoctors(data?.doctors);
//       setDoctorCount(data?.totalCount);
//       AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data.doctors)).catch(console.error);
//     }
//   }, [data]);

//   useEffect(() => {
//     setRefreshing(true);
//     refetch();
//     setRefreshing(false);
//   }, [field, limit, speciality]);

//   // Load cache if there's an error or no data
//   useEffect(() => {
//     const loadCachedDoctors = async () => {
//       if (!data?.doctors || data?.doctors.length === 0 || error) {
//         try {
//           const cached = await AsyncStorage.getItem(CACHE_KEY);
//           if (cached) setDoctors(JSON.parse(cached));
//         } catch (e) {
//           console.error("Failed to load cached doctors", e);
//         }
//       }
//     };
//     loadCachedDoctors();
//   }, [data, error]);

//   useEffect(() => {
//     if (refreshList) refetch();
//     return () => setRefreshList(false);
//   }, [refreshList]);

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     refetch();
//     setRefreshing(false);
//   }, [refetch]);

//   const renderItem = useCallback(({ item }) => <DoctorCard doctor={item} showBook={true} />, []);
//   const keyExtractor = useCallback((item) => item?._id, []);

//   return (
//     <SafeAreaView style={styles.container}>
//       {isLoading && !doctors.length ? (
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       ) : doctors.length === 0 ? (
//         <View style={styles.messageContainer}>
//           <Text style={styles.messageText}>No doctors available</Text>
//           <TouchableOpacity onPress={refetch} style={styles.retryButton}>
//             <Text style={styles.retryButtonText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <FlatList
//           scrollEnabled={false}
//           data={doctors}
//           keyExtractor={keyExtractor}
//           renderItem={renderItem}
//           contentContainerStyle={styles.listContent}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
//           showsVerticalScrollIndicator={true}
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default DoctorsList;
