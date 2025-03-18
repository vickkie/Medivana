import React, { useEffect, useState, useContext } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Image, TextInput, StyleSheet } from "react-native";
import { AuthContext } from "../components/auth/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../constants";
import Icon from "../constants/icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ScrollView } from "react-native-gesture-handler";
import LottieView from "lottie-react-native";

import { BACKEND_PORT } from "@env";

const ChatListScreen = ({}) => {
  const BACKEND_URL = BACKEND_PORT;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData, userLogin, hasRole } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      const userRole = userData?.position || "customer";
      const response = await fetch(
        `${BACKEND_URL}/api/chat/chat-users?userId=${userData._id}&role=${userRole}&search=${searchQuery}`
      );

      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      setUsers(data);
      // console.log(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (user) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/start-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: userData._id,
          senderRole: userData.position ? "staff" : "customer", // Default to "customer"
          receiverId: user._id,
          receiverRole: user.position ? "staff" : "customer",
        }),
      });

      if (!response.ok) throw new Error("Failed to start chat");

      const chat = await response.json();
      navigation.navigate("ChatScreen", { chatId: chat._id, chatWith: user, userData });
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.themey} />
      <View style={{ marginTop: 0 }}>
        <View style={styles.wrapper}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
            <Icon name="backbutton" size={26} />
          </TouchableOpacity>
          <View style={styles.upperRow}>
            <View style={styles.upperButtons}>
              <Text style={styles.heading}>Contacts</Text>
            </View>
            <TouchableOpacity onPress={() => {}} style={styles.outWrap}>
              <Icon name="bellfilled" size={26} />
            </TouchableOpacity>
            <View style={styles.lowerheader}>
              <Text style={styles.statement}>Select contact chat</Text>
            </View>
          </View>
        </View>

        <View>
          <View style={{ marginTop: 130 }}>
            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search user"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.searchButton}>
                <Icon name="search" size={26} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.containLottie}>
                <View style={styles.animationWrapper}>
                  <LottieView source={require("../assets/data/loading.json")} autoPlay loop style={styles.animation} />
                </View>
              </View>
            ) : (
              <FlatList
                style={styles.flatlist}
                data={users}
                keyExtractor={(item) => item?._id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => startChat(item)}
                    style={{ flexDirection: "row", alignItems: "center", padding: 10 }}
                  >
                    {item?.profilePicture ? (
                      <Image
                        source={{ uri: item?.profilePicture }}
                        style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
                      />
                    ) : (
                      <Image source={require("../assets/images/userDefault.webp")} style={styles.profilePicture} />
                    )}

                    <Text style={{ fontSize: 18 }}>
                      {item?.fullname || item?.username} ({item?.position || "customer"})
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.containLottie}>
                    <View style={styles.animationWrapper}>
                      <LottieView
                        source={require("../assets/data/nodata.json")}
                        autoPlay
                        loop={false}
                        style={styles.animation}
                      />
                    </View>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChatListScreen;

const styles = StyleSheet.create({
  carouselContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.themey,
    height: 90,
  },
  textStyles: {
    fontFamily: "bold",
    fontSize: 19,
  },
  appBarWrapper: {
    // marginHorizontal: 4,
    // marginTop: SIZES.small - 2,
    backgroundColor: COLORS.white,
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
    color: COLORS.lightWhite,
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
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonWrap2: {
    backgroundColor: COLORS.hyperlight,
    borderRadius: 100,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  topWelcomeWrapper: {
    minHeight: 130,
    backgroundColor: COLORS.themew,
    marginHorizontal: 4,
    borderRadius: SIZES.medium,
    // ...SHADOWS.small,
    // marginBottom: 2,
    // shadowColor: COLORS.lightWhite,
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
    color: "#BABDB6",
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
    color: "#BABDB6",
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
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
  },
  topSafeview: {
    flex: 1,
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
    marginTop: SIZES.xxSmall,
  },
  profilePicture: {
    height: 52,
    width: 52,
    borderRadius: 100,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 16,
    color: "black",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  wrapper: {
    flexDirection: "column",
    position: "absolute",
    top: 2,
  },
  backBtn: {
    left: 10,
  },
  buttonView: {
    backgroundColor: COLORS.themew,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
    transform: [{ rotate: "180deg" }],
  },
  buttonWrap: {
    backgroundColor: COLORS.themeg,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    zIndex: 9,
    top: 10,
    left: 10,
  },
  upperRow: {
    width: SIZES.width - 12,
    marginHorizontal: 6,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.large,
    top: SIZES.xxSmall,
    zIndex: 2,
    minHeight: 70,
  },
  upperButtons: {
    width: SIZES.width - 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SIZES.medium,
  },
  topprofileheading: {
    fontSize: SIZES.medium,
    textAlign: "center",
    color: COLORS.themeb,
    fontFamily: "semibold",
  },
  outWrap: {
    backgroundColor: COLORS.themeg,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 5,
    right: 10,
  },
  lowerheader: {
    flexDirection: "column",
    justifyContent: "flex-start",
    width: SIZES.width - 20,
    marginTop: 5,
    paddingTop: SIZES.xSmall,
    paddingBottom: 20,
  },
  heading: {
    fontFamily: "bold",
    textTransform: "capitalize",
    fontSize: SIZES.xLarge + 3,
    textAlign: "left",
    color: COLORS.themeb,
    marginStart: 20,
  },
  statement: {
    fontFamily: "regular",
    paddingLeft: 20,
    paddingVertical: 5,
    color: COLORS.gray2,
    textAlign: "center",
  },
  list: {
    paddingHorizontal: 10,
    gap: 10,
    marginVertical: 10,
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "column",
    padding: 15,
  },
  image: {
    position: "absolute", // Default styles, overridden by `parsedStyle`
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.themeb,
    fontFamily: "semibold",
  },
  shippingId: {
    padding: 5,
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
    fontSize: 14,
    color: "#cccca0",
  },
  detailsWrapper: {
    width: SIZES.width - 12,
    marginHorizontal: 6,
    marginTop: SIZES.xSmall,
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
    minHeight: SIZES.height / 3,
    // alignItems: "center",
    // justifyContent: "center",
    // backgroundColor: "green",
  },
  searchBarContainer: {
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    padding: 8,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 100,
    backgroundColor: COLORS.themew,
  },
  searchButton: {
    position: "absolute",
    right: 17,
  },
  containLottie: {
    justifyContent: "center",
    alignItems: "center",
    width: SIZES.width - 20,
    flex: 1,
  },
  animationWrapper: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  flatlist: {
    marginBottom: 190,
  },
});
