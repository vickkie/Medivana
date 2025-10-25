import React, { useState, useContext, useEffect, useCallback, useRef } from "react";
import { Text, TouchableOpacity, View, ScrollView, Image, StatusBar, StyleSheet, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Welcome } from "../components/home";
import Headings from "../components/home/Headings";
import Icon from "../constants/icons";
import { AuthContext } from "../components/auth/AuthContext";
import HomeMenu from "../components/bottomsheets/HomeMenu";
import DoctorsCategoriesRow from "../components/home/DoctorCategoriesRow";
import { COLORS, SIZES } from "../constants";
import { RefreshControl } from "react-native-gesture-handler";
import DoctorsList from "../components/home/DoctorsList";
import useFetch from "../hook/useFetch";

const Home = () => {
  const { userData, userLogin } = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();
  const { data, refetch, statusCode, isLoading, errorMessage } = useFetch(`notification/user/unread/${userData?._id}`);

  const [refreshList, setRefreshList] = useState(false);
  const [selectedCat, setSelectedCat] = useState("");
  const [doctorCount, setDoctorCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Ref to manually trigger pagination in DoctorsList
  const loadMoreRef = useRef(null);

  useEffect(() => {
    if (route.name !== "Bottom Navigation") {
      navigation.navigate("Bottom Navigation");
    }
  }, [route.name, navigation]);

  const renderProfilePicture = () => {
    if (!userLogin) {
      return <Icon name="user" size={24} color="#000" />;
    }
    return userData?.profilePicture ? (
      <Image source={{ uri: userData?.profilePicture }} style={styles.profilePicture} />
    ) : (
      <Image source={require("../assets/images/userDefault.webp")} style={styles.profilePicture} />
    );
  };

  const BottomSheetRef = useRef(null);
  const openMenu = () => BottomSheetRef.current?.present();

  const NotificationBell = ({ count }) => {
    return (
      <View style={{ borderRadius: 40 }}>
        <Icon name="bellfilled" size={24} color="#fff" />
        <NotificationBadge count={count} />
      </View>
    );
  };

  const refetchData = useCallback(() => {
    refetch();
  }, []); // stable

  useFocusEffect(
    useCallback(() => {
      refetchData();
    }, [refetchData])
  );

  const NotificationBadge = ({ count = 0 }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }, [count]);

    const scale = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1],
    });

    return (
      <Animated.View
        style={{
          position: "absolute",
          top: -6,
          right: -6,
          backgroundColor: "#fff",
          borderRadius: 10,
          paddingHorizontal: 5,
          minWidth: 18,
          height: 18,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "orange",
          transform: [{ scale }],
        }}
      >
        <Text
          style={{
            color: "orange",
            fontWeight: "bold",
            fontSize: 12,
            textAlign: "center",
          }}
          numberOfLines={1}
        >
          {count > 99 ? "99+" : count}
        </Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.topSafeview}>
      <HomeMenu ref={BottomSheetRef} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.themey} />

      <View style={styles.topWelcomeWrapper}>
        <View style={styles.appBarWrapper}>
          <View style={styles.appBar}>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity onPress={openMenu} style={styles.buttonWrap2}>
                {renderProfilePicture()}
              </TouchableOpacity>
              <View style={{ marginLeft: 7, justifyContent: "center" }}>
                <Text style={styles.welcomeText2}>Hello, {userData ? userData.username : "There"}</Text>
                <Text style={styles.welcomeText}>{userData ? "Welcome Back" : "Start journey today"}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.buttonWrap} onPress={() => navigation.navigate("Message")}>
              <NotificationBell count={data?.unreadCount ?? 0} />
            </TouchableOpacity>
          </View>

          <View style={{ padding: 7 }}>
            <Welcome setSearchQuery={setSearchQuery} searchQuery={searchQuery} />
          </View>
        </View>
      </View>

      <View style={{ flex: 1, borderRadius: 45, marginBottom: 30 }}>
        <ScrollView
          onScroll={({ nativeEvent }) => {
            const paddingToBottom = 20;
            const isEnd =
              nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
              nativeEvent.contentSize.height - paddingToBottom;

            if (isEnd && loadMoreRef.current) {
              // console.log("🔹 Parent scroll hit bottom → loading more");
              loadMoreRef.current(); // 🔥 call DoctorList’s load more
            }
          }}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl onRefresh={() => setRefreshList(true)} refreshing={refreshList} />}
        >
          <View style={styles.lowerWelcomeWrapper}>
            <View style={styles.lowerWelcome}>
              <Headings heading={"Doctors Categories"} />
              <DoctorsCategoriesRow
                refreshList={refreshList}
                setRefreshList={setRefreshList}
                backColor={COLORS.themeg}
                setSelectedCat={setSelectedCat}
              />

              <Headings heading={selectedCat || "Popular Doctors"} />

              {/* 👇 We pass the callback setter down */}
              <DoctorsList
                refreshList={refreshList}
                setRefreshList={setRefreshList}
                limit={8}
                field="medic"
                speciality={selectedCat}
                setDoctorCount={setDoctorCount}
                searchQuery={searchQuery}
                scrollEnabled={false}
                externalLoadMore={(cb) => (loadMoreRef.current = cb)}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  carouselContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.themey,
    height: 100,
  },
  textStyles: {
    fontFamily: "bold",
    fontSize: 19,
  },
  appBarWrapper: {
    // marginHorizontal: 4,
    // marginTop: SIZES.small - 2,
    backgroundColor: COLORS.themey,
    borderRadius: SIZES.medium,
    marginTop: 10,
  },
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    width: SIZES.width - 20,
  },
  location: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
    color: COLORS.gray,
  },
  cartContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  cartNumber: {
    position: "absolute",
    fontFamily: "regular",
    fontWeight: "800",
    fontSize: 13,
    color: COLORS.lightthemey,
    borderRadius: 700,
    backgroundColor: COLORS.themey,
  },
  cartWrapper: {
    zIndex: 11,
    backgroundColor: COLORS.themey,
    justifyContent: "center",
    padding: 10,
    borderRadius: 100,
    position: "absolute",
    right: 40,
    top: 4,
    zIndex: 77,
    alignItems: "center",
  },
  buttonWrap: {
    backgroundColor: COLORS.hyperlight,
    padding: 13,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonWrap2: {
    backgroundColor: COLORS.hyperlight,
    borderRadius: 100,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  topWelcomeWrapper: {
    minHeight: 110,
    backgroundColor: COLORS.themey,
    borderBottomLeftRadius: SIZES.medium,
    borderBottomRightRadius: SIZES.medium,
  },
  greeting: {
    flex: 1,
    justifyContent: "center",
    // alignItems: "center",
    paddingHorizontal: 20,
  },
  greetingMessage: {
    fontFamily: "bold",
    fontSize: SIZES.xxLarge,
  },
  hello: {
    fontFamily: "regular",
    color: COLORS.themew,
  },
  username: {
    fontFamily: "semibold",
    color: COLORS.themeb,
  },
  sloganWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    // alignItems: "center",
  },
  slogan: {
    fontFamily: "regular",
    color: COLORS.themew,
    fontSize: SIZES.medium,
  },
  lowerWelcome: {
    backgroundColor: COLORS.themew,
    marginHorizontal: 4,
    borderTopLeftRadius: SIZES.medium,
    borderTopRightRadius: SIZES.medium,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  lowerWelcomeWrapper: {
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
  },
  topSafeview: {
    flex: 1,
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
    // marginTop: SIZES.xxSmall,
  },
  profilePicture: {
    height: 42,
    width: 42,
    padding: 1,
    borderRadius: 100,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "themey",
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 16,
    color: "black",
  },
  welcomeText: {
    fontFamily: "medium",
    color: COLORS.themew,
    fontSize: SIZES.medium,
  },
  welcomeText2: {
    fontFamily: "semibold",
    color: COLORS.themew,
    fontSize: SIZES.large,
  },
});
